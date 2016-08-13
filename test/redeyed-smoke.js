'use strict';
/*jshint asi: true*/

// applying redeyed to a bunch of files of contained libraries as a smoke test
var test     =  require('tap').test
  , path     =  require('path')
  , fs       =  require('fs')
  , readdirp =  require('readdirp')
  , redeyed  =  require('..')
  , node_modules =  path.join(__dirname, '..', 'node_modules')
  , tapdir       =  path.join(node_modules, 'tap')
  , esprimadir   =  path.join(node_modules, 'espree')

function shouldProcess (path, blacklist) {
    var include = true

    blacklist.every(function (entry) {
        return include = (path.indexOf(entry) < 0)
    });

    return include
}

test('tap', function (t) {
  var invalidTapFiles = [
      'services/localGit.js'
    , 'lib/handlebars/runtime.js'
    , 'handlebars/lib/precompiler.js'
    , 'handlebars/compiler/javascript-compiler.js'
    , 'slide/lib/async-map-ordered.js'
    , 'resolve/test/precedence/'
    , 'is-relative/index.js'
    , 'is-buffer/test/'
    , 'lodash/utility/'
  ]

  readdirp({ root: tapdir, fileFilter: '*.js', directoryFilter: '!node_modules' })
    .on('data', function (entry) {

      if (!shouldProcess(entry.fullPath, invalidTapFiles)) {
          return
      }

      var code = fs.readFileSync(entry.fullPath, 'utf-8')
        , result = redeyed(code, { Keyword: { 'var': '+:-' } }).code

      t.assert(~result.indexOf('+var-') || !(~result.indexOf('var ')), 'redeyed ' + entry.path)
    })
    .on('end', t.end.bind(t))
})

test('esprima', function (t) {

  readdirp({ root: esprimadir, fileFilter: '*.js', directoryFilter: '!node_modules' })
    .on('data', function (entry) {
      var invalidEspreeFiles = [
          'espree/lib/visitor-keys.js'
      ]

      if (!shouldProcess(entry.fullPath, invalidEspreeFiles)) {
          return
      }
      
      var code = fs.readFileSync(entry.fullPath, 'utf-8')
        , result = redeyed(code, { Keyword: { 'var': '+:-' } }).code

      t.assert(~result.indexOf('+var-') || !(~result.indexOf('var ')), 'redeyed ' + entry.path)
    })
    .on('end', t.end.bind(t))
})

test('redeyed', function (t) {

  readdirp({ root: path.join(__dirname, '..'), fileFilter: '*.js', directoryFilter: ['!.git', '!node_modules' ] })
    .on('data', function (entry) {
      
      var code = fs.readFileSync(entry.fullPath, 'utf-8')
        , result = redeyed(code, { Keyword: { 'var': '+:-' } }).code

        t.assert(~result.indexOf('+var-') || !(~result.indexOf('var ')), 'redeyed ' + entry.path)
    })
    .on('end', t.end.bind(t))
})
