//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 26 Sep 2012
//                                                  ~~ last updated 24 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var examples, qm;

 // Definitions

    examples = {
        api: {
            couch:      'http://127.0.0.1:5984/db/_design/app',
            mongo:      'mongodb://localhost:27017',
            postgres:   'postgres://localhost:5432/' + process.env.USER,
            sqlite:     'qm.db'
        },
        www: {
            couch:      'http://127.0.0.1:5984/www/_design/app/_rewrite',
            postgres:   'pg://localhost:5432/' + process.env.USER,
            redis:      'redis://:@127.0.0.1:6379',
            sqlite:     ':memory:'
        }
    };

    qm = require('lib/main');

 // Invocations

    qm.launch_service({
        api: {
            sqlite:     examples.api.sqlite
        },
        max_workers:    require('os').cpus().length,
        port:           8177
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
