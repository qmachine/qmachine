//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 06 Oct 2012
//                                                  ~~ last updated 10 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var options, parse, qm;

 // Definitions

    options = {
        log: require('./custom').log,
        worker_procs: require('os').cpus().length
    };

    parse = require('./custom').parse;

    qm = require('qm');

 // Invocations

    if (process.env.IP !== undefined) {
     // This is for debugging on Cloud9.
        options.hostname = process.env.IP;
    }

    if (process.env.OPENSHIFT_NODEJS_IP !== undefined) {
     // This is for use with OpenShift.
        options.hostname = process.env.OPENSHIFT_NODEJS_IP;
    } else if (process.env.OPENSHIFT_INTERNAL_IP !== undefined) {
     // This is an outdated environment variable for use with OpenShift.
        options.hostname = process.env.OPENSHIFT_INTERNAL_IP;
    }

    if (process.env.OPENSHIFT_NODEJS_PORT !== undefined) {
     // This is for use with OpenShift.
        options.port = process.env.OPENSHIFT_NODEJS_PORT;
    } else if (process.env.OPENSHIFT_INTERNAL_PORT !== undefined) {
     // This is an outdated environment variable for use with OpenShift.
        options.port = process.env.OPENSHIFT_INTERNAL_PORT;
    }

    if (process.env.PORT !== undefined) {
     // This is for use with Heroku.
        options.port = process.env.PORT;
    }

    if (process.env.QM_API_STRING !== undefined) {
     // This is a custom environment variable I define prior to deployment.
        options.enable_api_server = true;
        options.enable_CORS = true;
        options.persistent_storage = parse(process.env.QM_API_STRING);
    }

    if (process.env.QM_HOSTNAME !== undefined) {
     // This is a custom environment variable I define prior to deployment.
        options.hostname = process.env.QM_HOSTNAME;
        options.match_hostname = true;
    }

    if (process.env.QM_LOG_STRING !== undefined) {
     // This is a custom environment variable I define prior to deployment.
        options.trafficlog_storage = parse(process.env.QM_LOG_STRING);
    }

    if (process.env.QM_WWW_STRING !== undefined) {
     // This is a custom environment variable I define prior to deployment.
        options.enable_www_server = true;
        options.static_content = parse(process.env.QM_WWW_STRING);
    }

    if (process.env.TRAVIS === 'true') {
     // This is for use with Travis CI, where the VMs run on 1.5 virtual cores.
        options.worker_procs = 1;
    }

    if (process.env.VCAP_APP_PORT !== undefined) {
     // This is for use with AppFog.
        options.port = process.env.VCAP_APP_PORT;
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
