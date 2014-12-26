/**
 * BDD EDSL for the Specify framework.
 *
 * @module specify-dsl-bdd/lib/index
 */

var curry         = require('core.lambda').curry
var makeInterface = curry(2, require('./core'))

var bdd = makeInterface('future')
bdd.promise = makeInterface('promise')
bdd.node    = makeInterface('node')

module.exports = bdd
