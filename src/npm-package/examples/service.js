//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 26 Sep 2012
//                                                  ~~ last updated 23 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var examples, qm;

 // Definitions

    examples = {
        persistent_storage: {
            avar_ttl:       60,
            gc_interval:    1,
            couch:          'http://127.0.0.1:5984/db',
            mongo:          'mongodb://localhost:27017/qm',
            postgres:       'postgres://localhost:5432/' + process.env.USER,
            redis:          'redis://:@127.0.0.1:6379',
            sqlite:         'qm.db'
        }
    };

    qm = require('lib/main');

 // Invocations

    qm.launch_service({
        enable_api_server:  true,
        enable_CORS:        true,
        enable_www_server:  true,
        persistent_storage: {
            avar_ttl:       60,
            sqlite:         examples.persistent_storage.sqlite
        },
        worker_procs:       require('os').cpus().length
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
