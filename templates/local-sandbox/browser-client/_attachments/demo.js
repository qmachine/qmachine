//- JavaScript source code

//- demo.js ~~
//                                                      ~~ (c) SRW, 27 Jun 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, x;

 // Definitions

    Q = Object.prototype.Q;

    x = Q.avar();

 // Demonstrations

    x.onerror = function (message) {
     // This function needs documentation.
        console.log('Error:', message);
        return;
    };

    x.onready = function (evt) {
     // This function needs documentation.
        this.val = 2 + 2;
        return evt.exit();
    };

    x.onready = function (evt) {
     // This function needs documentation.
        console.log('Results:', x.val);
        return evt.exit();
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
