'use strict';
/*jshint asi: true*/

var test = require('tap').test
  , util = require('util')
  , redeyed = require('..')
  , esprima = require('esprima')

function inspect (obj) {
  return util.inspect(obj, false, 5, true)
}

test('redeyed result has esprima results attached to string and splits results', function (t) {

  var code = 'var a = 3;'
    , conf = { Keyword: { _default: '_:-' } }

    , ast    =  esprima.parse(code, { tokens: true, range: true, tolerant: true })
    , tokens =  ast.tokens

    , string = redeyed(code, conf)
    , splits = redeyed(code, conf, { splits: true })

  //t.deepEquals(string.ast, ast, 'ast attached to string')
  //t.deepEquals(string.tokens, tokens, 'tokens attached to string')

  t.deepEquals(splits.ast, ast, 'ast attached to splits')
  t.deepEquals(splits.tokens, tokens, 'tokens attached to splits')

  t.end()
});
