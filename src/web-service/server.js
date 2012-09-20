//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 13 Sep 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var config, qm;

 // Definitions

    config = {
        couch:  'http://localhost:5984',
        host:   '0.0.0.0',
        port:   8177
    };

    qm = require('qm');

 // Invocations

    if (process.env.CLOUDANT_URL !== undefined) {
     // This is for use with Heroku.
        config.couch = process.env.CLOUDANT_URL;
    }

    if (process.env.IP !== undefined) {
     // This is for debugging on Cloud9, if memory serves ...
        config.host = process.env.IP;
    }

    if (process.env.PORT !== undefined) {
     // This is for use with Heroku.
        config.port = process.env.PORT;
    }

    qm.launch_server({
        db_url:     config.couch + '/db/_design/app',
        hostname:   config.host,
        port:       config.port,
        www_url:    config.couch + '/www/_design/app/_rewrite'
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
