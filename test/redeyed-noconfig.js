'use strict';
/*jshint asi: true*/

var test = require('tap').test
  , parse = require('acorn').parse
  , redeyed = require('..');

function roundTripped (code) {
  var ast = parse(code, { linePositions: true });
  return redeyed(ast);
}

[ 'this' 
, ' this' 
, '  this' 
, 'null' 
, ' null' 
, '42'
, '  42'
, '1+2'
, '1 + 2'
, '  1 + 2'
, '  1  +  2'
]
//.slice(-1)
.forEach(function (code) {
  test('"' + code + '"', function (t) {
    var rt = roundTripped(code);
    // console.log('code: "%s"\nround: "%s"', code, rt);
    t.equals(rt, code, '\b')
    t.end()
  })
})

