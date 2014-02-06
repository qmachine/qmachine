//- JavaScript source code

//- mapreduce.js ~~
//                                                      ~~ (c) SRW, 04 Feb 2014
//                                                  ~~ last updated 06 Feb 2014

(function (global) {
    'use strict';

 // Pragmas

    /*global */

    /*jshint camelcase: true, maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        avar, constructor, exit, fail, hasOwnProperty, map, mapReduce,
        prototype, Q, QUANAH, reduce, val
    */

 // Prerequisites

    if (global.hasOwnProperty('QUANAH') === false) {
        throw new Error('Quanah is missing.');
    }

 // Declarations

    var AVar, isFunction;

 // Definitions

    AVar = global.QUANAH.avar().constructor;

    isFunction = function (f) {
     // This function returns `true` if and only if input argument `f` is a
     // function. The second condition is necessary to avoid a false positive
     // in a pre-ES5 environment when `f` is a regular expression.
        return ((typeof f === 'function') && (f instanceof Function));
    };

 // Prototype definitions

    AVar.prototype.mapReduce = function (obj) {
     // This function's purpose should be obvious from its name. It must be
     // _foolproof_, so we begin by checking types.
        if ((this instanceof AVar) === false) {
            throw new TypeError('The `mapReduce` method is not generic.');
        }
        this.Q(function (evt) {
         // Having established that `this` is an avar, we check the types of
         // the original input argument `obj` and the `val` property of the
         // avar using Quanah to take advantage of error handling. The function
         // will run locally because it closes over `isFunction` and `obj`.
            if ((obj instanceof Object) === false) {
                return evt.fail('The `mapReduce` method expects ' +
                        'its input argument to be an object.');
            }
            if ((this.val instanceof Array) === false) {
                return evt.fail('The `mapReduce` method expects ' +
                        '`this.val` to be an array.');
            }
            if ((obj.hasOwnProperty('map') === false) ||
                    (isFunction(obj.map) === false)) {
                return evt.fail('No `map` function was specified.');
            }
            if ((obj.hasOwnProperty('reduce') === false) ||
                    (isFunction(obj.reduce) === false)) {
                return evt.fail('No `reduce` function was specified.');
            }
            // ...
            return evt.exit();
        });
        // ...
        return this;
    };

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';

 // This strict anonymous closure encapsulates the logic for detecting which
 // object in the environment should be treated as _the_ global object. It's
 // not as easy as you may think -- strict mode disables the `call` method's
 // default behavior of replacing `null` with the global object. Luckily, we
 // can work around that by passing a reference to the enclosing scope as an
 // argument at the same time and testing to see if strict mode has done its
 // deed. This task is not hard in the usual browser context because we know
 // that the global object is `window`, but CommonJS implementations such as
 // RingoJS confound the issue by modifying the scope chain, running scripts
 // in sandboxed contexts, and using identifiers like `global` carelessly ...

    /*global global: false */
    /*jslint indent: 4, maxlen: 80 */
    /*properties global */

    if (this === null) {

     // Strict mode has captured us, but we already passed a reference :-)

        return (typeof global === 'object') ? global : that;

    }

 // Strict mode isn't supported in this environment, but we need to make sure
 // we don't get fooled by Rhino's `global` function.

    return (typeof this.global === 'object') ? this.global : this;

}, null, this)));

//- vim:set syntax=javascript:
