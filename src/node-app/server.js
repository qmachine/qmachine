//- JavaScript source code

//- server.js ~~
//
//  This Node.js app launches a QM API server and a web server for anything
//  placed in the "public" folder.
//
//  See https://docs.qmachine.org/en/latest/nodejs.html for more information.
//
//                                                      ~~ (c) SRW, 06 Oct 2012
//                                                  ~~ last updated 22 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        enable_api_server, enable_cors, enable_web_server, env, launch_service,
        mongo, parse, persistent_storage, static_content, QM_API_STRING,
        QM_WEB_STRING, TRAVIS, worker_procs
    */

 // Declarations

    var options, parse, qm;

 // Definitions

    options = {
        enable_api_server:  true,
        enable_cors:        true,
        enable_web_server:  true,
        persistent_storage: {
            mongo:          'mongodb://localhost:27017/test'
        },
        worker_procs:       2
    };

    parse = require('./custom').parse;

    qm = require('qm');

 // Invocations

    if (process.env.QM_API_STRING !== undefined) {
        options.persistent_storage = parse(process.env.QM_API_STRING);
    }

    if (process.env.QM_WEB_STRING !== undefined) {
        options.static_content = parse(process.env.QM_WEB_STRING);
    }

    if (process.env.TRAVIS === 'true') {
     // This is for use with running the unit tests on Travis CI. On their
     // original infrastructure, the VMs run on 1.5 cores with burst capacity,
     // so it was best to set `options.worker_procs = 1`. The new
     // infrastructure, based on Docker containers, offers 2 dedicated cores,
     // but ... see http://goo.gl/6x9Df6.
        options.worker_procs = 1;
    }

    qm.launch_service(options);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
