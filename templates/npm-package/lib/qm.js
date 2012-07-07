//- JavaScript source code

//- qm.js ~~
//                                                      ~~ (c) SRW, 07 Jul 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var begin_sync, cluster, configure, corser, createServer, http,
        launch_client, launch_server, launch_workers, os, tty, url, vm;

 // Definitions

    begin_sync = function (args) {
     // This function was originally written as a means to set up continuous
     // replication as part of the development workflow, but it isn't always
     // part of the current workflow -- I included it here for posterity :-)
        if (cluster.isWorker) {
            return;
        }
        if (args.length === 0) {
            return;
        }
        var get_input;
        get_input = function (text_prompt, echo, callback) {
         // This function needs documentation.
            var y = '';
            process.stdout.write(text_prompt + ' ');
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.setRawMode(true);
            //tty.setRawMode(true);
            process.stdin.on('data', function get_char(c) {
             // This function needs documentation.
                c += '';
                if ((c === '\n') || (c === '\r') || (c === '\u0004')) {
                 // User has finished typing.
                    process.stdin.setRawMode(false);
                    //tty.setRawMode(false);
                    process.stdout.write('\n');
                    process.stdin.pause();
                    process.stdin.removeListener('data', get_char);
                    callback(y);
                } else if (c === '\u0003') {
                 // User canceled with Ctrl-C.
                    process.stdout.write('(canceled)\n');
                    process.exit();
                } else {
                    process.stdout.write((echo === true) ? c : '');
                    y += c;
                }
                return;
            });
            return;
        };
        console.log('Configuring ' + args[0].target + ' ...');
        get_input('Username:', true, function (username) {
         // This function needs documentation.
            get_input('Password:', false, function (password) {
             // This function needs documentation.
                var options, request;
                options = url.parse(args[0].target);
                options.auth = username + ':' + password;
                args[0].target = url.format(options);
                options.path = '/_replicate';
                options.method = 'POST';
                request = http.request(options, function (response) {
                 // This function needs documentation.
                    var txt = [];
                    response.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    });
                    response.on('end', function () {
                     // This function needs documentation.
                        console.log(txt.join(''));
                        args.shift();
                        begin_sync(args);
                        return;
                    });
                    return;
                }).on('error', function (err) {
                 // This function needs documentation.
                    console.error(err);
                    return;
                });
                request.setHeader('Content-Type', 'application/json');
                request.write(JSON.stringify(args[0]));
                request.end();
                return;
            });
            return;
        });
        return;
    };

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

    launch_client = function (options) {
     // This function needs documentation.
        var config, href, mothership, request;
        config = configure(options, {
            hostname:   'qmachine.org',
            port:       80,
            q_path:     '/q.js'
        });
        href = ['http://', config.hostname, ':', config.port, config.q_path];
        mothership = href.slice(0, -1).join('');
        request = http.request(url.parse(href.join('')), function (response) {
         // This function needs documentation.
            var txt = [];
            response.on('data', function (chunk) {
             // This function needs documentation.
                txt.push(chunk.toString());
                return;
            });
            response.on('end', function () {
             // This function needs documentation.
                var code, myeval, q_url, repl, shell;
                code = txt.join('').replace('http://qmachine.org', mothership);
                myeval = function (code, context, file, callback) {
                 // This function needs documentation.
                    var e, x, y;
                    e = null;
                    if (code.slice(-2) !== '\n)') {
                     // This tests whether `myeval` was called for completion,
                     // which I deliberately prevent because it screws up the
                     // ES5 getters and setters. For more information, see the
                     // Node.js source code (line 405 of "lib/repl.js" of
                     // commit "b866a96cfacf37bf40a9fd7bab6e56868e3c0800").
                        return callback(e, y);
                    }
                    if (code === '(undefined\n)') {
                        callback(e, y);
                        return;
                    }
                    try {
                        x = code.slice(1, -1).trim();
                        y = vm.createScript(x, file).runInThisContext();
                        if (typeof y === 'function') {
                            y = y.toString();
                        }
                    } catch (err) {
                        e = err;
                    }
                    return callback(e, y);
                };
                q_url = mothership + '/q.js';
                repl = require('repl');
                shell = repl.start('QM> ', undefined, myeval, true, true);
                vm.createScript(code, q_url).runInThisContext();
                return;
            });
            return;
        });
        request.on('error', function (err) {
         // This function needs documentation.
            console.error(err);
            return;
        });
        request.end();
        return;
    };

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
            var inner_req, method, options, rewrite, target;
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
                var pattern, y;
                pattern = /^\/box\/([\w-]+)[?](key|status)[=]([\w]+)$/;
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
            //delete options.headers['host'];
            options.headers['Content-Type'] = 'application/json';
         // ----
            options.method = method;
            inner_req = http.request(options, function (inner_res) {
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

    tty = require('tty');

    url = require('url');

    vm = require('vm');

 // Prototype definitions

 // Out-of-scope definitions

    exports.begin_sync = begin_sync;
    exports.launch_client = launch_client;
    exports.launch_server = launch_server;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
