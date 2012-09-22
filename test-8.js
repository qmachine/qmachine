//- JavaScript source code

//- test-8.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function () {
    'use strict';

    /*global avar, oops, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x, y;

    x = avar({val: 2});

    y = avar({val: 2});

    x.onerror = y.onerror = oops;

    when(x, y).onready = function (evt) {
     // This function needs documentation.
        x.val += y.val;
        return evt.exit();
    };

    x.onready = function (evt) {
     // This function needs documentation.
        if (x.val !== 4) {
            return evt.fail('Test 8: `when..onready` for two avars');
        }
        puts('Test 8: Success.');
        return evt.exit();
    };

    x.onready = run_next_test;

    return;

}());

//- vim:set syntax=javascript:
