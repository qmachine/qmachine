//- JavaScript source code

//- api.js ~~
//                                                      ~~ (c) SRW, 19 Oct 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var API, api, cluster, corser, http;

 // Definitions

    API = function () {
     // This function needs documentation.
        var that = this;
        that.rules = [];
        return that;
    };

    api = function (obj) {
     // This function needs documentation.
        return new API(obj);
    };

    cluster = require('cluster');

    corser = require('corser');

    http = require('http');

 // Prototype definitions

    API.prototype.def = function (obj) {
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

    API.prototype.launch = function (obj) {
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
        if (obj.hasOwnProperty('max_procs') === false) {
            throw new Error('No "max_procs" property specified.');
        }
        if (obj.hasOwnProperty('max_sockets') === false) {
            throw new Error('No "max_sockets" property specified.');
        }
        if (obj.hasOwnProperty('port') === false) {
            throw new Error('No "port" property specified.');
        }
        var enable_cors, n, spawn_worker, that;
        enable_cors = corser.create({});
        n = obj.max_procs;
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
         // If this process is the master process, we will launch `max_procs`
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

    exports.create = api;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
