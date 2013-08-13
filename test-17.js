//- JavaScript source code

//- test-17.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 13 Aug 2013

(function () {
    'use strict';

    /*global avar, identity, oops, ply, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80, unparam: true */

    var n, x, y;

    n = 0;

    x = 1;

    y = avar({val: x});

    y.on('error', oops);

    ply(y).by(function (key, val) {
     // This function should _never_ run anywhere.
        n += val;
        return;
    });

    y.Q(function (evt) {
     // This function needs documentation.
        if (n === x) {
            return evt.fail('Test 17: local `ply..by` of an avar-number');
        }
        return evt.exit();
    });

    y.Q(ply(function (key, val) {
     // This function should _never_ run anywhere.
        n += val;
        return;
    }));

    y.Q(function (evt) {
     // This function needs documentation.
        if (n === x) {
            return evt.fail('Test 17: local `ply` of an avar-number');
        }
        puts('Test 17: Success.');
        return evt.exit();
    });

    y.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
