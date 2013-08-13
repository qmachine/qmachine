//- JavaScript source code

//- test-16.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 13 Aug 2013

(function () {
    'use strict';

    /*global avar, identity, oops, ply, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80, unparam: true */

    var n, x, y;

    n = 0;

    x = 'Hello world!';

    y = avar({val: x});

    y.on('error', oops);

    ply(y).by(function (key, val) {
     // This function runs locally because it closes over `n`.
        n += 1;
        return;
    });

    y.Q(function (evt) {
     // This function needs documentation.
        if (n !== x.length) {
            return evt.fail('Test 16: local `ply..by` of an avar-string');
        }
        n = 0;
        return evt.exit();
    });

    y.Q(ply(function (key, val) {
     // This function runs locally because it closes over `n`.
        n += 1;
        return;
    }));

    y.Q(function (evt) {
     // This function needs documentation.
        if (n !== x.length) {
            return evt.fail('Test 16: local `ply` of an avar-string');
        }
        puts('Test 16: Success.');
        return evt.exit();
    });

    y.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
