//- JavaScript source code

//- method-Q.js ~~
//
//  This version is not yet complete ...
//
//                                                      ~~ (c) SRW, 30 Sep 2011

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

    if (global.hasOwnProperty('JSON') === false) {
     // Should we load "json2.js" or just throw an error?
    }

 // Private declarations

    var argv, bookmarks, define, isFunction, read, uuid, write;

 // Private definitions

    argv = {
     // These "placeholder properties" will be filled later in "Invocations".
        developer:  null,
        volunteer:  null
    };

    bookmarks = {
     // These "placeholder properties" will be filled later in "Invocations".
        db:         null,
        uuids:      function (n) {}
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
            var req, uuids;
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

    function QuanahFxn(obj) {           //- PLACEHOLDER
        var that;
        that = this;
        return that;
    }

    function QuanahTask(obj) {          //- PLACEHOLDER
        var that;
        that = this;
        return that;
    }

    function QuanahVar(obj) {           //- PLACEHOLDER
        var that;
        that = this;
        return that;
    }

    QuanahFxn.prototype = new QuanahVar();

    QuanahTask.prototype = new QuanahVar();

    QuanahVar.prototype.pull = function () {
     // (placeholder)
    };

    QuanahVar.prototype.push = function () {
     // (placeholder)
    };

    define(QuanahVar.prototype, 'onready', {
        configurable: false,
        enumerable: true,
        get: function () {
         // (placeholder)
        },
        set: function (f) {
         // (placeholder)
        }
    });

 // Global definitions

    Object.prototype.Q = function (key, func) {
        return this;                    //- PLACEHOLDER DEFINITION
    };

 // Invocations

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

    if (argv.developer === true) {
        (function developer() {
         // This "disposable closure" is only a demo -- remove it later!
            var x, y;
            x = [1, 2, 3, 4, 5];
            y = x.Q(function (x) {
                var i, n, y;
                n = x.length;
                y = [];
                for (i = 0; i < n; i += 1) {
                 // Yes, this is "map" pattern, but it's just a demo.
                    y[i] = 3 * x[i];
                }
                return y;
            });
            y.onready = function (data, exit) {
                console.log(data);
                exit.success('(printed y)');
            };
        }());
    }

    if (argv.volunteer === true) {
        (function volunteer() {
         // This "disposable closure" contains the complete Web Worker script
         // for the volunteers' machines :-)
            var bee, read, puts, write; //- PLACEHOLDER DEFINITION ...
        }());
    }

    console.log(argv);
    console.log(bookmarks, bookmarks.uuids(10));

}(function (outer) {
    'use strict';
    return (this === null) ? outer : this;
}.call(null, this)));

//- vim:set syntax=javascript:
