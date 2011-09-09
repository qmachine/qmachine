//- JavaScript source code

//- method-Q.js ~~
//
//  I bombed it back to the Pseudocode Age :-P
//
//  NOTES:
//  -   I think I can encapsulate the "revive"-related stuff into its own type
//      that I could then instantiate privately inside each new QuanahVar ...
//
//                                                      ~~ (c) SRW, 08 Sep 2011

/*jslint indent: 4, maxlen: 80 */

Object.prototype.Q = (function (global) {
    "use strict";

 // Declarations

    var ajax$get, ajax$getNOW, ajax$put, ajax$putNOW, bookmarks, define,
        isFunction, uuid;

 // Constructors

    function QuanahFxn(f) {
        if (isFunction(f) === false) {
            throw new Error("Method Q expects a function as its argument.");
        }
        var that = this;
        if (isFunction(f.toJSON)) {
            that.content = f.toJSON();
        } else if (typeof f.toSource === 'function') {
            that.content = f.toSource();
        } else if (typeof f.toString === 'function') {
            that.content = f.toString();
        } else {
            throw new Error("Method Q cannot stringify the given function.");
        }
        that.type = "QuanahFxn";
        return that;
    }

    function QuanahTask(f, x, y) {
        var that = this;
        define(that, "argv", {
            configurable: false,
            enumerable: true,
            get: function () {
             // (placeholder)
            },
            set: function (url) {
             // (placeholder)
            }
        });
        define(that, "main", {
            configurable: false,
            enumerable: true,
            get: function () {
             // (placeholder)
            },
            set: function (url) {
             // (placeholder)
            }
        });
        define(that, "onready", {
            configurable: false,
            enumerable: true,
            get: function () {
             // (placeholder)
            },
            set: function (f) {
             // (placeholder)
            }
        });
        define(that, "results", {
            configurable: false,
            enumerable: true,
            get: function () {
             // (placeholder)
            },
            set: function (url) {
             // (placeholder)
            }
        });
        f.onready = function (url) {
            that.main = url;
        };
        x.onready = function (url) {
            that.argv = url;
        };
        y.onready = function (url) {
            that.results = url;
        };
        return that;
    }

    function QuanahVar(x) {
     // (placeholder)
    }

 // Constructor prototype definitions

    QuanahFxn.prototype = new QuanahVar(null);

    QuanahTask.prototype = new QuanahVar(null);

    QuanahVar.prototype.pull = function () {
     // (placeholder)
    };

    QuanahVar.prototype.push = function () {
     // (placeholder)
    };

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

    isFunction = function (f) {
        return ((typeof f === 'function') && (f instanceof Function));
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

 // Finally, we will define and return that definition for "Method Q" :-)

    return function (func) {
        var f, x, y;
        f = new QuanahFxn(func);
        x = new QuanahVar(this);
        y = new QuanahVar(null);
        return new QuanahTask(f, x, y);
    };

}(function (outer_scope) {
    "use strict";
    return (this === null) ? outer_scope : this;
}.call(null, this)));

//- vim:set syntax=javascript:
