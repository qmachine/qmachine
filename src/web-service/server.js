//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 06 Oct 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var config, qm;

 // Definitions

    config = {
        couch:      'http://localhost:5984',
        host:       '0.0.0.0',
        mongo:      'mongodb://localhost:27017',
        port:       8177,
        postgres:   'postgres://localhost:5432/' + process.env.USER
    };

    qm = require('qm');

 // Invocations

    if (process.env.COUCHDB_URL !== undefined) {
     // This is my own environment variable that I use with Heroku and AppFog.
        config.couch = process.env.COUCHDB_URL;
    } else if (process.env.CLOUDANT_URL !== undefined) {
     // This is for use with Heroku.
        config.couch = process.env.CLOUDANT_URL;
    } else if (process.env.DATABASE_URL !== undefined) {
     // This is for use with the Heroku PostgreSQL service.
        config.postgres = process.env.DATABASE_URL;
    }

    if (process.env.MONGODB_URL !== undefined) {
     // This is my own environment variable that I use with Heroku and AppFog.
        config.mongo = process.env.MONGODB_URL;
    }

    if (process.env.IP !== undefined) {
     // This is for debugging on Cloud9, if memory serves ...
        config.host = process.env.IP;
    }

    if (process.env.PORT !== undefined) {
     // This is for use with Heroku.
        config.port = process.env.PORT;
    }

    if (process.env.VMC_APP_PORT !== undefined) {
     // This is for use with AppFog.
        config.host = null;
        config.port = process.env.VMC_APP_PORT;
    }

    qm.launch_service({
        couchdb: {
            db:     config.couch + '/db/_design/app',
            www:    config.couch + '/www/_design/app/_rewrite'
        },
        hostname:   config.host,
        mongo: {
            host:   require('url').parse(config.mongo).hostname,
            port:   require('url').parse(config.mongo).port
        },
        port:       config.port,
        postgres:   config.postgres,
        storage:    'couchdb'
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
