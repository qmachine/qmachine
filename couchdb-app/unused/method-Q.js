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

    (function () {
     // This anonymous closure is based in part on parseUri 1.2.2 by Steven
     // Levithan (stevenlevithan.com, MIT License). It treats 'location.search'
     // as a set of ampersand-separated Boolean key=value parameters whose
     // keys are valid JS identifiers and whose values are either "true" or
     // "false" (without quotes). The function accepts an object whose own
     // properties will be used to override flags that are already present.
        var i, key, m, opts, uri;
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
        m = opts.parser.exec(global.location.href);
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
     // First, let's compute the "command-line arguments" :-)
        argv = {};
        for (key in uri.flags) {
            if (uri.flags.hasOwnProperty(key)) {
                argv[key] = uri.flags[key];
            }
        }
     // Now, let's define some bookmarks we will need during execution.
        bookmarks = {
            db:     uri.protocol + '://' + uri.authority + '/db/',
            uuids:  uri.protocol + '://' + uri.authority + '/_uuids'
        };
    }());

    countdown = function (n, callback) {
        var total = (n >> 0);
        return function () {
            total -= 1;
            if (total === 0) {
                callback();
            }
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
                read(bookmarks.uuids + '?count=1000', function (err, txt) {
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
                    req.open('GET', bookmarks.uuids + '?count=1000', false);
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

    function QuanahFxn(func) {          //- BROKEN
        obj = ((typeof obj === 'object') && (obj !== null)) ? obj : {};
        var content, id, meta, that;
        content = (obj.hasOwnProperty('content')) ? obj.content : {};
        meta = (obj.hasOwnProperty('meta')) ? obj.meta : {};
        id = (meta.hasOwnProperty('_id')) ? meta._id : uuid();
        that = this;
        that.meta = {
            _id:    id,
            _rev:   (meta.hasOwnProperty('_rev')) ? meta._rev : null,
            key:    (meta.hasOwnProperty('key')) ? meta.key : null,
            status: (meta.hasOwnProperty('status')) ? meta.status : null,
            type:   'QuanahFxn',
            url:    (meta.hasOwnProperty('url')) ? meta.url : bookmarks.db + id
        };
        that.content = {
            main:   (content.hasOwnProperty('main')) ? content.main : null,
            argv:   (content.hasOwnProperty('argv')) ? content.argv : null,
            result: (content.hasOwnProperty('result')) ? content.result : null
        };
        return that;
    }

    function QuanahTask(key) {          //- BROKEN
        obj = ((typeof obj === 'object') && (obj !== null)) ? obj : {};
        var content, id, meta, that;
        content = (obj.hasOwnProperty('content')) ? obj.content : {};
        meta = (obj.hasOwnProperty('meta')) ? obj.meta : {}; 
        id = (meta.hasOwnProperty('_id')) ? meta._id : uuid();
        that = this;
        that.meta = {
            _id:    id,
            _rev:   (meta.hasOwnProperty('_rev')) ? meta._rev : null,
            key:    (meta.hasOwnProperty('key')) ? meta.key : null,
            status: (meta.hasOwnProperty('status')) ? meta.status : null,
            type:   'QuanahTask',
            url:    (meta.hasOwnProperty('url')) ? meta.url : bookmarks.db + id
        };
        that.content = {
            main:   (content.hasOwnProperty('main')) ? content.main : null,
            argv:   (content.hasOwnProperty('argv')) ? content.argv : null,
            result: (content.hasOwnProperty('result')) ? content.result : null
        };
        return that;
    }

    function QuanahVar(x) {             //- BROKEN
        var content, id, meta, that;
        if ((typeof x === 'object') && (x !== null)) {
            if (x.hasOwnProperty('content') && x.hasOwnProperty('meta')) {
                content = x.content;
                meta = x.meta;
            } else {
                content = x;
                meta = 


            content = (x.hasOwnProperty('content')) ? x.content : x
        if (x.hasOwnProperty('content')
        content = (x.hasOwnProperty('content')) ? x.content : 
        content = (obj.hasOwnProperty('content')) ? obj.content : {};
        meta = (obj.hasOwnProperty('meta')) ? obj.meta : {};
        id = (meta.hasOwnProperty('_id')) ? meta._id : uuid();
        that = this;
        that.meta = {
            _id:    id,
            _rev:   (meta.hasOwnProperty('_rev')) ? meta._rev : null,
            key:    (meta.hasOwnProperty('key')) ? meta.key : null,
            status: (meta.hasOwnProperty('status')) ? meta.status : null,
            type:   'QuanahVar',
            url:    (meta.hasOwnProperty('url')) ? meta.url : bookmarks.db + id
        };
        that.content = {
            main:   (content.hasOwnProperty('main')) ? content.main : null,
            argv:   (content.hasOwnProperty('argv')) ? content.argv : null,
            result: (content.hasOwnProperty('result')) ? content.result : null
        };
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

    define(QuanahVar.prototype, 'content', {
        configurable: false,
        enumerable: true,
        get: function () {
         // (placeholder)
        },
        set: function (x) {
            var content, that;
            that = this;
            define(that, 'content', {
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
            return (that.content = x);
        }
    });

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
        f = new QuanahFxn(func);
        x = new QuanahVar(this);
        y = new QuanahVar(null);
        z = new QuanahTask(key);
        z.onready = function (content, exit) {
            var count;
            count = countdown(3, function () {
                z.meta.status = "waiting";
                exit.success(content);
                //z.push();
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
                    z.result = y.meta.url;
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
            if (global.hasOwnProperty('console')) {
                console.log('--- DEVELOPER MODE ENABLED ---');
            }
        }());
    }

    if (argv.volunteer === true) {
        (function volunteer() {
            if (global.hasOwnProperty('console')) {
                console.log('--- VOLUNTEER MODE ENABLED ---');
            }
        }());
    }

}(function (outer) {
    'use strict';
    return (this === null) ? outer : this;
}.call(null, this)));

//- vim:set syntax=javascript:
