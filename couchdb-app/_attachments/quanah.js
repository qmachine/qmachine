//- JavaScript source code

//- quanah.js ~~
//
//  This program a single global module, QUANAH, that contains the utilities
//  necessary for interacting with Quanah itself. These are mainly useful at
//  the moment for rapid development with the object method Q, but eventually
//  these won't be necessary because I will provide extension methods directly
//  inside Q itself :-)
//
//                                                      ~~ (c) SRW, 10 Sep 2011

var QUANAH;

QUANAH = (function (global) {           //- (begin strict anonymous closure #1)
    "use strict";

 // Private declarations

    var ajax$get, ajax$getNOW, ajax$put, ajax$putNOW, bookmarks, define,
        isFunction, uuid;

 // Private definitions

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

    bookmarks = (function () {
        var loc = global.location;
        if (loc.port === "") {
         // This happens if we are actually using the rewrite rules I created
         // for my personal machine, but I haven't tested them on CouchOne ...
            return {
                app:    loc.href.replace(loc.pathname, '/'),
                db:     loc.href.replace(loc.pathname, '/db/'),
                uuids:  loc.href.replace(loc.pathname, '/_uuids?count=1000')
            };
        } else if (loc.port === "5984") {
         // This is CouchDB's default debugging port, and the convention then
         // is to disable rewrite rules when using that port. In that case, I
         // have avoided hard-coding assumptions about the deployment target
         // by instead opting to navigate paths relative to the current URL.
            return {
                app:    loc.href.replace(loc.pathname, '/') +
                            loc.pathname.match(/([\w]+\/){3}/)[0],
                db:     loc.href.replace(loc.pathname, '/') +
                            loc.pathname.match(/([\w]+\/){1}/)[0],
                uuids:  loc.href.replace(loc.pathname, '/_uuids?count=1000')
            };
        } else {
         // Because this is still experimental, we may find problems.
            throw new Error("Relative path detection fell through.");
        }
    }());

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

 // Finally, we return the object to be stored as the global QUANAH module.

    return {
        ajax$get:       ajax$get,
        ajax$getNOW:    ajax$getNOW,
        ajax$put:       ajax$put,
        ajax$putNOW:    ajax$putNOW,
        bookmarks:      bookmarks,
        define:         define,
        isFunction:     isFunction,
        uuid:           uuid
    };

}(function (outer_scope) {              //- (begin strict anonymous closure #2)
    "use strict";
    return (this === null) ? outer_scope : this;
}.call(null, this)));                   //- (end both strict anonymous closures)

//- vim:set syntax=javascript:
