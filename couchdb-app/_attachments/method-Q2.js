//- JavaScript source code

//- method-Q2.js ~~
//
//  For now, this supports some vaguely generalized array patterns, but they
//  can only be executed locally -- I don't want to deal with AJAX quite yet.
//
//                                                      ~~ (c) SRW, 07 Sep 2011

Object.prototype.Q = (function (global) {
    "use strict";

 // Declarations

    var __DEBUG__, ajax$get, ajax$getNOW, ajax$put, ajax$putNOW, bookmarks,
        celebrate, define, die, filter, isFunction, map, methodQ, ply,
        postpone, reduce, uuid;

 // Fake macros

    __DEBUG__ = false;

 // Constructors

    function ExitFailure(report) {
        this.report = report;
        return this;
    }

    function ExitSuccess(report) {
        this.report = report;
        return this;
    }

    function QuanahVar(x) {
        var content, job, ready, revive, stack, that;
        content = x;
        job = undefined;
        ready = true;
        revive = function () {
            if (ready === true) {
                job = stack.shift();
                if (job !== undefined) {
                    try {
                        job.call(that, that.content);
                    } catch (err) {
                        that.trigger = err;
                    }
                }
            }
        };
        stack = [];
        that = this;
        define(that, "content", {
            configurable: false,
            enumerable: true,
            get: function () {
                if (__DEBUG__ === true) {
                    console.log("(tripped getter)");
                }
                return content;
            },
            set: function (x) {
                content = x;
                if (__DEBUG__ === true) {
                    console.log("(tripped setter)");
                }
                return content;
            }
        });
        define(that, "onready", {
            configurable: false,
            enumerable: true,
            get: function () {
             // This is intended to provide a means to inspect outstanding
             // tasks that have not yet been applied to the content's value
             // but JS pass-by-reference immediately implies that it could
             // be used to modify the queue in-place ...
                return (stack.length === 0) ? null : stack[0];
            },
            set: function (f) {
                if (isFunction(f) === true) {
                    stack.push(f);
                    revive();
                } else {
                    throw new Error('"onready" only accepts functions.');
                }
            }
        });
        define(that, "trigger", {
            configurable: false,
            enumerable: true,
            get: function () {
             // (this is a placeholder so console inspection works correctly)
            },
            set: function (x) {
                switch (x.constructor) {
                case ExitSuccess:
                    if (__DEBUG__ === true) {
                        console.log("(exit success)");
                    }
                    ready = true;
                    return that;
                case ExitFailure:
                    if (__DEBUG__ === true) {
                        console.log("(exit failure)");
                    }
                    return that;
                case TryAgainLater:
                    if (__DEBUG__ === true) {
                        console.log("(try again later)");
                    }
                    stack.unshift(job); //- put it back in front of the rest
                    ready = false;
                    return that;
                default:
                    if (__DEBUG__ === true) {
                        console.log("(unknown trigger)");
                    }
                    if ((x instanceof Error) === true) {
                        if (x.hasOwnProperty("stack")) {
                         // I find this very useful in Google Chrome.
                            console.error(x.stack);
                        } else {
                            console.error(x);
                        }
                    }
                    return that;
                }
            }
        });
        define(that, "type", {
            configurable: false,
            enumerable: true,
            value: "QuanahVar"
        });
        that.onready = function (data) {
            var obj, url;
            obj = {
                "_id":      uuid(),
                content:    data
            };
            url = bookmarks.db + obj._id;
            ajax$put(url, JSON.stringify(obj), function (err, txt) {
                if (err === null) {
                    that.url = url;
                    ready = true;
                    revive();
                } else {
                    that.trigger = err;
                }
            });
        };
        return that;
    }

    function TryAgainLater(message) {
        if (message.toString().length === 0) {
            this.message = "Dying ...";
        } else {
            this.message = message.toString();
        }
    }

    TryAgainLater.prototype = new Error();

 // Definitions

    ajax$get = function (url, callback) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            var err, txt;
            err = null;
            txt = null;
            if (req.readyState === 4) {
                if (req.status === 200) {
                    txt = req.responseText;
                } else {
                    err = new Error('Could not GET from "' + url + '".');
                }
                if (isFunction(callback) === true) {
                    callback(err, txt);
                }
            }
        };
        req.open("GET", url, true);
        req.send(null);
        return req;
    };

    ajax$getNOW = function (url) {
     // This wrapper uses the synchronous version of XHR, which means your
     // program will be using JAX, not AJAX, when you use this function.
     // In other words, this, like other blocking calls, is an enemy of
     // concurrency and should be used as infrequently as possible!
        var req = new XMLHttpRequest();
        req.open("GET", url, false);
        req.send();
        return req.responseText;
    };

    ajax$put = function (url, data, callback) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            var err, txt;
            err = null;
            txt = null;
            if (req.readyState === 4) {
                if (req.status === 201) {
                    txt = req.responseText;
                } else {
                    err = new Error('Could not PUT to "' + url + '".');
                }
                if (isFunction(callback) === true) {
                    callback(err, txt);
                }
            }
        };
        req.open("PUT", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.send(data);
        return req;
    };

    ajax$putNOW = function (url, data) {
     // (see note in "ajax$getNOW" :-)
        data = data || "";
        var req = new XMLHttpRequest();
        req.open('PUT', url, false);
        req.setRequestHeader("Content-type", "application/json");
        req.send(data);
        return req.responseText;
    };

    if (location.port === "") {
     // This happens if we are actually using the rewrite rules I created
     // for my personal machine, but I haven't tested them on CouchOne ...
        bookmarks = {
            app:    location.href.replace(location.pathname, '/'),
            db:     location.href.replace(location.pathname, '/db/'),
            uuids:  location.href.replace(location.pathname,
                        '/_uuids?count=1000')
        };
    } else if (location.port === "5984") {
     // This is CouchDB's default debugging port, and the convention then
     // is to disable rewrite rules when using that port. In that case, I
     // have avoided hard-coding assumptions about the deployment target
     // by instead opting to navigate paths relative to the current URL.
        bookmarks = {
            app:    location.href.replace(location.pathname, '/') +
                        location.pathname.match(/([\w]+\/){3}/)[0],
            db:     location.href.replace(location.pathname, '/') +
                        location.pathname.match(/([\w]+\/){1}/)[0],
            uuids:  location.href.replace(location.pathname,
                        '/_uuids?count=1000')
        };
    } else {
     // Because this is still experimental, we may find problems.
        throw new Error("Relative path detection fell through.");
    }

    celebrate = function (message) {
        this.trigger = new ExitSuccess(message);
    };

    define = function (obj, key, params) {
        if (typeof Object.defineProperty === 'function') {
            define = function (obj, key, params) {
                return Object.defineProperty(obj, key, params);
            };
        } else {
            define = function (obj, key, params) {
                var prop;
                for (prop in params) {
                    if (params.hasOwnProperty(prop) === true) {
                        switch (prop) {
                        case "get":
                            obj.__defineGetter__(key, params[prop]);
                            break;
                        case "set":
                            obj.__defineSetter__(key, params[prop]);
                            break;
                        case "value":
                            delete obj[key];
                            obj[key] = params[prop];
                            break;
                        default:
                         // (placeholder)
                        }
                    }
                }
                return obj;
            };
        }
        return define(obj, key, params);
    };

    die = function (message) {
        this.trigger = new ExitFailure(message);
    };

    filter = function (x, f) {
     // NOTE: This is only one possible interpretation of a generalized filter
     // pattern, and I wrote it sort of off-the-cuff. It may change!
        var y;
        if ((x instanceof Object) === false) {
         // For now, we simply won't allow it ...
            throw new Error('Cannot "filter" a primitive.');
        } else {
            y = Object.create(Object.getPrototypeOf(x));
            ply(x, function (key, val) {
                if (f(val) === true) {
                    y[key] = val;
                }
            });
        }
        return y;
    };

    isFunction = function (f) {
        return ((f instanceof Function) && (typeof f === 'function'));
    };

    map = function (x, f) {
        var y;
        if ((x instanceof Object) === false) {
            //y = f(x);
            throw new Error('Cannot "map" a primitive.');
        } else {
            y = Object.create(Object.getPrototypeOf(x));
            ply(x, function (key, val) {
                y[key] = f(val);
            });
        }
        return y;
    };

    methodQ = function (f) {
        var x, y;
        x = (this instanceof QuanahVar) ? this : new QuanahVar(this);
        y = new QuanahVar(null);
        switch (f.name) {
        case "filter":
            y.onready = function () {
                x.onready = function (data) {
                    y.content = filter(data, f);
                    celebrate.call(x, '(finished "filter")');
                    celebrate.call(y, '(finished "filter")');
                };
            };
            return y;
        case "map":
            y.onready = function () {
                x.onready = function (data) {
                    y.content = map(data, f);
                    celebrate.call(x, '(finished "map")');
                    celebrate.call(y, '(finished "map")');
                };
            };
            return y;
        case "ply":
            x.onready = function (data) {
                ply(data, f);
                celebrate.call(x, '(finished "ply")');
            };
            return x;
        case "reduce":
            y.onready = function () {
                x.onready = function (data) {
                    y.content = reduce(data, f);
                    celebrate.call(x, '(finished "reduce")');
                    celebrate.call(y, '(finished "reduce")');
                };
            };
            return y;
        default:
            x.onready = f;
            return x;
        }
    };

    ply = function (x, f) {
        var key;
        if ((x instanceof Object) === false) {
            f(undefined, x);
        } else {
            for (key in x) {
                if (x.hasOwnProperty(key)) {
                    f(key, x[key]);
                }
            }
        }
    };

    postpone = function (message) {
        this.trigger = new TryAgainLater(message);
    };

    reduce = function (x, f) {
        var first, y;
        if ((x instanceof Object) === false) {
            throw new Error('Cannot "reduce" a primitive.');
        } else {
            first = true;
            ply(x, function (key, val) {
                if (first === true) {
                    first = false;
                    y = val;            //- initialize y
                } else {
                    y = f(y, val);      //- apply a simple left-reduce pattern
                }
            });
            return y;
        }
    };

    uuid = function () {
     // This function dispenses a UUID from a memoized cache of values it has
     // already fetched from CouchDB. It refills the cache using AJAX, and if
     // the cache actually runs out at any point, it refills itself using the
     // blocking form of XHR in order to guarantee correct behavior.
        var cache = [];
        uuid = function () {
            if (cache.length < 500) {
                ajax$get(bookmarks.uuids, function (err, txt) {
                    if (err) {
                        throw err;
                    }
                    cache.push.apply(cache, JSON.parse(txt).uuids);
                });
                if (cache.length === 0) {
                    cache.push.apply(cache,
                        JSON.parse(ajax$getNOW(bookmarks.uuids)).uuids);
                }
            }
            return cache.pop();
        };
        return uuid();
    };

    return methodQ;

}(function (outer_scope) {
    "use strict";
    return (this === null) ? outer_scope : this;
}.call(null, this)));

//- Demonstrations -- FOR DEBUGGING PURPOSES ONLY! The biggest thing to note
//  here is that my nice messaging functions are NOT available in this scope!

(function demos() {
    "use strict";

 // Declarations

    var puts, q, x, y;

 // Definitions

    puts = function () {
        console.log.apply(console, arguments);
    };

    //(q is defined at the end of this scope for clarity)

    x = [1, 2, 3, 4, 5];

    y = [];

 // Invocations

    y[0] = x.Q(function map(each) {
        return 3 * each;
    });

    y[0].onready = function (data) {
        console.log(data);              //> [3, 6, 9, 12, 15]
    };

    y[1] = x.Q(function reduce(a, b) {
        return a + b;
    });

    y[1].onready = function (data) {
        console.log(data);              //> 15
    };

    y[2] = x.
        Q(function map(each) {
            return each + 2;
        }).
        Q(function reduce(a, b) {
            return a * b;
        });

    y[2].onready = function (data) {
        console.log(data);              //> 2520
    };

    y[3] = x.
        Q(function filter(each) {
            return (each > 2);
        }).
        Q(function map(each) {
            return 2 * each;
        }).
        Q(function reduce(a, b) {
            return a + b;
        });

    y[3].onready = function (data) {
        console.log(data);              //> 24
    };

 // That part surprised me, so I wanted to take a closer look ...

    y[4] = x.
        Q(function filter(each) {
            return (each > 2);
        }).
        Q(function ply(key, val) {
            console.log(key + ": " + val);
        });

 // Also, I wanted to see how difficult it would be to modify the current
 // design to support a different invocation pattern -- it's trivial :-)

    q = function (f) {
        return function (x) {
            return x.Q(f);
        };
    };

    y[5] = q(function map(each) { return 2 * each; })(x);

    y[5].onready = function (data) {
        console.log(data);
    };

 // Finally, we'll just go ahead and print y to see what it looks like :-)

    console.log(y);

}());

//- vim:set syntax=javascript:
