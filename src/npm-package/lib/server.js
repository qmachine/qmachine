//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 12 Sep 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var cluster, configure, corser, createServer, http, https, launch_server,
        launch_workers, os, url;

 // Definitions

    cluster = require('cluster');

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

    corser = require('corser');

    createServer = function (options, f) {
     // This function needs documentation.
        var enable_cors = corser.create(options);
        return http.Server(function (request, response) {
         // This function needs documentation.
            enable_cors(request, response, function () {
             // This function needs documentation.
                f(request, response);
                return;
            });
            return;
        });
    };

    http = require('http');

    https = require('https');

    launch_server = function (options) {
     // This function needs documentation.
        var config;
        config = configure(options, {
            corser_options: {},
            db_url:         'http://127.0.0.1:5984/db/_design/app',
            hostname:       'qmachine.org',
            max_sockets:    500,
            max_workers:    os.cpus().length,
            port:           80,
            www_url:        'http://127.0.0.1:5984/www/_design/app/_rewrite'
        });
        if (cluster.isMaster) {
            cluster.on('exit', function (worker) {
             // This function needs documentation.
                console.log('Process ' + worker.pid + ' exited.');
                launch_workers(1);
                return;
            });
            launch_workers(config.max_workers);
            return;
        }
     // This code only runs in a worker process.
        createServer(config.corser_options, function (outer_req, outer_res) {
         // This function needs documentation.
            var inner_req, method, options, protocol, rewrite;
            method = outer_req.method.toUpperCase();
            if (method === 'OPTIONS') {
                outer_res.writeHead(204);
                outer_res.end();
                return;
            }
            if ((method !== 'GET') && (method !== 'POST')) {
                outer_res.writeHead(444);
                outer_res.end();
                return;
            }
            rewrite = function (x) {
             // This function needs documentation.
                /*jslint unparam: true */
                var pattern, y;
                pattern = /^\/box\/([\w\-]+)[?](key|status)[=]([\w]+)$/;
                y = x.replace(pattern, function (all, box, pkey, pval) {
                 // This function only runs if `pattern` returns a match.
                    var temp;
                    if (pkey === 'key') {
                        if (method === 'GET') {
                            temp = ['/_show/data/', box, '&', pval];
                        } else {
                            temp = ['/_update/timestamp/', box, '&', pval];
                        }
                    } else {
                        temp = [
                            '/_list/as-array/jobs?key=["',
                            box, '","', pval, '"]'
                        ];
                    }
                    return config.db_url + temp.join('');
                });
                return (y === x) ? (config.www_url + x) : encodeURI(y);
            };
            options = url.parse(rewrite(outer_req.url));
            options.headers = outer_req.headers;
         // The next two lines are experimental ... ?
            delete options.headers.host;
            options.headers['Content-Type'] = 'application/json';
         // ----
            options.method = method;
            protocol = (options.protocol === 'http:') ? http : https;
            inner_req = protocol.request(options, function (inner_res) {
             // This function needs documentation.
                outer_res.writeHead(inner_res.statusCode, inner_res.headers);
                inner_res.pipe(outer_res);
                return;
            });
            inner_req.on('error', function (err) {
             // This function needs documentation.
                outer_res.writeHead(444);
                outer_res.end();
                err.request = {
                    ip:     outer_req.connection.remoteAddress,
                    time:   new Date(),
                    method: outer_req.method,
                    url:    outer_req.url
                };
                console.error(JSON.stringify(err, undefined, 4));
                return;
            });
            outer_req.pipe(inner_req);
            return;
        }).listen(config.port, config.hostname);
        return;
    };

    launch_workers = function (n) {
     // This function needs documentation.
        var i, x;
        x = [];
        for (i = 0; i < n; i += 1) {
            x[i] = 0;
        }
        x.forEach(function () {
         // This function needs documentation.
            var worker = cluster.fork();
            worker.on('error', function (err) {
             // This function needs documentation.
                console.error(err);
                return;
            });
            worker.on('message', function (message) {
             // This function needs documentation.
                console.log(worker.pid + ':', message.cmd);
                return;
            });
            return;
        });
        return;
    };

    os = require('os');

    url = require('url');

 // Prototype definitions

 // Out-of-scope definitions

    exports.launch_server = launch_server;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
