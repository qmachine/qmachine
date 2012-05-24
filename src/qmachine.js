//- JavaScript source code

//- qmachine.js ~~
//                                                      ~~ (c) SRW, 21 May 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, ajax_request, avar, capture, http_GET, http_POST, isArrayLike,
        isBrowser, isNodejs, isWebWorker, lib, map, mothership, ply, reduce,
        retrieve, state, when;

 // Definitions

    Q = Object.prototype.Q;

    ajax_request = function () {
     // This function generates a new AJAX request object. I have not yet
     // experimented with Web Sockets, but those might prove very useful.
        var req;
        if (global.hasOwnProperty('XMLHttpRequest')) {
            req = new global.XMLHttpRequest();
            if (global.location.host !== mothership) {
                if (req.hasOwnProperty('withCredentials')) {
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
     // This function needs documentation.
        state.shelf.push(data);
        return avar().revive();
    };

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
            pool_req.onready = function (evt) {
             // This function needs documentation.
                /*jslint node: true */
                if (isNodejs() === false) {
                    return evt.exit();
                }
                var module_http, module_url, options, req;
                module_http = require('http');
                module_url = require('url');
                options = module_url.parse(href);
                req = module_http.request(options, function (res) {
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
            pool_req.onready = function (evt) {
             // This function needs documentation.
                /*jslint node: true */
                if (isNodejs() === false) {
                    return evt.exit();
                }
                var module_http, module_url, options, req;
                module_http = require('http');
                module_url = require('url');
                options = module_url.parse(href);
                options.method = 'POST';
                req = module_http.request(options, function (res) {
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

    isArrayLike = function (x) {
     // This function is useful for identifying an "Array-Like Object", which
     // is an object whose 'length' property represents its maximum numerical
     // property key. Such objects may use Array methods generically, and for
     // iteration this can be especially useful. The two surprises here are
     // functions and strings. A function has a 'length' property representing
     // its arity (number of input arguments), unfortunately, so it cannot be
     // considered an Array-Like Object. A string is actually a primitive, not
     // an object, but it can still be used as an Array-Like Object :-)
        return ((x !== null) &&
                (x !== undefined) &&
                (typeof x !== 'function') &&
                (x.hasOwnProperty('length')));
    };

    isBrowser = function () {
     // This function needs documentation.
        return ((global.hasOwnProperty('location'))             &&
                (global.hasOwnProperty('navigator'))            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    isNodejs = function () {
     // This function needs documentation.
        return ((global.hasOwnProperty('process') === true));
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
             // This function needs documentation.
                /*jslint browser: true */
                var current, flag, i, n, script;
                current = global.document.getElementsByTagName('script');
                flag = false;
                n = current.length;
                for (i = 0; (flag === false) && (i < n); i += 1) {
                    if (url === current[i].src) {
                        flag = true;
                    }
                }
                if (flag === true) {
                    return evt.exit();
                }
                script = global.document.createElement('script');
                script.onload = function () {
                 // This function needs documentation.
                    return evt.exit();
                };
                script.src = url;
                if ((global.document.body instanceof Object) === false) {
                    global.document.head.appendChild(script);
                } else {
                    global.document.body.appendChild(script);
                }
                script = null;
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
        return function (evt) {
         // This function needs documentation.
            return evt.fail('`map` is under construction.');
        };
    };

    mothership = 'http://qmachine.org';

    ply = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            return evt.fail('`ply` is under construction.');
        };
    };

    reduce = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            return evt.fail('`reduce` is under construction.');
        };
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

    (function () {
     // Here, we add some static methods to Q that make QMachine a little
     // more convenient to use ...
        var key, template;
        template = {
            capture:    capture,
            lib:        lib,
            map:        map,
            ply:        ply,
            reduce:     reduce,
            retrieve:   retrieve
        };
        for (key in template) {
            if (template.hasOwnProperty(key)) {
                if (Q.hasOwnProperty(key) === false) {
                    Object.defineProperty(Q, key, {
                        configurable: false,
                        enumerable: true,
                        writable: false,
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
            var x, y;
            x = {box: (box || Q.box), status: 'waiting', val: []};
            y = http_GET(x);
            y.onready = function (evt) {
             // This function deserializes the string returned by QMachine
             // into the array of keys that it represents. This is one of the
             // rare instances in which I knowingly change the data type by
             // assignment -- this is not typically advisable because it may
             // confuse the JIT compilers and thereby hurt performance.
                y.val = JSON.parse(y.val);
                return evt.exit();
            };
            return y;
        },
        read: function (x) {
         // This function needs documentation.
            var y = http_GET(x);
            y.onready = function (evt) {
             // This function deserializes the string returned as the 'val' of
             // 'y' into a 'temp' variable and then uses them to update the
             // property values of 'y'. It returns an avar.
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
         // about the return data because QMachine isn't going to return any
         // data -- the request will either succeed or fail, as indicated by
         // the HTTP status code returned. It returns an avar.
            return http_POST(x);
        }
    });

 // Configure a background "daemon" to revive execution if appropriate ...

    if (typeof global.setInterval === 'function') {
        global.setInterval(Q.avar().revive, 1000);
    }

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
