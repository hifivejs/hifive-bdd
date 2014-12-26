/**
 * BDD EDSL for the Specify framework.
 *
 * @module specify-dsl-bdd/lib/core
 */

// -- Dependencies -----------------------------------------------------
var Future = require('data.future');
var Maybe  = require('data.maybe');
var Async  = require('control.async')(Future);
var Lambda = require('core.lambda');
var Base   = require('boo').Base;
var adt    = require('adt-simple');

// -- Aliases ----------------------------------------------------------
var curry       = Lambda.curry;
var fail        = Future.rejected;
var fromPromise = Async.fromPromise;
var liftNode    = Async.liftNode;


// -- Core implementation ----------------------------------------------

/**
 * A list of supported implementations for asynchronous interfaces.
 *
 * @class
 * @summary
 * type Interface = Promise | Node | Future
 */
union Interface {
  Promise,
  Node,
  Future
} deriving (adt.Base)


/**
 * Constructs a DSL implementation for the given interface.
 *
 * @method
 * @private
 * @summary Interface → Specify.Core → DSL
 */
function makeDSL(asyncInterface, specify) {
  var Hook        = specify.Hook;
  var TestSuite   = specify.Test.Suite;
  var TestCase    = specify.Test.Case;

  // -- Objects --------------------------------------------------------

  /**
   * Represents a test Suite.
   *
   * @class
   * @summary
   * type Suite <| Boo.Base {
   *   name       :: String
   *   tests      :: [Suite | Test]
   *   beforeEach :: [Future(Error, Void)]
   *   afterEeach :: [Future(Error, Void)]
   *   beforeAll  :: [Future(Error, Void)]
   *   afterAll   :: [Future(Error, Void)]
   * }
   */
  var Suite = Base.derive({
    init: function _init(name) {
      this.name       = name;
      this.tests      = [];
      this.beforeEach = [];
      this.afterEach  = [];
      this.beforeAll  = [];
      this.afterAll   = [];
    }
  
    /**
     * Constructs a `Specify.Core.Test` from this representation.
     *
     * @name construct
     * @summary Void → Specify.Core.Test
     */
  , construct: function() {
      return TestSuite.create({ name       : this.name
                              , tests      : this.tests.map(λ[#.construct()])
                              , beforeAll  : Hook(this.beforeAll)
                              , afterAll   : Hook(this.afterAll)
                              , beforeEach : Hook(this.beforeEach)
                              , afterEach  : Hook(this.afterEach) })}
  })
  

  /**
   * Represents a test Case.
   *
   * @class
   * @summary
   * type Test <| Boo.Base {
   *   name    :: String
   *   test    :: Future(Error, Void)
   *   timeout :: Maybe(&lt;Number/ms&gt;)
   *   slow    :: Maybe(&lt;Number/ms&gt;)
   *   enabled :: Maybe(Case → Boolean)
   * }
   */
  var Test = Base.derive({
    init: function _init(name, test) {
      this.name    = name;
      this.test    = test;
      this.slow    = new Maybe.Nothing();
      this.timeout = new Maybe.Nothing();
      this.enabled = new Maybe.Nothing();
    }
  
    /**
     * Constructs a `Specify.Core.Test` from this representation.
     *
     * @name construct
     * @summary Void → Specify.Core.Test
     */
  , construct: function() {
      return TestCase.create({ name    : this.name
                             , test    : this.test
                             , slow    : this.slow
                             , timeout : this.timeout
                             , enabled : this.enabled })}

    /**
     * Enables this test.
     *
     * @name construct
     * @summary Void → Test
     */    
  , enable: function() {
      return this.enableWhen(λ(_) -> true);
    }
  
    /**
     * Disables this test.
     *
     * @name construct
     * @summary Void → Test
     */
  , disable: function() {
      return this.enableWhen(λ(_) -> false);
    }
  
    /**
     * Enables this test based on a predicate.
     *
     * @name construct
     * @summary (Case → Boolean) → Test
     */
  , enableWhen: function(f) {
      this.enabled = new Maybe.Just(f);
      return this;
    }
  

    /**
     * Defines the slow threshold for this test.
     *
     * @name construct
     * @summary &lt;Number/ms&gt; → Test
     */
  , setSlow: function(a) {
      this.slow = new Maybe.Just(a);
      return this;
    }
  
    /**
     * Defines the timeout limit for this test.
     *
     * @name construct
     * @summary &lt;Number/ms&gt; → Test
     */
  , setTimeout: function(a) {
      this.timeout = new Maybe.Just(a);
      return this;
    }
  })
  

  // -- Interface ------------------------------------------------------

  /**
   * Creates a Suite.
   *
   * @method
   * @summary Suite → String → (@Context => It, Spec → Void) → Suite
   */
  spec = curry(3, spec);
  function spec(parent, name, body) {
    var suite = Suite.make(name);
    body.call(makeContext(suite), it(suite), spec(suite));
    parent.tests.push(suite);
    return suite;
  }

  /**
   * Creates a synchronous test case.
   *
   * @method
   * @summary Suite → String → (Void → Void) → Test
   */
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

  /**
   * Creates an asynchronous test case using futures.
   *
   * @method
   * @summary Suite → String → Future(Error, Void) → Test
   */
  asyncFuture = curry(3, asyncFuture);
  function asyncFuture(parent, name, code) {
    var test = Test.make(name, code);
    parent.tests.push(test);
    return test;
  }

  /**
   * Creates an asynchronous test case using promises.
   *
   * @method
   * @summary Suite → String → (Void → Promise(Error, Void)) → Test
   */
  asyncPromise = curry(3, asyncPromise);
  function asyncPromise(parent, name, code) {
    var test = Test.make(name, new Future(function(reject, resolve) {
      fromPromise(code()).fork(reject, resolve)
    }));
    parent.tests.push(test);
    return test;
  }

  /**
   * Creates an asynchronous test case using Node-style callbacks.
   *
   * @method
   * @summary Suite → String → (Error → Void) → Test
   */
  asyncNode = curry(3, asyncNode);
  function asyncNode(parent, name, code) {
    var test = Test.make(name, liftNode(code)());
    parent.tests.push(test);
    return test;
  }

  /**
   * Defines code that should be ran before each test.
   *
   * @method
   * @summary Suite → Future(Error, Void) → Void
   */
  beforeEach = curry(2, beforeEach);
  function beforeEach(parent, code) {
    parent.beforeEach.push(code)
  }

  /**
   * Defines code that should be ran after each test.
   *
   * @method
   * @summary Suite → Future(Error, Void) → Void
   */
  afterEach = curry(2, afterEach);
  function afterEach(parent, code) {
    parent.afterEach.push(code)
  }

  /**
   * Defines code that should be ran before all tests.
   *
   * @method
   * @summary Suite → Future(Error, Void) → Void
   */
  beforeAll = curry(2, beforeAll);
  function beforeAll(parent, code) {
    parent.beforeAll.push(code)
  }

  /**
   * Defines code that should be ran after all tests.
   *
   * @method
   * @summary Suite → Future(Error, Void) → Void
   */
  afterAll = curry(2, afterAll);
  function afterAll(parent, code) {
    parent.afterAll.push(code)
  }


  /**
   * Constructs a Context for a Suite.
   *
   * @method
   * @summary Suite → Context
   */
  function makeContext(parent) {
    return { it           : it(parent)
           , spec         : spec(parent)
           , async        : selectAsync()(parent)
           , asyncPromise : asyncPromise(parent)
           , asyncNode    : asyncNode(parent)
           , asyncFuture  : asyncFuture(parent)
           , beforeEach   : beforeEach(parent)
           , afterEach    : afterEach(parent)
           , beforeAll    : beforeAll(parent)
           , afterAll     : afterAll(parent)
           }
  }

  function selectAsync() {
    return match asyncInterface {
      Promise => asyncPromise,
      Node    => asyncNode,
      Future  => asyncFuture
    }
  }

  /**
   * Constructs a Suite.
   *
   * @method
   * @summary String → (@Context => It, Spec → Void)
   */
  return function(name, body) {
    var root = Suite.make(name);
    body.call(makeContext(root), it(root), spec(root));
    return root.construct();
  };
}

// -- Exports ----------------------------------------------------------
var dsl = module.exports = curry(2, makeDSL);
dsl.promise = dsl(Promise);
dsl.node = dsl(Node);
dsl.future = dsl(Future);
dsl.Interface = Interface;
