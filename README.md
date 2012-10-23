# redeyed [![Build Status](https://secure.travis-ci.org/thlorenz/redeyed.png)](http://travis-ci.org/thlorenz/redeyed)

*Add color to your JavaScript!*

![frog](http://allaboutfrogs.org/gallery/photos/redeyes/red1.gif)

[Red Eyed Tree Frog](http://allaboutfrogs.org/info/species/redeye.html) (*Agalychnis callidryas*)

## What?

Takes JavaScript code, along with a config and returns the original code with tokens wrapped and/or replaced as configured.

## What for?

One usecase is adding metadata to your code that can then be used to apply syntax highlighting.

## How?

- copy the [config.js](https://github.com/thlorenz/redeyed/blob/master/config.js) and edit it in order to specify how
  certain tokens are to be surrounded/replaced
- replace the `undefined` of each token you want to configure with one of the following

### {String} config

`'before:after'`: wraps the token inside before/after 

### {Object} config

`{ _before: 'before', _after: 'after' }`: wraps token inside before/after

### {Function} config

`function (s) { return 'replacement for s'; }`: replaces the token with whatever is returned by the provided function

### Missing before and after resolution

For the `{String}` and `{Object}` configurations, 'before' or 'after' may be omitted:

- `{String}`: 
  - `'before:'` (omitting 'after')
  - `':after'` (omitting 'before')
- `{Object}`: 
  - `{ _before: 'before' }` (omitting '_after')
  - `{ _after: 'after' }` (omitting '_before')

In these cases the missing half is resolved as follows:

- from the `parent._default` (i.e., `Keyword._default`) if found
- otherwise from the `config._default` if found
- otherwise `''` (empty string)

### Transforming JavaScript code

***redeyed(code, config[, opts])***

Invoke redeyed with your **config**uration, a **code** snippet and maybe **opts** as in the below example:

```javascript
var redeyed = require('redeyed')
  , config = require('./path/to/config')
  , code = 'var a = 3;'
  , result;

// redeyed will throw an error (caused by the esprima parser) if the code has invalid javascript
try {
  result = redeyed(code, config);
  console.log(result);
} catch(err) {
  console.error(err);
}
```

***opts***:
```js
{ 
  // {Boolean}
  // if true returns the {Array} of pieces into which the transformed code is split up 
  // if false returns the splits join('')ed into a {String}
  splits: true|false
}
```

## redeyed in the wild

- [cardinal](https://github.com/thlorenz/cardinal): Syntax highlights JavaScript code with ANSI colors to be printed to
  the terminal

## Changelog

### 0.3

- passing more information into {Function} config
- API change: returning {Object} with code, ast and tokens attached instead of just a code {String}

### 0.2 

- upgrade to Esprima 1.0.0
