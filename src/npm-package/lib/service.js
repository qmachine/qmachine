//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 30 Oct 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var api, configure, os;

 // Definitions

    api = require('./api');

    configure = function (user_input, default_values) {
     // This function needs documentation.
        if ((user_input instanceof Object) === false) {
            user_input = {};
        }
        var key, y;
        y = {};
        for (key in default_values) {
            if (default_values.hasOwnProperty(key)) {
                if (user_input.hasOwnProperty(key)) {
                    y[key] = user_input[key];
                } else {
                    y[key] = default_values[key];
                }
            }
        }
        return y;
    };

    os = require('os');

 // Out-of-scope definitions

    exports.launch_service = function (options) {
     // This function needs documentation.
        var config, defs, service;
        config = configure(options, {
            corser_options: {},
            couchdb: {
                db:         'http://127.0.0.1:5984/db/_design/app',
                www:        'http://127.0.0.1:5984/www/_design/app/_rewrite'
            },
            hostname:       'qmachine.org',
            max_procs:      os.cpus().length,
            max_sockets:    500,
            port:           80,
            postgres:       'postgres://localhost:5432/' + process.env.USER,
            storage:        'couchdb'
        });
        defs = require('./defs-' + config.storage);
        defs.init(config);
        service = api.create();
        service.def({
            method: 'OPTIONS',
            pattern: /^\//,
            handler: function (request, response) {
             // This function needs documentation.
                response.writeHead(204);
                response.end();
                return;
            }
        });
        service.def({
            method:     'GET',
            pattern:    /^\/box\/([\w\-]+)\?key=([A-z0-9]+)$/,
            handler:    defs.get_box_key
        });
        service.def({
            method:     'GET',
            pattern:    /^\/box\/([\w\-]+)\?status=([A-z0-9]+)$/,
            handler:    defs.get_box_status
        });
        service.def({
            method:     'POST',
            pattern:    /^\/box\/([\w\-]+)\?key=([A-z0-9]+)$/,
            handler:    defs.post_box_key
        });
        service.def({
            method:     'GET',
            pattern:    /^\//,
            handler:    defs.get_static_content
        });
        service.launch(config);
        return;
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
