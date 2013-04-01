//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 06 Oct 2012
//                                                  ~~ last updated 01 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var options, qm;

 // Definitions

    options = {
        worker_procs: require('os').cpus().length
    };

    qm = require('qm');

 // Invocations

    if (process.env.IP !== undefined) {
     // This is for debugging on Cloud9.
        options.hostname = process.env.IP;
    }

    if (process.env.PORT !== undefined) {
     // This is for use with Heroku.
        options.port = process.env.PORT;
    }

    if (process.env.QM_API_STRING !== undefined) {
     // This is a custom environment variable I define prior to deployment.
        options.enable_api_server = true;
        options.enable_CORS = true;
        options.persistent_storage = JSON.parse(process.env.QM_API_STRING);
    }

    if (process.env.QM_LOG_STRING !== undefined) {
     // This is a custom environment variable I define prior to deployment.
        options.trafficlog_storage = JSON.parse(process.env.QM_LOG_STRING);
    }

    if (process.env.QM_WWW_STRING !== undefined) {
     // This is a custom environment variable I define prior to deployment.
        options.enable_www_server = true;
        options.static_content = process.env.QM_WWW_STRING;
    }

    if (process.env.VMC_APP_PORT !== undefined) {
     // This is for use with Cloud Foundry platforms.
        options.hostname = null;
        options.port = process.env.VMC_APP_PORT;
    }

    qm.launch_service(options);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
