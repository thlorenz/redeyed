var path    =  require('path')
  , fs      =  require('fs')
  , redeyed =  require('..')
  , vm = require('vm')
  ;

var samplePath =  path.join(__dirname, 'sources', 'log.js')
  , origCode   =  fs.readFileSync(samplePath, 'utf-8')
  , kinds = ['silly', 'info', 'warn', 'error' ]
  ;

function replaceConsole(s, idx, tokens) {
  var next      =  tokens[idx + 1].value
    , kind      =  tokens[idx + 2].value
    , openParen =  tokens[idx + 3].value
    , open
    , argIdx = idx + 3 
    , args = []
    , tkn
    , tknVal
    , tknType
    ;

  if (kind === 'log') kind = 'silly';

  // not a console.xxx(...) statement? -> just return original
  if (next !== '.' || !~kinds.indexOf(kind) || openParen !== '(') return s;

  // resolve arguments to console.xxx all args from ( to )
  open = 1;
  while (open) {
    tkn = tokens[++argIdx];
    tknVal = tkn.value;
    tknType = tkn.type;

    // count open parens vs. closed ones to handle things like console.log(new Error('..'));
    if (tknVal === '(') open++;
    if (tknVal === ')') open--;

    // change newFoo() to new Foo() and a,b to a, b
    if (tknType === 'Keyword' || tknVal === ',') tknVal += ' ';

    if (open) args.push(tknVal);
  }
  
  var result = [ 'log' , '.', kind, '(', '\'main-logger\'', ', ' ].concat(args).concat(')')
    , replacement = result.join('');
  
  // tell redeyed to skip the entire console.xxx(..) statement since we are replacing it all
  return { replacement: replacement, skip: result.length - 3 }; 
}

function transformAndRun () {
  var config = {
    Identifier: { console: replaceConsole }
  }
  , code = redeyed(origCode, config).code
  , initSandbox = { require: require }
  , context = vm.createContext(initSandbox);

  vm.runInContext(code, context, 'transformed-log.vm');
}

transformAndRun();


