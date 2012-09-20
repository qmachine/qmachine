//- JavaScript source code

//- qmachine.js ~~
//
//  I am now separating the Node.js client into another file ...
//
//                                                      ~~ (c) SRW, 19 Sep 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        ActiveXObject, Q, XDomainRequest, XMLHttpRequest, appendChild, apply,
        avar, body, box, by, call, capture, clearTimeout, concat, configurable,
        console, constructor, createElement, defineProperty, document,
        enumerable, error, exit, f, fail, get, getElementsByTagName, global,
        hasOwnProperty, head, host, importScripts, init, jobs, key, length,
        lib, location, map, onerror, onload, onready, onreadystatechange, open,
        parse, ply, protocol, prototype, push, read, readyState, reduce,
        requests_remaining, responseText, retrieve, revive, send, set,
        setRequestHeader, setTimeout, shelf, splice, src, status, stay,
        stringify, toString, using, val, value, when, withCredentials,
        writable, write, x, y
    */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, ajax_request, avar, capture, https_GET, https_POST, isBrowser,
        isFunction, isWebWorker, lib, map, mothership, origin, ply, reduce,
        retrieve, state, when;

 // Definitions

    Q = Object.prototype.Q;

    ajax_request = function () {
     // This function generates a new AJAX request object. I have not yet
     // experimented with Web Sockets, but those might prove very useful.
        var req;
        if (global.hasOwnProperty('XMLHttpRequest')) {
            req = new global.XMLHttpRequest();
            if (origin() !== mothership) {
             // This is a slightly weaker test than using `hasOwnProperty`,
             // but it may work better with Firefox. I'll test in a minute.
                if (req.withCredentials !== undefined) {
                    return req;
                }
                if (global.hasOwnProperty('XDomainRequest')) {
                    return new global.XDomainRequest();
                }
                throw new Error('This browser does not support CORS.');
            }
        } else if (global.hasOwnProperty('ActiveXObject')) {
            req = new global.ActiveXObject('Microsoft.XMLHTTP');
        } else {
            throw new Error('This browser does not support AJAX.');
        }
        return req;
    };

    avar = Q.avar;

    capture = function (data) {
     // This function "captures" incoming data by saving a reference to it
     // in `state.shelf`. It is quite useful when combined with JSONP :-)
        state.shelf.push(data);
        return avar().revive();
    };

    https_GET = function (x) {
     // This function needs documentation.
        var y = avar(x);
     // Do NOT remove the following line, because it is actually necessary!
     // Input argument `x` may or may not have its own `box` property, but `y`
     // needs to fix the value as a constant ... more explanation is needed ...
        y.box = x.box;
        y.onready = function (evt) {
         // This function needs documentation.
            var href, pool_req;
         // NOTE: Do NOT change the following to say `y.key` etc.!
            if (x.hasOwnProperty('key')) {
                href = mothership + '/box/' + x.box + '?key=' + x.key;
            } else if (x.hasOwnProperty('status')) {
                href = mothership + '/box/' + x.box + '?status=' + x.status;
            } else {
                return evt.fail('No flags specified for `https_GET`.');
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
                if (isBrowser() === false) {
                    return evt.exit();
                }
                var req = ajax_request();
                req.onreadystatechange = function () {
                 // This function needs documentation.
                    if (req.readyState === 4) {
                        if (req.status === 502) {
                         // These are really annoying me because I am having
                         // trouble figuring out what's wrong with my server.
                         // In the meantime, I'll just repeat ad nauseam :-P
                            return evt.stay();
                        }
                        if (req.status !== 200) {
                         // Something else went wrong, and we can't ignore it.
                            return evt.fail(req.responseText);
                        }
                        y.val = req.responseText;
                        return evt.exit();
                    }
                    return;
                };
                req.open('GET', href, true);
                req.send(null);
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

    https_POST = function (x) {
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
                if (isBrowser() === false) {
                    return evt.exit();
                }
                var req = ajax_request();
                req.onreadystatechange = function () {
                 // This function needs documentation.
                    if (req.readyState === 4) {
                        if (req.status === 502) {
                         // These are really annoying me because I am having
                         // trouble figuring out what's wrong with my server.
                         // In the meantime, I'll just repeat ad nauseam :-P
                            return evt.stay();
                        }
                        if (req.status !== 201) {
                         // Something else went wrong, and we can't ignore it.
                            return evt.fail(req.responseText);
                        }
                        y.val = req.responseText;
                        return evt.exit();
                    }
                    return;
                };
                req.open('POST', href, true);
                req.setRequestHeader('Content-Type', 'application/json');
                req.send(JSON.stringify(y));
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

    isBrowser = function () {
     // This function needs documentation.
        return ((global.hasOwnProperty('location'))             &&
                (global.hasOwnProperty('navigator'))            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    isFunction = function (f) {
     // This function needs documentation.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    isWebWorker = function () {
     // This function needs documentation.
        return ((global.hasOwnProperty('importScripts'))        &&
                (global.hasOwnProperty('location'))             &&
                (global.hasOwnProperty('navigator'))            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    lib = function (url) {
     // This function needs documentation.
        var y = avar();
        if (isWebWorker()) {
            y.onready = function (evt) {
             // This function needs documentation.
                global.importScripts(url);
                return evt.exit();
            };
        } else if (isBrowser()) {
            y.onready = function (evt) {
             // This function use the conventional "script tag loading"
             // technique to import external libraries. Ideally, it would try
             // to avoid loading libraries it has already loaded, but it turns
             // out that this is a very difficult once JSONP becomes involved
             // because those scripts _do_ need to reload every time. Thus, I
             // will need to start documenting best practices to teach others
             // how to construct idempotent scripts that won't leak memory and
             // plan to begin using "disposable execution contexts" like Web
             // Workers again soon. See also: http://goo.gl/byXCA .
                /*jslint browser: true, unparam: true */
                var current, script;
                current = global.document.getElementsByTagName('script');
                script = global.document.createElement('script');
                script.onload = function () {
                 // This function needs documentation.
                    return evt.exit();
                };
                script.src = url;
                ply(current).by(function (key, val) {
                 // This function needs documentation.
                    if (script.src === val.src) {
                     // Aha! At long last, I have found a practical use for
                     // Cantor's Diagonalization argument :-P
                        script.src += '?';
                    }
                    return;
                });
                if ((global.document.body instanceof Object) === false) {
                    global.document.head.appendChild(script);
                } else {
                    global.document.body.appendChild(script);
                }
                current = script = null;
                return;
            };
        } else {
            y.onready = function (evt) {
             // This function needs documentation.
                return evt.fail('Missing "lib" definition');
            };
        }
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
                y.val[key] = avar({val: {f: f, x: val}}).Q(function (evt) {
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

    mothership = 'MOTHERSHIP';

    origin = function () {
     // This function needs documentation.
        return global.location.protocol + '//' + global.location.host;
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

    when = Q.when;

 // Out-of-scope definitions

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
                if (typeof x !== 'string') {
                    throw new TypeError('`Q.box` must be a string.');
                }
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
                if (typeof x !== 'string') {
                    throw new TypeError('`box` property must be a string.');
                }
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

    (function () {
     // Here, we add some static methods to Q that make QMachine a little
     // more convenient to use ...
        var key, template;
        template = {
            capture:    capture,
            lib:        lib,
            map:        map,
            reduce:     reduce,
            retrieve:   retrieve
        };
        for (key in template) {
            if (template.hasOwnProperty(key)) {
                if (Q.hasOwnProperty(key) === false) {
                    Object.defineProperty(Q, key, {
                     // NOTE: I commented out two of the next three lines
                     // because their values match the ES5.1 default values.
                        //configurable: false,
                        enumerable: true,
                        //writable: false,
                        value: template[key]
                    });
                }
            }
        }
        return;
    }());

    Q.init({
        jobs: function (box) {
         // This function needs documentation.
            if ((box === undefined) || (box === null)) {
                box = Q.box;
            }
            var x, y;
            x = {box: box, status: 'waiting', val: []};
            y = https_GET(x);
            y.onready = function (evt) {
             // This function deserializes the string returned by QMachine into
             // the array of keys that it represents. This is one of the rare
             // instances in which I deliberately change a variable's "type" by
             // assignment -- this is not typically advisable because it may
             // impact the performance of JIT compilers.
                y.val = JSON.parse(y.val);
                return evt.exit();
            };
            return y;
        },
        read: function (x) {
         // This function needs documentation.
            var y = https_GET(x);
            y.onready = function (evt) {
             // This function deserializes the string returned as the `val` of
             // `y` into a `temp` variable and then uses them to update the
             // property values of `y`. It returns an avar.
                var key, temp;
                temp = avar(y.val);
                for (key in temp) {
                    if (temp.hasOwnProperty(key)) {
                        y[key] = temp[key];
                    }
                }
                return evt.exit();
            };
            return y;
        },
        write: function (x) {
         // This function sends an HTTP POST to QMachine. It doesn't worry
         // about the return data because QMachine isn't going to return
         // any data -- the request will either succeed or fail, as
         // indicated by the HTTP status code returned. It returns an avar.
            x.box = x.box;
            return https_POST(x);
        }
    }).Q(function (evt) {
     // This function configures a background "daemon" to revive execution if
     // nothing has triggered it in a while. This strategy allows an otherwise
     // completely event-driven model to avoid the deadlock that occurs when
     // the queue for a given box is completely empty, for example. I will be
     // re-evaluating this strategy soon, though, because it seems unnecessary.
     //
     // NOTE: I am reusing the avar that gets returned by the `init` method to
     // avoid the overhead of creating new avars needlessly every time.
     //
        if ((typeof global.clearTimeout === 'function') &&
                (typeof this.val === 'number')) {
            global.clearTimeout(this.val);
        }
        if (typeof global.setTimeout === 'function') {
            this.val = global.setTimeout(this.revive, 1000);
        }
        return evt.exit();
    }).onerror = function (message) {
     // This function needs documentation.
        if ((global.hasOwnProperty('console')) &&
                (isFunction(global.console.error))) {
            global.console.error('Error:', message);
        }
        return;
    };

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
