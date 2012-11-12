//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 10 Nov 2012
//                                                  ~~ last updated 12 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var cluster, configure, corser, http, launch_service, RESTful_Service,
        restful_service;

 // Definitions

    cluster = require('cluster');

    configure = function (user_input, default_values) {
     // This function needs documentation.
        if ((user_input instanceof Object) === false) {
            user_input = {};
        }
        var key, y;
        y = (default_values instanceof Array) ? [] : {};
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

    http = require('http');

    launch_service = function (obj) {
     // This function needs documentation.
        var backends, config, defs_api, defs_www, i, prepost, service;
        backends = ['couch', 'mongo', 'postgres', 'sqlite'];
        config = configure(obj, {
            api:            {},
            hostname:       '0.0.0.0',
            max_fu_size:    1048576,    //- 1024 * 1024 bytes = 1 Megabyte
            max_sockets:    500,
            max_workers:    1,
            port:           8177,
            public_html:    'public_html/',
            www:            {}
        });
        prepost = function (f) {
         // This function is a higher-order wrapper function that simplifies
         // the implementation of the `post_box_key` methods.
            return function (request, response, params) {
             // This function needs documentation.
                var fu_size;
                if (request.headers.hasOwnProperty('content-length')) {
                    fu_size = request.headers['content-length'];
                    if (fu_size < config.max_fu_size) {
                        return f(request, response, params);
                    }
                }
             // If we land here, then the user is either using incorrect
             // headers or he/she is uploading a file that is too big. Don't
             // fool with it either way. QMachine is not a free hard drive for
             // people who are too cheap to buy storage, because we didn't buy
             // storage, either ;-)
                response.writeHead(444);
                response.end();
                return;
            };
        };
        service = restful_service();
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
        for (i = 0; i < backends.length; i += 1) {
            if ((config.api instanceof Object) &&
                    (config.api.hasOwnProperty(backends[i]))) {
             // This arm needs documentation.
                defs_api = require('./defs-' + backends[i])
                    .init(config.api[backends[i]]);
                service.def({
                    method:     'GET',
                    pattern:    /^\/box\/([\w\-]+)\?key=([A-z0-9]+)$/,
                    handler:    defs_api.get_box_key
                });
                service.def({
                    method:     'GET',
                    pattern:    /^\/box\/([\w\-]+)\?status=([A-z0-9]+)$/,
                    handler:    defs_api.get_box_status
                });
                service.def({
                    method:     'POST',
                    pattern:    /^\/box\/([\w\-]+)\?key=([A-z0-9]+)$/,
                    handler:    prepost(defs_api.post_box_key)
                });
            }
            if ((config.www instanceof Object) &&
                    (config.www.hasOwnProperty(backends[i]))) {
             // This arm needs documentation.
                defs_www = require('./defs-' + backends[i])
                    .init(config.www[backends[i]]);
                service.def({
                    method:     'GET',
                    pattern:    /^\//,
                    handler:    defs_www.get_static_content
                });
                defs_www.set_static_content(config.public_html);
            }
        }
        if (service.rules.length > 1) {
            service.launch(config);
        } else {
            console.log('No servers were specified.');
        }
        return;
    };

    RESTful_Service = function RESTful_Service() {
     // This function needs documentation.
        var that = this;
        that.rules = [];
        return that;
    };

    restful_service = function (obj) {
     // This function needs documentation.
        return new RESTful_Service(obj);
    };

 // Prototype definitions

    RESTful_Service.prototype.def = function (obj) {
     // This function needs documentation.
        //  1.  Validate input.
        //  2.  Ensure the rule hasn't already been added. (TO-DO!)
        //  3.  Add the rule.
        if ((obj instanceof Object) === false) {
            throw new TypeError('Input argument must be an object.');
        }
        if (obj.hasOwnProperty('handler') === false) {
            throw new Error('No "handler" property specified.');
        }
        if (obj.hasOwnProperty('method') === false) {
            throw new Error('No "method" property specified.');
        }
        if (obj.hasOwnProperty('pattern') === false) {
            throw new Error('No "pattern" property specified.');
        }
        this.rules.push(obj);
        return this;
    };

    RESTful_Service.prototype.launch = function (obj) {
     // This function needs documentation.
        if (this.hasOwnProperty('server')) {
            return;
        }
        if ((obj instanceof Object) === false) {
            throw new TypeError('Input argument must be an object.');
        }
        if (obj.hasOwnProperty('hostname') === false) {
            throw new Error('No "hostname" property specified.');
        }
        if (obj.hasOwnProperty('max_sockets') === false) {
            throw new Error('No "max_sockets" property specified.');
        }
        if (obj.hasOwnProperty('max_workers') === false) {
            throw new Error('No "max_workers" property specified.');
        }
        if (obj.hasOwnProperty('port') === false) {
            throw new Error('No "port" property specified.');
        }
        var enable_cors, n, spawn_worker, that;
        enable_cors = corser.create({});
        n = obj.max_workers;
        spawn_worker = function () {
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
            return worker;
        };
        that = this;
        if ((cluster.isMaster) && (n > 1)) {
         // If this process is the master process, we will launch `max_workers`
         // worker processes to make sure we're using all of the cores in the
         // machine. Obviously this would be pretty wasteful if there's only
         // one core in the machine anyway, which is why we require `n > 1`.
            if (process.version.slice(0, 4) === 'v0.6') {
                cluster.on('death', function (prev_worker) {
                 // This function needs documentation.
                    var next_worker, output;
                    next_worker = spawn_worker();
                    console.log(prev_worker.pid + ':', 'RIP', next_worker.pid);
                    return;
                });
            } else if (process.version.slice(0, 4) === 'v0.8') {
                cluster.on('exit', function (prev_worker) {
                 // This function needs documentation.
                    var next_worker, output;
                    next_worker = spawn_worker();
                    console.log(prev_worker.pid + ':', 'RIP', next_worker.pid);
                    return;
                });
            }
         // Finally, we launch the worker processes :-)
            while (n > 0) {
                spawn_worker();
                n -= 1;
            }
            console.log('QM service (x%d) available at http://%s:%d ...',
                obj.max_workers, obj.hostname, obj.port);
            return;
        }
        that.server = http.createServer(function (req, res) {
         // This function needs documentation.
            enable_cors(req, res, function () {
             // This function needs documentation.
                var flag, i, n, params, rule, url;
                flag = false;
                n = that.rules.length;
                url = req.url;
                for (i = 0; (flag === false) && (i < n); i += 1) {
                    rule = that.rules[i];
                    if ((req.method === rule.method) &&
                            (rule.pattern.test(url))) {
                        flag = true;
                        params = url.match(rule.pattern).slice(1);
                        rule.handler(req, res, params);
                    }
                }
                if (flag === true) {
                    return;
                }
                res.writeHead(444);
                res.end();
                return;
            });
            return;
        });
        http.globalAgent.maxSockets = obj.max_sockets;
        that.server.listen(obj.port, obj.hostname);
        return;
    };

 // Out-of-scope definitions

    exports.launch_service = launch_service;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
