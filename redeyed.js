'use strict';
/*jshint laxbreak: true */

var esprima  =  require('esprima')
  , util     =  require('util')
  , toString =  Object.prototype.toString
  ;

function inspect (obj) {
  return util.inspect(obj, false, 5, true);
}

function isString (obj) {
  return toString.call(obj) == '[object String]';
}

function isNumber (obj) {
  return toString.call(obj) == '[object Number]';
}

function isObject (obj) {
  return toString.call(obj) == '[object Object]';
}

function isFunction (obj) {
  return toString.call(obj) == '[object Function]';
}

function surroundWith (before, after) {
  return function (s) { return before + s + after; };
}

function isNonCircular(key) { 
  return key !== '_parent'; 
}

function objectizeString (value) {
  var vals = value.split(':');

  if (0 === vals.length || vals.length > 2) 
    throw new Error(
      'illegal string config: ' + value +
      '\nShould be of format "before:after"'
    );

  if (vals.length === 1 || vals[1].length === 0) {
    return vals.indexOf(':') < 0 ? { _before: vals[0] } : { _after: vals[0] };
  } else {
    return { _before: vals[0], _after: vals[1] };
  }
}

function objectize (node) {

  // Converts 'bef:aft' to { _before: bef, _after: aft } 
  // and resolves undefined before/after from parent or root

  function resolve (value, key) {
    // resolve before/after from root or parent if it isn't present on the current node
    if (!value._parent) return undefined;
    
    // Immediate parent
    if (value._parent._default && value._parent._default[key]) return value._parent._default[key];

    // Root
    var root = value._parent._parent;
    if (!root) return undefined;

    return root._default ? root._default[key] : undefined;
  }

  function process (key) {
    var value = node[key];

    if (!value) return;
    if (isFunction(value)) return;

    // normalize all strings to objects
    if (isString(value)) {
      node[key] = value = objectizeString(value);
    }
    
    value._parent = node;
    if (isObject(value)) {
      if (!value._before && !value._after) return objectize (value);

      // resolve missing _before or _after from parent(s) 
      // in case we only have either one on this node
      value._before =  value._before || resolve(value, '_before');
      value._after  =  value._after  || resolve(value, '_after');
      
      return;
    } 

    throw new Error('nodes need to be either {String}, {Object} or {Function}.' + value + ' is neither.');
  }

  // Process _default ones first so children can resolve missing before/after from them
  if (node._default) process('_default');

  Object.keys(node)
    .filter(function (key) {
      return isNonCircular(key) 
        && node.hasOwnProperty(key)
        && key !== '_before' 
        && key !== '_after' 
        && key !== '_default';
    })
    .forEach(process);
}

function functionize (node) {
  Object.keys(node)
    .filter(function (key) { 
      return isNonCircular(key) && node.hasOwnProperty(key);
    })
    .forEach(function (key) {
      var value = node[key];

      if (isFunction(value)) return;

      if (isObject(value)) {

        if (!value._before && !value._after) return functionize(value);

        // at this point before/after were "inherited" from the parent or root
        // (see objectize)
        var before = value._before || '';
        var after = value._after || '';

        return node[key] = surroundWith (before, after);
      }
    });
}

function normalize (root) {
  objectize(root);
  functionize(root);
}

function redeyed (code, opts) {
  // remove shebang
  code = code.replace(/^\#\!.*/, '');

  var parsed = esprima.parse(code, { tokens: true, range: true, tolerant: true })
    , tokens = parsed.tokens
    , lastSplitEnd = 0
    , splits = [];

  // console.log(inspect(tokens));

  normalize(opts, opts);

  function addSplit (start, end, surround) {
    if (start >= end) return;
    if (surround)
      splits.push(surround(code.slice(start, end)));
    else
      splits.push(code.slice(start, end));

    lastSplitEnd = end;
  }

  tokens.forEach(function (token) {
    var surroundForType = opts[token.type]
      , surround
      , start
      , end;
     
    // At least the type (e.g., 'Keyword') needs to be specified for the token to be surrounded
    if (surroundForType) {

      // root defaults are only taken into account while resolving before/after otherwise
      // a root default would apply to everything, even if no type default was specified
      surround = surroundForType && surroundForType.hasOwnProperty(token.value)
        ? surroundForType[token.value] 
        : surroundForType._default;

      start = token.range[0];
      end = token.range[1] + 1;

      addSplit(lastSplitEnd, start);
      addSplit(start, end, surround);
    }
  });

  if (lastSplitEnd < code.length) {
    addSplit(lastSplitEnd, code.length);
  }

  return splits.join('');
}

module.exports = redeyed;
