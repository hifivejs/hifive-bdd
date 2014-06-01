// Copyright (c) 2014 Quildreen Motta
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * BDD interface in plain JavaScript for Hi-Five.
 *
 * @module hifive-bdd/core
 */

// -- Dependencies -----------------------------------------------------
var Future = require('data.future');
var Maybe  = require('data.maybe');
var Async  = require('control.async');
var Lambda = require('core.lambda');
var Base   = require('boo').Base;

// -- Aliases ----------------------------------------------------------
var curry       = Lambda.curry;
var fail        = Async.fail;
var fromPromise = Async.fromPromise;
var liftNode    = Async.liftNode;


// -- Core implementation ----------------------------------------------
module.exports = function(asyncInterface, hifive) {
  var Hook        = hifive.Hook;
  var TestSuite   = hifive.Test.Suite;
  var TestCase    = hifive.Test.Case;
  
  // -- Objects --------------------------------------------------------
  var Suite = Base.derive({
    init: function _init(name) {
      this.name       = name;
      this.tests      = [];
      this.beforeEach = [];
      this.afterEach  = [];
      this.beforeAll  = [];
      this.afterAll   = [];
    }
  
  , construct: function() {
      return TestSuite.create({ name       : this.name
                              , tests      : this.tests.map(λ[#.construct()])
                              , beforeAll  : Hook(this.beforeAll)
                              , afterAll   : Hook(this.afterAll)
                              , beforeEach : Hook(this.beforeEach)
                              , afterEach  : Hook(this.afterEach) })}
  })
  
  var Test = Base.derive({
    init: function _init(name, test) {
      this.name    = name;
      this.test    = test;
      this.slow    = new Maybe.Nothing();
      this.timeout = new Maybe.Nothing();
      this.enabled = new Maybe.Nothing();
    }
  
  , construct: function() {
      return TestCase.create({ name    : this.name
                             , test    : this.test
                             , slow    : this.slow
                             , timeout : this.timeout
                             , enabled : this.enabled })}
  
  , enable: function() {
      return this.enableWhen(λ(_) -> true);
    }
  
  , disable: function() {
      return this.enableWhen(λ(_) -> false);
    }
  
  , enableWhen: function(f) {
      this.enabled = new Maybe.Just(f);
      return this;
    }
  
  , setSlow: function(a) {
      this.slow = new Maybe.Just(a);
      return this;
    }
  
  , setTimeout: function(a) {
      this.timeout = new Maybe.Just(a);
      return this;
    }
  })
  

  // -- Interface ------------------------------------------------------
  spec = curry(3, spec);
  function spec(parent, name, body) {
    var suite = Suite.make(name);
    body.call(makeContext(suite), it(suite), spec(suite));
    parent.tests.push(suite);
    return suite;
  }

  it = curry(3, it);
  function it(parent, name, code) {
    var action = new Future(function(reject, resolve) {
      try      { resolve(code()) }
      catch(e) { reject(e)}
    })

    var test = Test.make(name, action);
    parent.tests.push(test);
    return test;
  }

  asyncFuture = curry(3, asyncFuture);
  function asyncFuture(parent, name, code) {
    var test = Test.make(name, code);
    parent.tests.push(test);
    return test;
  }

  asyncPromise = curry(3, asyncPromise);
  function asyncPromise(parent, name, code) {
    var test = Test.make(name, fromPromise(code()));
    parent.tests.push(test);
    return test;
  }

  asyncNode = curry(3, asyncNode);
  function asyncNode(parent, name, code) {
    var test = Test.make(name, liftNode(code)());
    parent.tests.push(test);
    return test;
  }

  beforeEach = curry(2, beforeEach);
  function beforeEach(parent, code) {
    parent.beforeEach.push(code)
  }

  afterEach = curry(2, afterEach);
  function afterEach(parent, code) {
    parent.afterEach.push(code)
  }

  beforeAll = curry(2, beforeAll);
  function beforeAll(parent, code) {
    parent.beforeAll.push(code)
  }

  afterAll = curry(2, afterAll);
  function afterAll(parent, code) {
    parent.afterAll.push(code)
  }


  function makeContext(parent) {
    return { it         : it(parent)
           , spec       : spec(parent)
           , async      : selectAsync()(parent)
           , beforeEach : beforeEach(parent)
           , afterEach  : afterEach(parent)
           , beforeAll  : beforeAll(parent)
           , afterAll   : afterAll(parent)
           }
  }

  function selectAsync() {
    return asyncInterface === 'promise'?  asyncPromise
    :      asyncInterface === 'node'?     asyncNode
    :      /* otherwise */                asyncFuture }

  return function(name, body) {
    var root = Suite.make(name);
    body.call(makeContext(root), it(root), spec(root));
    return root.construct();
  };
}
