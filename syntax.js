module.exports = {
    statements: { 
        Program: 'body'
      , ExpressionStatement: 'expression'
    }
    // {String} expressions are the actual values and thus have no children
    // {Array} expressions contain children to be followed when walking the tree
  , expressions: {
        ThisExpression: 'this'
//      , BinaryExpression: [ 'left', 'operator', 'right' ]
//      , AssignmentExpression: [ 'left', 'operator', 'right' ]
    }
  , values: [
      'Literal'
    ]
  , names: [
      'Identifier'
    ]
};
