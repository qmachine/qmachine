//- JavaScript source code

//- main.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, load_script, oops, puts;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    load_script = Q.lib;

    oops = function () {
     // This function needs documentation.
        global.console.error(Array.prototype.join.call(arguments, ' '));
        return;
    };

    puts = function () {
     // This function needs documentation.
        global.console.log(Array.prototype.join.call(arguments, ' '));
        return;
    };

 // Out-of-scope definitions

    global.avar = avar;

    global.identity = function (x) {
     // This function is useful for coercing a task to run locally.
        return x;
    };

    global.onload = function () {
     // This function needs documentation.
        var remaining, tests;
        remaining = 19;
        tests = avar({val: 1});
        tests.onerror = function (message) {
         // This function needs documentation.
            oops('Error:', message);
            return;
        };
        tests.onready = function (tests_evt) {
         // This function needs documentation.
            global.run_next_test = function (evt) {
             // This function needs documentation.
                remaining -= 1;
                tests.val += 1;
                evt.exit();
                return (remaining > 0) ? tests_evt.stay() : tests_evt.exit();
            };
            var temp = load_script('test-' + tests.val + '.js');
            temp.onerror = function (message) {
             // This function needs documentation.
                return tests_evt.fail(message);
            };
            return;
        };
        tests.onready = function (evt) {
         // This function needs documentation.
            puts('Done.');
            puts('(to run Test 20, run `Q.lib("./test-20.js");`)');
            return evt.exit();
        };
        return;
    };

    global.oops = oops;

    global.ply = Q.ply;

    global.puts = puts;

    global.when = Q.when;

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
