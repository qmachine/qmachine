//- JavaScript source code

//- method-Q.js ~~
//
//  This version is not yet complete, so the summary here is more of a listing
//  of current design decisions:
//  -   http://localhost/?developer=false&developer=true
//
//  NEED TO FIX:
//  -   Redefine "uuid" so that it _never_ needs to block ...
//  -   Full consistency in QuanahVar properties
//  -   Finish the "onready" handler ...
//  -   Test for presence of native JSON and load it if missing?
//
//                                                      ~~ (c) SRW, 01 Oct 2011

(function (global) {
    'use strict';

 // Assertions

    if (typeof Object.prototype.Q === 'function') {
     // Avoid unnecessary work if Method Q already exists.
        return;
    }

    if (global.hasOwnProperty('location') === false) {
        throw new Error('"Method Q" is currently browser-only.');
    }

 // Private declarations

    var argv, bookmarks, countdown, define, isFunction, read, uuid, write;

 // Private definitions

    argv = {};
    bookmarks = {};

    (function () {
     // This anonymous closure is based in part on parseUri 1.2.2 by Steven
     // Levithan (stevenlevithan.com, MIT License). It treats 'location.search'
     // as a set of ampersand-separated Boolean key=value parameters whose
     // keys are valid JS identifiers and whose values are either "true" or
     // "false" (without quotes). The function accepts an object whose own
     // properties will be used to override flags that are already present.
        var key, opts, parseURI, results, uri;
        opts = {
            key: [
                'source', 'protocol', 'authority', 'userInfo', 'user',
                'password', 'host', 'port', 'relative', 'path', 'directory',
                'file', 'query', 'anchor'
            ],
            parser: new RegExp('^(?:([^:\\/?#]+):)?(?:\\/\\/((?:(([^:@' +
                ']*)(?::([^:@]*))?)?@)?([^:\\/?#]*)(?::(\\d*))?))?((('  +
                '(?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'),
            q: {
                name:   'flags',
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            }
        };
        parseURI = function (str) {
            var i, m, uri;
            i = 14;
            m = opts.parser.exec(str);
            uri = {};
            for (i = 14; i > 0; i -= 1) {
                uri[opts.key[i]] = m[i] || '';
            }
            uri[opts.q.name] = {};
            uri[opts.key[12]].replace(opts.q.parser, function ($0, $1, $2) {
                if ($1) {
                    uri[opts.q.name][$1] = ($2 !== 'false') ? true : false;
                }
            });
            return uri;
        };
        uri = parseURI(global.location.href);
     // First, let's compute the "command-line arguments" :-)
        for (key in uri.flags) {
            if (uri.flags.hasOwnProperty(key)) {
                argv[key] = uri.flags[key];
            }
        }
     // Now, let's define some bookmarks we will need during execution.
        bookmarks.db = uri.protocol + '://' + uri.authority + '/db/';
        bookmarks.uuids = function (n) {
            return uri.protocol + '://' + uri.authority +
                '/_uuids?count=' + parseInt(n >> 0);
        };
    }());

    countdown = function (n, callback) {
        var total = (n >> 0);
        return function () {
            total -= 1;
            return (total === 0) ? callback() : null;
        };
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
                        case 'get':
                            obj.__defineGetter__(key, params[prop]);
                            break;
                        case 'set':
                            obj.__defineSetter__(key, params[prop]);
                            break;
                        case 'value':
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

    read = function (url, callback) {
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
        req.open('GET', url, true);
        req.send(null);
        return req;
    };

    uuid = function () {
     // This function dispenses a UUID from a memoized cache of values it has
     // already fetched from CouchDB. It refills the cache using AJAX, and if
     // the cache actually runs out at any point, it refills itself using the
     // blocking form of XHR in order to guarantee correct behavior. I will
     // rewrite the constructors soon so that blocking behavior won't be
     // necessary, but only then will Quanah be free of blocking calls ...
        var cache = [];
        uuid = function () {
            var req, uuids, x;
            if (cache.length < 500) {
                read(bookmarks.uuids(1000), function (err, txt) {
                    if (err !== null) {
                        throw err;
                    } else {
                        cache.push.apply(cache, JSON.parse(txt).uuids);
                    }
                });
                if (cache.length === 0) {
                 // If we're totally empty, we will block until more arrive.
                 // Alternatively, though, we could just one of our own real
                 // quick; if it fails, we could try again recursively ... ?
                    req = new XMLHttpRequest();
                    req.open('GET', bookmarks.uuids(1000), false);
                    req.send();
                    uuids = JSON.parse(req.responseText).uuids;
                    cache.push.apply(cache, uuids);
                }
            }
            return cache.pop();
        };
        return uuid();
    };

    write = function (url, data, callback) {
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
        req.open('PUT', url, true);
        req.setRequestHeader('Content-type', 'application/json');
        req.send(data);
        return req;
    };

 // Private constructors

    function QuanahFxn(obj) {
        obj = ((typeof obj === 'object') && (obj !== null)) ? obj : {};
        var id, that;
        id = obj.hasOwnProperty('_id') ? obj._id : uuid();
        that = this;
        that.meta = {
            _id:    id,
            _rev:   obj.hasOwnProperty('_rev') ? obj._rev : null,
            type:   'QuanahFxn',
            url:    bookmarks.db + id
        };
        that.content = obj.hasOwnProperty('content') ? obj.content : function () {};
        return that;
    }

    function QuanahTask(obj) {
        obj = ((typeof obj === 'object') && (obj !== null)) ? obj : {};
        var id, that;
        id = obj.hasOwnProperty('_id') ? obj._id : uuid();
        that = this;
        that.meta = {
            _id:    id,
            _rev:   obj.hasOwnProperty('_rev') ? obj._rev : null,
            type:   'QuanahTask',
            url:    bookmarks.db + id
        };
        that.content = obj.hasOwnProperty('content') ? obj.content : function () {};
        return that;
    }

    function QuanahVar(obj) {
        obj = ((typeof obj === 'object') && (obj !== null)) ? obj : {};
        var id, that;
        id = obj.hasOwnProperty('_id') ? obj._id : uuid();
        that = this;
        that.meta = {
            _id:    id,
            _rev:   obj.hasOwnProperty('_rev') ? obj._rev : null,
            type:   'QuanahVar',
            url:    bookmarks.db + id
        };
        that.content = obj.hasOwnProperty('content') ? obj.content : function () {};
        return that;
    }

    QuanahFxn.prototype = new QuanahVar(null);

    QuanahTask.prototype = new QuanahVar(null);

    QuanahVar.prototype.pull = function () {
        var that = this;
        that.onready = function (data, exit) {
            read(that.meta.url, function (err, txt) {
                var key, response;
                if (err === null) {
                 // We can test for the presence of this property to see if
                 // the variable has been initialized on CouchDB yet or not.
                    response = JSON.parse(txt);
                    that.meta._rev = response._rev;
                    exit.success(response.content);
                } else {
                    exit.failure(err);
                }
            });
        };
        return that;
    };

    QuanahVar.prototype.push = function () {
        var that = this;
        that.onready = function (content, exit) {
            var obj;
            obj = {
                _id:        that.meta._id,
                content:    content,
                type:       that.meta.type
            };
            if (that.meta._rev !== null) {
                obj._rev = that.meta._rev;
            }
            write(that.meta.url, JSON.stringify(obj), function (err, txt) {
                var response;
                if (err === null) {
                 // We can test for the presence of this property to see if
                 // the variable has been initialized on CouchDB yet or not.
                    response = JSON.parse(txt);
                    if (response.ok === true) {
                        that.meta._rev = response.rev;
                        exit.success(content);
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

    define(QuanahVar.prototype, 'onready', {
        configurable: false,
        enumerable: true,
        get: function () {
         // FIX THIS LATER!!!
            console.log('(getter invoked)');
            //return (stack.length > 0) ? stack[0] : null;
        },
        set: function (f) {
            var egress, ready, revive, stack, that;
            egress = function () {
                return {
                    failure: function (x) {
                        that.content = x;
                        console.error(that);    //- REMOVE THIS LATER!
                    },
                    success: function (x) {
                        that.content = x;
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
                        f.call(that, that.content, egress());
                    }
                }
            };
            stack = [];
            that = this;
            define(that, "onready", {
                configurable: false,
                enumerable: true,
                get: function () {
                    return (stack.length > 0) ? stack[0] : null;
                },
                set: function (f) {
                    if (isFunction(f) === false) {
                        throw new Error('"onready" expects a function.');
                    }
                    stack.push(f);
                    revive();
                }
            });
            return (that.onready = f);
        }
    });

 // Global definitions

    Object.prototype.Q = function (key, func) {
        var f, x, y, z;
        f = (new QuanahFxn({content: func})).push();
        x = (new QuanahVar({content: this})).push();
        y = (new QuanahVar({content: null})).push();
        z = (new QuanahTask({content: null})).push();
        z.onready = function (z, exit) {
            var count;
            count = countdown(3, function () {
                z.status = "waiting";
                z.push();
                exit.success(z);
            });
            f.onready = function (content, exit) {
                try {
                    z.main = f.meta.url;
                    exit.success(content);
                    count();
                } catch (err) {
                    exit.failure(err);
                }
            };
            x.onready = function (content, exit) {
                try {
                    z.argv = x.meta.url;
                    exit.success(content);
                    count();
                } catch (err) {
                    exit.failure(err);
                }
            };
            y.onready = function (content, exit) {
                try {
                    z.results = y.meta.url;
                    exit.success(content);
                    count();
                } catch (err) {
                    exit.failure(err);
                }
            };
        };
        return z;
    };

 // Invocations

    if (argv.developer === true) {
        (function developer() {
            console.log('--- DEVELOPER MODE ENABLED ---');
        }());
    }

    if (argv.volunteer === true) {
        (function volunteer() {
            console.log('--- VOLUNTEER MODE ENABLED ---');
        }());
    }

}(function (outer) {
    'use strict';
    return (this === null) ? outer : this;
}.call(null, this)));

//- vim:set syntax=javascript:
