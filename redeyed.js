'use strict';

var syntax      =  require('./syntax')
  , statements  =  syntax.statements
  , expressions =  syntax.expressions
  , values      =  syntax.values
  , names       =  syntax.names
  , toString    =  Object.prototype.toString
  , padspaces   =  '                                        '
  , padlines    =  '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'
  ;

function isString (obj) {
  return toString.call(obj) == '[object String]';
}

function redeyed (ast, opts) {
  var acc = []
    , match
    , prevline = 1
    , prevcol = 0;

  function addText(value, node, parent) {
    // Conserve white space
    var padlinesLen
      , padcolsLen
      , padded = value;

    // console.log('start: %d, prevEnd: %d, padlen: %d', node.start, prevEnd, padlen);
    padlinesLen = node.start.line - prevline;

    if (padlinesLen) {
      padded = padded + padlines.slice(-padlinesLen);
      padcolsLen = node.start.column;
    } else {
      padcolsLen = node.start.column - prevcol;
    } 

    prevcol = node.end.column;

    padded = padcolsLen ? padspaces.slice(-padcolsLen) + padded : padded;

    return acc.push(padded);
  }

  (function walk (node, parent) {
    var tokenval
      , child
      , nowalk = [ 'type', 'start', 'end' ];

    if (isString(node)) {
     // console.log('string');
      return addText(node, parent);
    }

    tokenval = node.type && expressions[node.type];
    if (tokenval) {
      return addText(tokenval, node);
    }

    if (Array.isArray(node)) {
      console.log('array -> walking it');
      return node.forEach(function (n) {
        walk(n, node);
      });
    }

    //console.log('%s: %j', typeof node, node);

    Object.keys(node).forEach(function (key) {
      if (nowalk.indexOf(key) < 0) {
      //  console.log('walking', key);
        walk(node[key], node);
      }
    });

  })(ast, undefined);
  return acc.join('');
}

module.exports = redeyed;

if (module.parent) return;

var acorn = require('acorn').parse;

function roundTripped (code) {
  var ast = acorn(code, { linePositions: true });
  return redeyed(ast);
}

console.log('"' +
  roundTripped("this") +
  '"'
);
