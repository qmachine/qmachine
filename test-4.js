//- JavaScript source code

//- test-4.js ~~
//                                                      ~~ (c) SRW, 21 Sep 2012

(function () {
    'use strict';

    /*global avar, identity, oops, puts, run_next_test */

    /*jslint indent: 4, maxlen: 80 */

    (2).Q(function (evt) {
     // This function runs locally because it closes over `identity`.
        this.val += identity(2);
        return evt.exit();
    }).Q(function (evt) {
     // This function needs documentation.
        if (this.val !== 4) {
            return evt.fail('Test 4: local `(2).Q`');
        }
        puts('Test 4: Success.');
        return evt.exit();
    }).Q(run_next_test).onerror = oops;

    return;

}());

//- vim:set syntax=javascript:
