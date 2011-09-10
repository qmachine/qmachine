//- JavaScript source code

//- method-Q.js ~~
//
//  I bombed it back to the Pseudocode Age, but it's nearly completed anyway.
//  All jobs on Quanah are currently zombies because I haven't written the
//  "is it done yet?" part yet.
//
//                                                      ~~ (c) SRW, 08 Sep 2011

/*jslint indent: 4, maxlen: 80 */

Object.prototype.Q = (function (global) {
    "use strict";

 // Declarations

    var add_meta, add_onready, add_pusher, ajax$get, ajax$getNOW, ajax$put,
        ajax$putNOW, bookmarks, define, isFunction, uuid;

 // Constructors

    function QuanahFxn(f) {
        if (isFunction(f) === false) {
            throw new Error("Method Q expects a function as its argument.");
        }
        var that = this;
        that = add_meta(that, "QuanahFxn");
        that = add_onready(that);
        that = add_pusher(that, "content", (function () {
            if (isFunction(f.toJSON)) {
                return f.toJSON();
            } else if (isFunction(f.toSource)) {
                return f.toSource();
            } else if (isFunction(f.toString)) {
                return f.toString();
            } else {
                throw new Error("Method Q cannot stringify this function.");
            }
        }()));
        return that;
    }

    function QuanahTask(init) {
        var content, that;
        content = {
            argv:       init,
            main:       init,
            results:    init,
            status:     init
        };
        that = this;
        that = add_meta(that, "QuanahTask");
        that = add_onready(that);
        that = add_pusher(that, "content", content);
        return that;
    }

    function QuanahVar(x) {
        var that;
        that = this;
        that = add_meta(that, "QuanahVar");
        that = add_onready(that);
        that = add_pusher(that, "content", x);
        return that;
    }

 // Definitions

    add_meta = function (that, typename) {
        var id = uuid();
        that.meta = {
            _id:    id,
            _rev:   null,
            type:   typename,
            url:    bookmarks.db + id
        };
        return that;
    };

    add_onready = function (that) {
        var exit_generator, ready, revive, stack;
        exit_generator = function () {
            return {
                failure: function (message) {
                    console.error(message);
                },
                success: function (message) {
                    //console.log(message);
                    ready = true;
                    revive();
                }
            };
        };
        ready = true;
        revive = function () {
            var f;
            if (ready === true) {
                ready = false;
                f = stack.shift();
                if (f === undefined) {
                    ready = true;
                } else {
                    f.call(that, that.content, exit_generator());
                }
            }
        };
        stack = [];
        define(that, "onready", {
            configurable: false,
            enumerable: true,
            get: function () {
                return (stack.length > 0) ? stack[0] : null;
            },
            set: function (f) {
                if (isFunction(f) === false) {
                    throw new Error('"onready" callbacks must be functions.');
                }
                stack.push(f);
                revive();
            }
        });
        return that;
    };

    add_pusher = function (that, name, initial_value) {
        var content;
        content = initial_value;
        define(that, name, {
            configurable: false,
            enumerable: true,
            get: function () {
                return content;
            },
            set: function (x) {
                content = x;
                that.push();
            }
        });
        return that;
    };

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

 // Constructor prototype definitions

    QuanahFxn.prototype = new QuanahVar(null);

    QuanahTask.prototype = new QuanahVar(null);

    QuanahVar.prototype.pull = function () {
     // (placeholder)
    };

    QuanahVar.prototype.push = function () {
        var that = this;
        that.onready = function (data, exit) {
            var obj;
            obj = {
                _id:        that.meta._id,
                content:    data,
                type:       that.meta.type
            };
            if (that.meta._rev !== null) {
                obj._rev = that.meta._rev;
            }
            ajax$put(that.meta.url, JSON.stringify(obj), function (err, txt) {
                var response;
                if (err === null) {
                 // We can test for the presence of this property to see if
                 // the variable has been initialized on CouchDB yet or not.
                    response = JSON.parse(txt);
                    if (response.ok === true) {
                        that.meta._rev = response.rev;
                        exit.success('Finished "push" :-)');
                    } else {
                        exit.failure(response);
                    }
                } else {
                    exit.failure(err);
                }
            });
        };
        return that;
    };

 // Finally, we will define and return that definition for "Method Q" :-)

    return function (func) {
        var f, x, y, z;
        f = (new QuanahFxn(func)).push();
        x = (new QuanahVar(this)).push();
        y = (new QuanahVar(null)).push();
        z = (new QuanahTask(null)).push();
        z.onready = function (data_z, exit_z) {
            var counter, n;
            counter = function () {
                n += 1;
                if (n === 3) {
                    data_z.status = "waiting";
                    z.push();
                    exit_z.success(data_z);
                }
            };
            n = 0;
            f.onready = function (data, exit) {
                try {
                    z.content.main = f.meta.url;
                    exit.success('Stored the "main" property.');
                    counter();
                } catch (err) {
                    exit.failure(err);
                }
            };
            x.onready = function (data, exit) {
                try {
                    z.content.argv = x.meta.url;
                    exit.success('Stored the "argv" property.');
                    counter();
                } catch (err) {
                    exit.failure(err);
                }
            };
            y.onready = function (data, exit) {
                try {
                    z.content.results = y.meta.url;
                    exit.success('Stored the "results" property.');
                    counter();
                } catch (err) {
                    exit.failure(err);
                }
            };
        };
        return z;
    };

}(function (outer_scope) {
    "use strict";
    return (this === null) ? outer_scope : this;
}.call(null, this)));

//- vim:set syntax=javascript:
