//- JavaScript source code

//- main.js ~~
//                                                      ~~ (c) SRW, 16 Jul 2012
//                                                  ~~ last updated 18 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Out-of-scope definitions

    exports.launch_client = require('./client').launch;

    exports.launch_service = require('./service').launch;

    exports.roll_up = require('./katamari').roll_up;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
