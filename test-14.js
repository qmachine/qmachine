//- JavaScript source code

//- test-14.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 27 Dec 2012

(function () {
    'use strict';

    /*global avar, identity, oops, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x = when(2);

    x.on('error', oops);

    x.Q(function (evt) {
     // This function runs locally because it closes over `identity`.
        this.val = identity(this.val[0] * 2);
        return evt.exit();
    });

    x.Q(function (evt) {
     // This function needs documentation.
        if (x.val !== 4) {
            return evt.fail('Test 14: `when(2).onready` local');
        }
        puts('Test 14: Success.');
        return evt.exit();
    });

    x.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
