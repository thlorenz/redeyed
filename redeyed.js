'use strict';
/*jshint laxbreak: true */

var esprima  =  require('esprima')
  , util     =  require('util')
  , toString =  Object.prototype.toString
  ;

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

function prependValTo (val) {
  return function (s) { return s + val; };
}

function appendValTo (val) {
  return function (s) { return val + s; };
}

function surroundWith (before, after) {
  return function (s) { return before + s + after; };
}

function normalizeStringConfig (value) {
  var vals = value.split(':');

  if (0 === vals.length || vals.length > 2) 
    throw new Error(
      'illegal string config: ' + value +
      '\nShould be of format "before:after"'
    );

  if (vals.length === 1) {
    return vals.indexOf(':') > 0 ? prependValTo(vals[0]) : appendValTo(vals[0]);
  } else {
    return surroundWith(vals[0], vals[1]);
  }
}

function normalize (parent) {
  console.log('normalizing', parent);
  Object.keys(parent)
    .forEach(function (key) {
      var value = parent[key];

      if (isFunction(value)) return;

      if (isObject(value)) {
        if (value._before || value._after) 
          return parent[key] = surroundWith (value._before || '', value._after || '');

        return normalize(value);
      }

      if (isString(value)) {
        parent[key] = normalizeStringConfig(value);
      }

    });
}


function redeyed (code, opts) {
  var parsed = esprima.parse(code, { tokens: true, range: true, tolerant: true })
    , tokens = parsed.tokens
    , lastSplitEnd = 0
    , splits = [];

  normalize(opts);

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
      , surroundDefault = opts._default
      , surround
      , surroundBefore
      , surroundAfter 
      , start
      , end;
     
    if (surroundForType) {
      surround = surroundForType[token.value] || surroundForType._default;

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

if (module.parent) return;


// '\u001b[36m', '\u001b[39m'

var opts = {
    Keyword: {
        //'function' :  { _before :  '__' , _after :  '++' }
        'function' :  { _before :  '\u001b[36m' }
      , _before :  '\u001b[32m'
    }
  , _before: ''
  , _after :  '\u001b[39m' 

};

console.log(
  redeyed('' + 

function foo () {
  return true;
} 

+ '', opts)
);

