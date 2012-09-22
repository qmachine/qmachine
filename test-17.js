//- JavaScript source code

//- test-17.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function () {
    'use strict';

    /*global avar, identity, oops, ply, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var n, x, y;

    n = 0;

    x = 1;

    y = avar({val: x});

    y.onerror = oops;

    ply(y).by(function (key, val) {
     // This function should _never_ run anywhere.
        n += val;
        return;
    });

    y.onready = function (evt) {
     // This function needs documentation.
        if (n === x) {
            return evt.fail('Test 17: local `ply..by` of an avar-number');
        }
        return evt.exit();
    };

    y.onready = ply(function (key, val) {
     // This function should _never_ run anywhere.
        n += val;
        return;
    });

    y.onready = function (evt) {
     // This function needs documentation.
        if (n === x) {
            return evt.fail('Test 17: local `ply` of an avar-number');
        }
        puts('Test 17: Success.');
        return evt.exit();
    };

    y.onready = run_next_test;

    return;

}());

//- vim:set syntax=javascript:
