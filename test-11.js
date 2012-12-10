//- JavaScript source code

//- test-11.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 10 Dec 2012

(function () {
    'use strict';

    /*global avar, identity, oops, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x, y;

    x = avar({val: 2});

    y = avar({val: 2});

    x.on('error', oops);

    y.on('error', oops);

    when(x, y).Q(function (evt) {
     // This function runs locally because it closes over `identity`.
        this.val[0].val += identity(this.val[1].val);
        return evt.exit();
    });

    x.Q(function (evt) {
     // This function needs documentation.
        if (x.val !== 4) {
            return evt.fail('Test 11: `when..onready` local `this` 2 avars');
        }
        puts('Test 11: Success.');
        return evt.exit();
    });

    x.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
