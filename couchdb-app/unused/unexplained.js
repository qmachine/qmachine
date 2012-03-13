//- JavaScript source code

//- unexplained.js ~~
//                                                      ~~ (c) SRW, 12 Mar 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

 // Declarations

 // Definitions

 // Demonstrations

    ([1, 2, 3, 4, 5]).
        Q(Q.map(function (each) {
            return 3 * each;
        })).
        Q(function (evt) {
            console.log(this.val);
            return evt.exit();
        }).
        onerror = function (message) {
            console.error('Error:', message);
            return;
        };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
