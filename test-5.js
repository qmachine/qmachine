//- JavaScript source code

//- test-5.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function () {
    'use strict';

    /*global avar, oops, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x = avar({val: 2});

    x.onerror = oops;

    when(x).isready = function (evt) {
     // This function needs documentation.
        x.val += 2;
        return evt.exit();
    };

    x.onready = function (evt) {
     // This function needs documentation.
        if (x.val !== 4) {
            return evt.fail('Test 5: `when..isready` for one avar (duh)');
        }
        puts('Test 5: Success.');
        return evt.exit();
    };

    x.onready = run_next_test;

    return;

}());

//- vim:set syntax=javascript:
