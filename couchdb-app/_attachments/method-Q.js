//- JavaScript source code

//- method-Q.js ~~
//
//  This file defines Quanah as a self-contained, standalone Object method. It
//  does not use Web Chassis, but much of its code has been adapted directly
//  from Web Chassis under the assumption of a browser-based environment.
//
//  Here's a nice example program, by the way:
//
//      var x;
//      x = [1, 2, 3, 4, 5].
//          Q(function map(each) {
//              return 3 * each;
//          }).
//          Q(function reduce(a, b) {
//              return a + b;
//          });
//
//                                                      ~~ (c) SRW, 03 Sep 2011

/*jslint indent: 4, maxlen: 80 */

Object.prototype.Q = (function (global) {
    "use strict";

 // Declarations

    var ajax$get, ajax$getNOW, ajax$put, ajax$putNOW, bookmarks, def, loc,
        map, ply, reduce, share, uuid, volunteer;

 // Constructors

    function CouchDoc(obj) {
     // This function is a constructor that produces CouchDoc objects. A
     // CouchDoc object corresponds directly to a document on CouchDB, and
     // this one-to-one correspondence keeps things simple. I build Quanah's
     // basic data structures using this as a building block.
        if (obj instanceof CouchDoc) {
            return obj;
        }
        var queue, ready, that, url;
        queue = [];
        ready = false;
        that = this;
        def(that, "onready", {
            configurable:   false,
            enumerable:     true,
            get: function () {
                return (queue.length > 0) ? queue[0] : null;
            },
            set: function (f) {
                if (typeof f === 'function') {
                    queue.push(f);
                } else {
                    throw new Error('"onready" assignment must be function.');
                }
                if (ready === true) {
                 // If it's already ready, trigger its "ready" setter :-P
                    that.ready = true;
                }
            }
        });
        def(that, "ready", {
            configurable:   false,
            enumerable:     true,
            get: function () {
                return ready;
            },
            set: function (state) {
             // First, we set the CouchDoc's ready state.
                if (typeof state === 'boolean') {
                    ready = state;
                } else {
                    throw new Error('"ready" assignment must be Boolean.');
                }
             // Then, we run the next function in the queue :-)
                if (ready === true) {
                    ready = false;
                    if (queue.length > 0) {
                        queue.pop()();
                    }
                }
            }
        });
        that._id = uuid();
        that.value = (typeof obj !== 'undefined') ? obj : null;
        that.type = "CouchDoc";     //- useful for writing CouchDB filters
        url = bookmarks.db + that._id;
        ajax$put(url, JSON.stringify(that), function (err, txt) {
            if (err !== null) {
                throw err;
            }
            var response = JSON.parse(txt);
            if (response.ok === true) {
                that._rev = response.rev;
                that.ready = true;
            } else {
                throw new Error(txt);
            }
        });
        return that;
    }

    CouchDoc.prototype.sync = function () {
     // Here, we set the convention that "ready" <=> "synced".
        if (this.ready === true) {
            return;
        }
        var that, url;
        that = this;
        url = bookmarks.db + that._id;
     // Pull
        ajax$get(url, function (err, txt) {
            if (err !== null) {
             // (ignore for now)
            }
            var key, response, rev;
            response = JSON.parse(txt);
            rev = parseInt(that._rev) || 0;
            if (rev < parseInt(response._rev)) {
                for (key in that) {
                    if (that.hasOwnProperty(key) === true) {
                        if (response.hasOwnProperty(key) === true) {
                            that[key] = response[key];
                        } else {
                            delete that[key];
                        }
                    }
                }
                that.ready = true;
            } else {
             // Push
                ajax$put(url, JSON.stringify(that), function (err, txt) {
                    if (err !== null) {
                     // (ignore for now)
                    }
                    var response = JSON.stringify(txt);
                    if (response.ok === true) {
                        that._rev = response.rev;
                        that.ready = true;
                    } else {
                     // (ignore for now)
                    }
                });
            }
        });
    };

 // Definitions

    ajax$get = function (url, callback) {
        if ((callback instanceof Function) === false) {
         // This test is not quite specific enough ...
            callback = function () {};
        }
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
                callback(err, txt);
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
        if ((callback instanceof Function) === false) {
            callback = function () {};
        }
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
                callback(err, txt);
            }
        };
        req.open("PUT", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.send(data);
        return req;
    };

    ajax$putNOW = function (url, data) {
     // This wrapper uses the synchronous version of XHR, which means your
     // program will be using JAX, not AJAX, when you use this function.
     // In other words, this, like other blocking calls, is an enemy of
     // concurrency and should be used as infrequently as possible!
        data = data || "";
        var req = new XMLHttpRequest();
        req.open('PUT', url, false);
        req.setRequestHeader("Content-type", "application/json");
        req.send(data);
        return req.responseText;
    };

    def = function (obj, key, params) {
        if (typeof Object.defineProperty === 'function') {
            def = function (obj, key, params) {
                return Object.defineProperty(obj, key, params);
            };
        } else {
            def = function (obj, key, params) {
                var each;
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
                            obj[key] = params[each];
                            break;
                        default:
                            // (placeholder)
                        }
                    }
                }
                return obj;
            };
        }
        return def(obj, key, params);
    };

    loc = global.location;

    if (loc.port === "") {
     // This happens if we are actually using the rewrite rules I created for
     // my personal machine, but I haven't tested them yet on CouchOne ...
        bookmarks = {
            app:    loc.href.replace(loc.pathname, '/'),
            db:     loc.href.replace(loc.pathname, '/db/'),
            uuids:  loc.href.replace(loc.pathname, '/_uuids?count=1000')
        };
    } else if (loc.port === "5984") {
     // This is CouchDB's default debugging port, and the convention here is
     // to disable rewrite rules when using that port. In that case, I have
     // avoided hard-coding assumptions about the deployment target by instead
     // opting to navigate paths relative to the current URL.
        bookmarks = {
            app:    loc.href.replace(loc.pathname, '/') +
                        loc.pathname.match(/([\w]+\/){3}/)[0],
            db:     loc.href.replace(loc.pathname, '/') +
                        loc.pathname.match(/([\w]+\/){1}/)[0],
            uuids:  loc.href.replace(loc.pathname, '/_uuids?count=1000')
        };
    } else {
     // Because this detection is still experimental, we may find problems.
        throw new Error("Relative path detection fell through.");
    }

    map = function (x, f) {
        var y;
        switch (typeof x) {
        case "undefined":
            return undefined;
        case "null":
            return null;
        case "boolean":
            return f(x);
        case "number":
            return f(x);
        case "string":
            return f(x);
        default:
            if ((x instanceof CouchDoc) === true) {
                y = share({});
                y.onready = function () {
                    x.onready = function () {
                        y.value = map(x.value, f);
                        y.sync();
                        x.sync();
                    };
                };
            } else {
                y = Object.create(Object.getPrototypeOf(x));
                ply(x, function (key, val) {
                    y[key] = f(val);
                });
            }
            return y;
        }
    };

    ply = function (x, f) {
     // This is a general-purpose functional iterator for key-value pairs. The
     // version shown here is _clearly_ not optimized for performance. I still
     // don't think we need to return the original object from "ply" itself.
        var key;
        if ((x instanceof Object) === false) {
            f(x);
        }
        if ((x instanceof CouchDoc) === true) {
            x.onready = function () {
                ply(x.value, f);
                x.sync();
            };
        } else {
            for (key in x) {
                if (x.hasOwnProperty(key) === true) {
                    f(key, x[key]);
                }
            }
        }
    };

    reduce = function (x, f) {
        if ((x instanceof Object) === false) {
            throw new Error('Method "Q" cannot reduce a primitive.');
        }
        var first, y;
        first = true;
        if ((x instanceof CouchDoc) === true) {
            y = share({});
            y.onready = function () {
                x.onready = function () {
                    y.value = reduce(x.value, f);
                    y.sync();
                    x.sync();
                };
            };
        } else {
            ply(x, function (key, val) {
                if (first === true) {
                    first = false;
                    y = val;
                } else {
                    y = f(y, val);
                }
            });
        }
        return y;
    };

    share = function (x) {
     // This function provides a simple way to push arbitrary data to Quanah.
        return new CouchDoc(x);
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

    volunteer = function (x, f) {
     // This function encapsulates the tasks of the volunteer machines into a
     // private closure that can be called from method Q :-)
        return "(volunteer function was invoked correctly :-)";
    };

 // Finally, we will define and return the definition for method Q :-)

    return function (f) {
        "use strict";

     // Prerequisites

        if ((f instanceof Function) !== true) {
            throw new Error('Method "Q" expects a function as its argument.');
        }

     // Declarations

        var x;

     // Definitions

        x = share(this);

     // Invocations

        switch (f.name) {
        case "map":
            return map(x, f);
        case "ply":
            ply(x, f);
            return x;
        case "reduce":
            return reduce(x, f);
        case "volunteer":
            return volunteer(x, f);
        default:
            throw new Error('Method "Q" has no command "' + f.name + '".');
        }

    };

}(function (outer_scope) {
    "use strict";
    return (this === null) ? outer_scope : this;
}.call(null, this)));

//- vim:set syntax=javascript:
