//- JavaScript source code

//- service.js ~~
//                                                      ~~ (c) SRW, 21 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var cluster, configure, corser, fs, http, launch_service, RESTful_Service,
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

    fs = require('fs');

    http = require('http');

    launch_service = function (options) {
     // This function needs documentation.
        var api_defs, config, service, www_defs;
        config = configure(options, {
            api:            {},
            hostname:       '0.0.0.0',
            max_fu_size:    1048576,    //- 1024 * 1024 bytes = 1 Megabyte
            max_sockets:    500,
            max_workers:    1,
            port:           8177,
            public_html:    'public_html/',
            www:            {}
        });
        if (config.api.hasOwnProperty('couch')) {
            api_defs = require('./defs-couch').api(config.api.couch);
        } else if (config.api.hasOwnProperty('mongo')) {
            api_defs = require('./defs-mongo').api(config.api.mongo);
        } else if (config.api.hasOwnProperty('postgres')) {
            api_defs = require('./defs-postgres').api(config.api.postgres);
        } else if (config.api.hasOwnProperty('sqlite')) {
            api_defs = require('./defs-sqlite').api(config.api.sqlite);
        } else {
            api_defs = {};
        }
        if (config.www.hasOwnProperty('couch')) {
            www_defs = require('./defs-couch').www(config.www.couch);
        } else if (config.www.hasOwnProperty('mongo')) {
            www_defs = require('./defs-mongo').www(config.www.mongo);
        } else if (config.www.hasOwnProperty('postgres')) {
            www_defs = require('./defs-postgres').www(config.www.postgres);
        } else if (config.www.hasOwnProperty('sqlite')) {
            www_defs = require('./defs-sqlite').www(config.www.sqlite);
        } else {
            www_defs = {};
        }
        service = restful_service();
        service.def({
            method:  'OPTIONS',
            pattern: /^\//,
            handler: function (request, response) {
             // This function needs documentation.
                response.writeHead(204);
                response.end();
                return;
            }
        });
        if (api_defs.hasOwnProperty('get_box_key')) {
            service.def({
                method:  'GET',
                pattern: /^\/box\/([\w\-]+)\?key=([A-z0-9]+)$/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var callback;
                    callback = function (err, results) {
                     // This function needs documentation.
                        if (err !== null) {
                            console.error(err);
                            results = {};
                        }
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        response.write(JSON.stringify(results));
                        response.end();
                        return;
                    };
                    api_defs.get_box_key.apply(this, [
                        request, response, params, callback
                    ]);
                    return;
                }
            });
        }
        if (api_defs.hasOwnProperty('get_box_status')) {
            service.def({
                method:  'GET',
                pattern: /^\/box\/([\w\-]+)\?status=([A-z0-9]+)$/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var callback;
                    callback = function (err, results) {
                     // This function needs documentation.
                        if (err !== null) {
                            console.error(err);
                            results = [];
                        }
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        response.write(JSON.stringify(results));
                        response.end();
                        return;
                    };
                    api_defs.get_box_status.apply(this, [
                        request, response, params, callback
                    ]);
                    return;
                }
            });
        }
        if (api_defs.hasOwnProperty('post_box_key')) {
            service.def({
                method:  'POST',
                pattern: /^\/box\/([\w\-]+)\?key=([A-z0-9]+)$/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var callback, headers;
                    callback = function (err) {
                     // This function needs documentation.
                        if (err !== null) {
                            console.error(err);
                            response.writeHead(444);
                            response.end();
                            return;
                        }
                        response.writeHead(201, {
                            'Content-Type': 'text/plain'
                        });
                        response.write('Hooray!');
                        response.end();
                        return;
                    };
                    headers = request.headers;
                    if (headers.hasOwnProperty('content-length')  === false) {
                        return callback('Missing "content-length" header');
                    }
                    if (headers['content-length'] > config.max_fu_size) {
                        return callback('Maximum file upload size exceeded');
                    }
                    api_defs.post_box_key.apply(this, [
                        request, response, params, callback
                    ]);
                    return;
                }
            });
        }
        if (www_defs.hasOwnProperty('get_static_content')) {
            service.def({
                method:  'GET',
                pattern: /^(\/[\w\-\.]*)/,
                handler: function (request, response, params) {
                 // This function needs documentation.
                    var callback, name;
                    callback = function (err, results) {
                     // This function needs documentation.
                        if (err !== null) {
                            console.error(err);
                            response.writeHead(444);
                            response.end();
                            return;
                        }
                        if ((results === null) || (results === undefined)) {
                            response.writeHead(444);
                            response.end();
                            return;
                        }
                        var extension, headers, mime_types;
                        extension = name.split('.').pop();
                        headers = {
                            'Content-Type': 'application/octet-stream'
                        };
                        mime_types = {
                            appcache:       'text/cache-manifest',
                            css:            'text/css',
                            html:           'text/html',
                            ico:            'image/x-icon',
                            jpg:            'image/jpeg',
                            js:             'text/javascript',
                            json:           'application/json',
                            manifest:       'text/cache-manifest',
                            png:            'image/png',
                            txt:            'text/plain',
                            xml:            'application/xml'
                        };
                        if (mime_types.hasOwnProperty(extension)) {
                            headers['Content-Type'] = mime_types[extension];
                        }
                        response.writeHead(200, headers);
                        response.write(results);
                        response.end();
                        return;
                    };
                    name = (params[0] === '/') ? '/index.html' : params[0];
                    www_defs.get_static_content.apply(this, [
                        request, response, [name], callback
                    ]);
                    return;
                }
            });
        }
        if (www_defs.hasOwnProperty('set_static_content')) {
         // NOTE: Don't try to streamline the initial static content load by
         // restricting it to `cluster.isMaster` -- it doesn't seem to work
         // with SQLite in-memory databases.
            if (typeof config.public_html !== 'string') {
                config.public_html = 'public_html/';
            }
            fs.exists(config.public_html, function (exists) {
             // This function needs documentation.
                if (exists === false) {
                    console.warn('"' + config.public_html + '" is missing.');
                    return;
                }
                fs.readdir(config.public_html, function (err, files) {
                 // This function needs documentation.
                    if (err !== null) {
                        throw err;
                    }
                    var callback, remaining;
                    callback = function (err) {
                     // This function needs documentation.
                        if (err !== null) {
                            throw err;
                        }
                        remaining -= 1;
                        if (remaining === 0) {
                            console.log('Static content is ready.');
                        }
                        return;
                    };
                    remaining = files.length;
                    files.forEach(function (name) {
                     // This function needs documentation.
                        var path_to_file = config.public_html + name;
                        fs.readFile(path_to_file, function (err, file) {
                         // This function needs documentation.
                            if (err !== null) {
                                throw err;
                            }
                            www_defs.set_static_content.apply(this, [
                                name, file, callback
                            ]);
                            return;
                        });
                        return;
                    });
                    return;
                });
                return;
            });
        }
        if (service.rules.length > 1) {
            service.launch(config);
        } else {
            console.log('No servers are running.');
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
        //https.globalAgent.maxSockets = obj.max_sockets;
        that.server.listen(obj.port, obj.hostname);
        return;
    };

 // Out-of-scope definitions

    exports.launch_service = launch_service;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
