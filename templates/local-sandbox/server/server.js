//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 28 Jun 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var qm;

 // Definitions

    qm = require('qm');

 // Invocations

    qm.launch_server({
        hostname:   '127.0.0.1',
        port:       8177
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
