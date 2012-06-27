//- JavaScript source code

//- client.js ~~
//                                                      ~~ (c) SRW, 14 Jun 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var cluster, qm;

 // Definitions

    cluster = require('cluster');

    qm = require('lib/qm');

 // Invocations

    if (cluster.isMaster) {

        qm.launch_client({
            hostname:   '127.0.0.1',
            port:       8124
        });

    }

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
