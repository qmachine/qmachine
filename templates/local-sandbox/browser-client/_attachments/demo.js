//- JavaScript source code

//- demo.js ~~
//                                                      ~~ (c) SRW, 16 Jul 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint devel: true, indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, map, ply, reduce;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    map = Q.map;

    ply = Q.ply;

    reduce = Q.reduce;

 // Demonstrations

    Q.box = 'demo';

    (function () {

        var x = avar();

        x.onerror = function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        };

        x.onready = function (evt) {
         // This function needs documentation.
            this.val = 2 + 2;
            return evt.exit();
        };

        x.onready = function (evt) {
         // This function needs documentation.
            console.log('2 + 2 = ' + x.val);
            return evt.exit();
        };

        return;

    }());

    (function () {

        var x = avar({val: [1, 2, 3, 4, 5]});

        x.onerror = function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        };

        x.onready = function (evt) {
         // This function needs documentation.
            console.log('original:', JSON.stringify(x.val));
            return evt.exit();
        };

        x.onready = map(function (each) {
         // This function needs documentation.
            return 3 * each;
        });

        x.onready = function (evt) {
         // This function needs documentation.
            console.log('post-map:', x.val);
            return evt.exit();
        };

        x.onready = reduce(function (a, b) {
         // This function needs documentation.
            return a + b;
        });

        x.onready = function (evt) {
         // This function needs documentation.
            console.log('post-reduce:', x.val);
            return evt.exit();
        };

        return;

    }());

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
