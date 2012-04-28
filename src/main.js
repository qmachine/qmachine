//- JavaScript source code

//- main.js ~~
//                                                      ~~ (c) SRW, 16 Apr 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, browser: true */

 // Prerequisites

 // Declarations

    var lib, main, mothership;

 // Definitions

    lib = document.createElement('script');

    main = function () {
     // This function needs documentation.
     /*
        var Q, x;
        Q = Object.prototype.Q;
        Q.box = 'sean';
        x = Q.avar();
        x.onerror = function (message) {
         // This function needs documentation.
            console.error(message);
            return;
        };
        x.onready = function (evt) {
         // This function needs documentation.
            x.val = Math.random();
            return evt.exit();
        };
        x.onready = function (evt) {
         // This function needs documentation.
            console.log(x.val);
            return evt.exit();
        };
        x.onready = function (evt) {
         // This function needs documentation.
            this.val *= 2;
            return evt.exit();
        };
        x.onready = function (evt) {
         // This function needs documentation.
            console.log(x.val);
            return evt.exit();
        };
     */
        return;
    };

    mothership = 'http://qmachine.org';

 // Descriptions

    lib.onload = main;

    lib.src = mothership + '/q.js';

 // Invocations

    document.body.appendChild(lib);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
