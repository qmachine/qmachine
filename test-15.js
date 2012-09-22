//- JavaScript source code

//- test-15.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function () {
    'use strict';

    /*global avar, identity, oops, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x = when(2, 2);

    x.onerror = oops;

    x.onready = function (evt) {
     // This function runs locally because it closes over `identity`.
        this.val = identity(this.val[0] + this.val[1]);
        return evt.exit();
    };

    x.onready = function (evt) {
     // This function needs documentation.
        if (x.val !== 4) {
            return evt.fail('Test 15: `when(2, 2).onready` local');
        }
        puts('Test 15: Success.');
        return evt.exit();
    };

    x.onready = run_next_test;

    return;

}());

//- vim:set syntax=javascript:
