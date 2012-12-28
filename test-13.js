//- JavaScript source code

//- test-13.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 27 Dec 2012

(function () {
    'use strict';

    /*global avar, identity, oops, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x, y;

    x = 2;

    y = avar({val: 2});

    y.on('error', oops);

    when(x, y).Q(function (evt) {
     // This function runs locally because it closes over `identity`.
        this.val[1].val += identity(this.val[0]);
        return evt.exit();
    });

    y.Q(function (evt) {
     // This function needs documentation.
        if (y.val !== 4) {
            return evt.fail('Test 13: `when..areready` local `this` ...');
        }
        puts('Test 13: Success.');
        return evt.exit();
    });

    y.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
