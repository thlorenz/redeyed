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

function redeyed (code, opts) {
  var parsed = esprima.parse(code, { tokens: true, range: true })
    , tokens = parsed.tokens
    , lastSplitEnd = 0
    , splits = [];

  function addSplit (start, end, before, after) {
    if (start >= end) return;
    if (before && after)
      splits.push(before + code.slice(start, end) + after);
    else
      splits.push(code.slice(start, end));

    lastSplitEnd = end;
  }

  console.log(tokens);

  tokens.forEach(function (token) {
    var surroundForType = opts[token.type]
      , surroundDefault = opts.Default
      , surround
      , surroundBefore
      , surroundAfter 
      , start
      , end;
     
    if (surroundForType) {
      surround = surroundForType[token.value] || surroundForType;

      start = token.range[0];
      end = token.range[1] + 1;

      surroundBefore = surround._before || surroundForType._before || opts._before || '';
      surroundAfter  = surround._after  || surroundForType._after  || opts._after  || '';

      addSplit(lastSplitEnd, start - 1);
      addSplit(start, end, surroundBefore, surroundAfter);
    }
  });

  if (lastSplitEnd < code.length) {
    addSplit(lastSplitEnd, code.length);
  }

  return splits.join('');
}

// '\u001b[36m', '\u001b[39m'

var opts = {
    Keyword: {
        //'function' :  { before :  '__' ,  after :  '++' }
        'function' :  { _before :  '\u001b[36m' }
      , _before :  '\u001b[32m'
    }
  , _before: ''
  , _after :  '\u001b[39m' 

};

if (module.parent) return;

console.log(
  redeyed('' + 

function foo () {
  return true;
} 

+ '', opts)
);

