//- JavaScript source code

//- client.js ~~
//                                                      ~~ (c) SRW, 28 Jun 2012
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

    qm.launch_client({
        hostname:   '127.0.0.1',
        port:       8177
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
