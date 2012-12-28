//- JavaScript source code

//- test-19.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 27 Dec 2012

(function () {
    'use strict';

    /*global Q, avar, identity, oops, ply, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x = avar({box: 'testing', val: 2});

    x.on('error', oops);

    x.Q(function (evt) {
     // This function will run remotely if it can.
        this.val += 2;
        return evt.exit();
    });

    x.Q(function (evt) {
     // This function runs locally because it closes over `x`.
        if (x.val !== 4) {
            return evt.fail('Test 19: remote `2 + 2` with specified box');
        }
        puts('Test 19: Success.');
        return evt.exit();
    });

    x.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
