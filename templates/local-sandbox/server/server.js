//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 27 Jun 2012

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

 /*
    qm.launch_server({
        db_url:     'http://quanah.iriscouch.com:5984/db/_design/app',
        hostname:   '127.0.0.1',
        port:       8124,
        www_url:    'http://quanah.iriscouch.com:5984/www/_design/app/_rewrite'
    });
 */

    qm.launch_server({
        hostname:   '127.0.0.1',
        port:       8124
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
