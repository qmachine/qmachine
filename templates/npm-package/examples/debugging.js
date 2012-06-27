//- JavaScript source code

//- debugging.js ~~
//                                                      ~~ (c) SRW, 14 Jun 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var qm;

 // Definitions

    qm = require('lib/qm');

 // Invocations

    qm.launch_server({
        hostname:   '127.0.0.1',
        port:       8124
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
