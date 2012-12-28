//- JavaScript source code

//- test-3.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 27 Dec 2012

(function () {
    'use strict';

    /*global avar, oops, puts, run_next_test */

    /*jslint indent: 4, maxlen: 80 */

    var x = avar({val: 2});

    x.on('error', oops);

    x.Q(function (evt) {
     // This function needs documentation.
        x.val += 2;
        return evt.exit();
    });

    x.Q(function (evt) {
     // This function needs documentation.
        if (x.val !== 4) {
            return evt.fail('Test 3: Failed to compute "2 + 2".');
        }
        puts('Test 3: Success.');
        return evt.exit();
    });

    x.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
