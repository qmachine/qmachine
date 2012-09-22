//- JavaScript source code

//- test-18.js ~~
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
     // This function needs documentation.
        puts(key, val);
        return;
    });

    y.onready = function (evt) {
     // This function needs documentation.
        if (n === x) {
            return evt.fail('Test 18: local `ply` of an avar-number');
        }
        puts('Test 18: Success.');
        return evt.exit();
    };

    y.onready = run_next_test;

    return;

}());

//- vim:set syntax=javascript:
