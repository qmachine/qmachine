//- JavaScript source code

//- test-1.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012
//                                                  ~~ last updated 10 Dec 2012

(function () {
    'use strict';

    /*global avar, oops, puts, run_next_test */

    /*jslint indent: 4, maxlen: 80 */

    var x = avar({val: 'Test 1: Success.'});

    x.on('error', oops);

    x.Q(function (evt) {
     // This function runs locally because it closes over `puts`.
        puts(this.val);
        return evt.exit();
    });

    x.Q(run_next_test);

    return;

}());

//- vim:set syntax=javascript:
