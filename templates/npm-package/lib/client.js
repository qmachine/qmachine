//- JavaScript source code

//- client.js ~~
//                                                      ~~ (c) SRW, 18 Aug 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var Q, avar, capture, cluster, configure, http, http_GET, http_POST,
        launch_client, launch_remote_client, lib, map, mothership, my_eval,
        ply, reduce, repl, retrieve, state, url, vm, when;

 // Definitions

    Q = require('quanah').add_method_q();

    avar = Q.avar;

    capture = function (data) {
     // This function "captures" incoming data by saving a reference to it
     // in `state.shelf`. It is quite useful when combined with JSONP :-)
        state.shelf.push(data);
        return avar().revive();
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

    http = require('http');

    http_GET = function (x) {
     // This function needs documentation.
        var y = avar(x);
        y.box = x.box;                  //- NOTE: Is this line necessary?
        y.onready = function (evt) {
         // This function needs documentation.
            var href, pool_req;
            if (x.hasOwnProperty('key')) {
                href = mothership + '/box/' + x.box + '?key=' + x.key;
            } else if (x.hasOwnProperty('status')) {
                href = mothership + '/box/' + x.box + '?status=' + x.status;
            } else {
                return evt.fail('No flags specified for "http_GET".');
            }
            pool_req = avar({val: false});
            pool_req.onerror = function (message) {
             // This function needs documentation.
                if (pool_req.val === true) {
                 // Release the resources back into the pool ...
                    state.requests_remaining += 1;
                }
                return evt.fail(message);
            };
            pool_req.onready = function (evt) {
             // This function needs documentation.
                if (state.requests_remaining <= 0) {
                    return evt.stay('Waiting for previous requests to close.');
                }
                state.requests_remaining -= 1;
                pool_req.val = true;
                return evt.exit();
            };
            pool_req.onready = function (evt) {
             // This function needs documentation.
                var options, req;
                options = url.parse(href);
                req = http.request(options, function (res) {
                 // This function needs documentation.
                    var txt = [];
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    });
                    res.on('end', function () {
                     // This function needs documentation.
                        y.val = txt.join('');
                        return evt.exit();
                    });
                    return;
                });
                req.on('error', function (err) {
                 // This function needs documentation.
                    return evt.fail(err);
                });
                req.end();
                return;
            };
            pool_req.onready = function (pool_evt) {
             // This function needs documentation.
                state.requests_remaining += 1;
                pool_evt.exit();
                return evt.exit();
            };
            return;
        };
        return y;
    };

    http_POST = function (x) {
     // This function needs documentation.
        var y = avar(x);
        y.box = x.box;
        y.onready = function (evt) {
         // This function needs documentation.
            var href, pool_req;
            href = mothership + '/box/' + y.box + '?key=' + y.key;
            pool_req = avar({val: false});
            pool_req.onerror = function (message) {
             // This function needs documentation.
                if (pool_req.val === true) {
                 // Release the resources back into the pool ...
                    state.requests_remaining += 1;
                }
                return evt.fail(message);
            };
            pool_req.onready = function (evt) {
             // This function needs documentation.
                if (state.requests_remaining <= 0) {
                    return evt.stay('Waiting for previous requests to close.');
                }
                state.requests_remaining -= 1;
                pool_req.val = true;
                return evt.exit();
            };
            pool_req.onready = function (evt) {
             // This function needs documentation.
                var options, req;
                options = url.parse(href);
                options.method = 'POST';
                req = http.request(options, function (res) {
                 // This function needs documentation.
                    var txt = [];
                    res.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    });
                    res.on('end', function () {
                     // This function needs documentation.
                        y.val = txt.join('');
                        return evt.exit();
                    });
                    return;
                });
                req.on('error', function (err) {
                 // This function needs documentation.
                    return evt.fail(err);
                });
                req.setHeader('Content-Type', 'application/json');
                req.write(JSON.stringify(y));
                req.end();
                return;
            };
            pool_req.onready = function (pool_evt) {
             // This function needs documentation.
                state.requests_remaining += 1;
                pool_evt.exit();
                return evt.exit();
            };
            return;
        };
        return y;
    };

    launch_client = function (options) {
     // This function needs documentation.
        var config, href;
        config = configure(options, {
            hostname:   'qmachine.org',
            port:       80,
            q_path:     '/q.js'
        });
        href = ['http://', config.hostname, ':', config.port, config.q_path];
        mothership = href.slice(0, -1).join('');
        repl.start('QM> ', undefined, my_eval, true, true);
        return;
    };

    launch_remote_client = function (options) {
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
                var code;
                code = txt.join('').replace('http://qmachine.org', mothership);
                vm.createScript(code, href.join('')).runInThisContext();
                repl.start('QM> ', undefined, my_eval, true, true);
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

    lib = function () {
     // This function needs documentation.
        var y = avar();
        y.onready = function (evt) {
         // This function needs documentation.
            return evt.fail('Missing "lib" definition');
        };
        return y;
    };

    map = function (f) {
     // This function needs documentation.
        var afunc, x;
        x = f;
        afunc = function (evt) {
         // This function needs documentation.
            var y;
            if ((this.hasOwnProperty('isready')) ||
                    (this.hasOwnProperty('areready'))) {
             // This arm needs documentation.
                y = map.apply(this, this.val).using(f);
            } else {
                y = map(this.val).using(f);
            }
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = function (y_evt) {
             // This function needs documentation.
                y_evt.exit();
                return evt.exit();
            };
            return;
        };
        afunc.using = function (f) {
         // This function needs documentation.
            var y = avar({val: x});
            y.onready = ply(function (key, val) {
             // This function needs documentation.
                y.val[key] = avar({val: {f: f, x: val}}).
                    Q(function (evt) {
                     // This function needs documentation.
                        this.val = this.val.f(this.val.x);
                        return evt.exit();
                    });
                return;
            });
            when.apply(null, [y].concat(y.val)).onready = function (evt) {
             // This function needs documentation.
                ply(y.val).by(function (key, val) {
                 // This function needs documentation.
                    y.val[key] = val.val;
                    return;
                });
                return evt.exit();
            };
            return y;
        };
        return afunc;
    };

    mothership = 'http://qmachine.org';

    my_eval = function (code, context, file, callback) {
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

    ply = Q.ply;

    reduce = function (f) {
     // This function needs to be recursive, but ... how best to do it?
        var afunc, x;
        x = f;
        afunc = function (evt) {
         // This function needs documentation.
            var x, y;
            x = this;
            if ((this.hasOwnProperty('isready')) ||
                    (this.hasOwnProperty('areready'))) {
             // This arm needs documentation.
                y = reduce.apply(this, this.val).using(f);
            } else {
                y = reduce(this.val).using(f);
            }
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = function (y_evt) {
             // This function needs documentation.
                if (y.val.length <= 1) {
                    x.val = y.val[0];
                    y_evt.exit();
                    return evt.exit();
                }
                x.val = y.val;
                y_evt.exit();
                return evt.stay('Re-reducing ...');
            };
            return;
        };
        afunc.using = function (f) {
         // This function needs documentation.
            var y = avar({val: x});
            y.onready = function (evt) {
             // This function runs locally because it closes over `x`.
                var i, n, pairs;
                n = x.length;
                pairs = [];
                if ((n % 2) === 1) {
                    pairs.push({y: x[0]});
                }
                for (i = (n % 2); i < n; i += 2) {
                    pairs.push({f: f, x: [x[i], x[i + 1]]});
                }
                y.val = pairs;
                return evt.exit();
            };
            y.onready = map(function (each) {
             // This function needs documentation.
                if (each.hasOwnProperty('y')) {
                    return each.y;
                }
                return each.f(each.x[0], each.x[1]);
            });
            return y;
        };
        return afunc;
    };

    repl = require('repl');

    retrieve = function (f) {
     // This function needs documentation.
        var y = avar();
        y.onready = function (evt) {
         // This function needs documentation.
            var flag, i;
            flag = false;
            i = 0;
            while ((flag === false) && (i < state.shelf.length)) {
                if (f(state.shelf[i]) === true) {
                    y.val = state.shelf.splice(i, 1)[0];
                    flag = true;
                } else {
                    i += 1;
                }
            }
            if (flag === false) {
                return evt.stay('Nothing matched yet ...');
            }
            return evt.exit();
        };
        return y;
    };

    state = {
     // This object needs documentation. It may also need a mechanism to keep
     // the requests from polling too quickly. Eventually I'd like to move to
     // HTML5 Server Sent Events, but for now, GET and POST will have to do.
        box: avar().key,
        requests_remaining: 10,
        shelf: []
    };

    url = require('url');

    vm = require('vm');

    when = Q.when;

 // Prototype definitions

    if (Q.hasOwnProperty('box') === false) {
     // Here, we enable users to send jobs to different "boxes" by labeling
     // the avars on a per-case basis, rather than on a session-level basis.
     // More explanation will be included in the upcoming paper :-)
        Object.defineProperty(Q, 'box', {
            configurable: false,
            enumerable: true,
            get: function () {
             // This function needs documentation.
                return state.box;
            },
            set: function (x) {
             // This function needs documentation.
                state.box = x.toString();
                return;
            }
        });
        Object.defineProperty(avar().constructor.prototype, 'box', {
            configurable: true,
            enumerable: false,
            get: function () {
             // This function needs documentation.
                return state.box;
            },
            set: function (x) {
             // This function needs documentation.
                Object.defineProperty(this, 'box', {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: x.toString()
                });
                return;
            }
        });
    }

 // Out-of-scope definitions

    exports.launch_client = launch_client;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
