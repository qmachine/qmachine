//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 26 Sep 2012

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

    qm.launch_service({
        hostname:   '127.0.0.1',
        port:       8177
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
