//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 26 Sep 2012
//                                                  ~~ last updated 12 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var qm;

 // Definitions

    qm = require('lib/main');

 // Invocations

    qm.launch_service({
        api: {
            sqlite: ':memory:'
        },
        hostname:   '127.0.0.1',
        port:       8177
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
