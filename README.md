hifive-bdd
==========

[![Build Status](https://secure.travis-ci.org/hifivejs/hifive-bdd.png?branch=master)](https://travis-ci.org/hifivejs/hifive-bdd)
[![NPM version](https://badge.fury.io/js/hifive-bdd.png)](http://badge.fury.io/js/hifive-bdd)
[![Dependencies Status](https://david-dm.org/hifivejs/hifive-bdd.png)](https://david-dm.org/hifivejs/hifive-bdd)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)


BDD interface in plain JavaScript for Hi-Five.


## Example

```js
( ... )
```


## Installing

The easiest way is to grab it from NPM. If you're running in a Browser
environment, you can use [Browserify][]

    $ npm install hifive-bdd


### Using with CommonJS

If you're not using NPM, [Download the latest release][release], and require
the `hifive-bdd.umd.js` file:

```js
var bdd = require('hifive-bdd')
```


### Using with AMD

[Download the latest release][release], and require the `hifive-bdd.umd.js`
file:

```js
require(['hifive-bdd'], function(bdd) {
  ( ... )
})
```


### Using without modules

[Download the latest release][release], and load the `hifive-bdd.umd.js`
file. The properties are exposed in the global `hifive.interfaces.bdd` object:

```html
<script src="/path/to/hifive-bdd.umd.js"></script>
```


### Compiling from source

If you want to compile this library from the source, you'll need [Git][],
[Make][], [Node.js][], and run the following commands:

    $ git clone git://github.com/hifivejs/hifive-bdd.git
    $ cd hifive-bdd
    $ npm install
    $ make bundle
    
This will generate the `dist/hifive-bdd.umd.js` file, which you can load in
any JavaScript environment.

    
## Documentation

You can [read the documentation online][docs] or build it yourself:

    $ git clone git://github.com/hifivejs/hifive-bdd.git
    $ cd hifive-bdd
    $ npm install
    $ make documentation

Then open the file `docs/index.html` in your browser.


## Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :)


## Licence

Copyright (c) 2014 Quildreen Motta.

Released under the [MIT licence](https://github.com/hifivejs/hifive-bdd/blob/master/LICENCE).

<!-- links -->
[Fantasy Land]: https://github.com/fantasyland/fantasy-land
[Browserify]: http://browserify.org/
[Git]: http://git-scm.com/
[Make]: http://www.gnu.org/software/make/
[Node.js]: http://nodejs.org/
[es5-shim]: https://github.com/kriskowal/es5-shim
[docs]: http://hifivejs.github.io/hifive-bdd
<!-- [release: https://github.com/hifivejs/hifive-bdd/releases/download/v$VERSION/hifive-bdd-$VERSION.tar.gz] -->
[release]: https://github.com/hifivejs/hifive-bdd/releases/download/v0.1.0/hifive-bdd-0.1.0.tar.gz
<!-- [/release] -->
