'use strict';

var syntax      =  require('./syntax')
  , statements  =  syntax.statements
  , expressions =  syntax.expressions
  , values      =  syntax.values
  , names       =  syntax.names
  , util        =  require('util')
  , toString    =  Object.prototype.toString
  , padspaces   =  '                                        '
  , padlines    =  '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'
  ;

function isString (obj) {
  return toString.call(obj) == '[object String]';
}

function isNumber (obj) {
  return toString.call(obj) == '[object Number]';
}

function stringifyBinaryExpression (node) {
  // Location of operator is not reported, so we need to use locations of left and right literals
  // in order to deduce the original padding around it.
  // If padding on left was different from padding on right, we equalize it since we wouldn't know
  // which side had the larger padding.
  
  // TODO: handle multi line expressions
  var left           =  node.left
    , right          =  node.right
    , operator       =  node.operator
    , leftlen        =  left.end.offset - left.start.offset
    , rightlen       =  right.end.offset - right.start.offset
    , totallen       =  right.end.offset - left.start.offset
    , operatorlen    =  operator.length
    , missing        =  totallen - (leftlen + operatorlen + rightlen)
    , padsize        =  Math.floor(missing / 2)
    , spaces
    , paddedOperator
    ;
  
  if (padsize > 0) {
    spaces         =  padspaces.slice(-padsize);
    paddedOperator =  spaces + operator + spaces;
  } else {
    paddedOperator = operator;
  }

  return left.value + paddedOperator + right.value;
}

function redeyed (ast, opts) {
  var acc = []
    , match
    , prevline = 1
    , prevcol = 0;

  console.log(util.inspect(ast.body, false, 6, true));

  function addText(value, node, parent) {
    // Conserve white space
    var padlinesLen
      , padcolsLen
      , padded;

    if (isString(value) || isNumber(value)) {
      padded = value;
    } else {
      if (value === null) padded = 'null';
    }
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

    //if (node.type) console.log(' ====> ', node.type);

    if (isString(node)) {
      return addText(node, parent);
    }

    tokenval = node.type && expressions[node.type];
    if (tokenval) {
      return addText(tokenval, node);
    }

    if (node.type && node.type === 'Literal') {
      return addText(node.value, node);
    }

    if (node.type && node.type === 'BinaryExpression') {
      return addText(stringifyBinaryExpression(node), parent);
    }

    if (Array.isArray(node)) {
      return node.forEach(function (n) {
        walk(n, node);
      });
    }

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
  var ast = acorn(code, { linePositions: true, sourceFile: true });
  return redeyed(ast);
}

console.log('"' +
  roundTripped('1 * 2  + 3') +
  '"'
);
