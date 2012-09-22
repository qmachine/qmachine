//- JavaScript source code

//- test-12.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function () {
    'use strict';

    /*global avar, identity, oops, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x, y;

    x = avar({val: 2});

    y = 2;

    x.onerror = oops;

    when(x, y).areready = function (evt) {
     // This function runs locally because it closes over `identity`.
        this.val[0].val += identity(this.val[1]);
        return evt.exit();
    };

    x.onready = function (evt) {
     // This function needs documentation.
        if (x.val !== 4) {
            return evt.fail('Test 12: `when..areready` local `this` ...');
        }
        puts('Test 12: Success.');
        return evt.exit();
    };

    x.onready = run_next_test;

    return;

}());

//- vim:set syntax=javascript:
