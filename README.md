specify-dsl-bdd
===============

[![NPM version](https://img.shields.io/npm/v/specify-dsl-bdd.svg?style=flat)](https://npmjs.org/package/specify-dsl-bdd)
[![Dependencies status](https://img.shields.io/david/origamitower/specify-dsl-bdd.svg?style=flat)](https://david-dm.org/origamitower/specify-dsl-bdd)
![Licence](https://img.shields.io/npm/l/specify-dsl-bdd.svg?style=flat&label=licence)
![Experimental API](https://img.shields.io/badge/API_stability-exprimental-orange.svg?style=flat)


BDD EDSL for the [Specify][] framework.


## Example

```js
var core = require('specify-core');
// or .promise(core) if using Promises/A+, .future(core) if using Data.Future
var spec = require('specify-dsl-bdd').node(core);

var test = spec('Root spec', function(it, spec) {
  it('Should succeed', function(){ });
  spec('More things', function(it, spec) {
    this.async('Should fail', function(done) {
      done(new Error());
    })
  })
})
```


## Installation

```shell
$ npm install specify-dsl-bdd
```

## Licence

Copyright (c) 2013-2014 [Origami Tower](http://www.origamitower.com).

This module is part of the [Specify framework][Specify], and released under the
[MIT](http://origami-tower.mit-license.org/) licence.

[Specify]: https://github.com/origamitower/specify
