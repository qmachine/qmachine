//- JavaScript source code

//- test-2.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function () {
    'use strict';

    /*global oops: false, puts, run_next_test: false */

    /*jslint indent: 4, maxlen: 80 */

    ('Test 2: Success.').Q(function (evt) {
     // This function runs locally because it closes over `puts`.
        puts(this.val);
        return evt.exit();
    }).Q(run_next_test).onerror = oops;

    return;

}());

//- vim:set syntax=javascript:
