//- JavaScript source code

//- method-Q.js ~~
//
//  Time to slim things down :-)
//
//                                                      ~~ (c) SRW, 23 Sep 2011

Object.prototype.Q = (function (global) {
    "use strict";

 // Declarations

    var add_meta, add_onready, add_pusher, ajax$get, ajax$put, bookmarks,
        define, isFunction, methodQ, parseFlags, parseURI, uuid;

 // Constructors

    function QuanahFxn(obj) {
        if ((typeof obj !== 'object') || (obj === null)) {
            obj = {};
        }
        obj.type = "QuanahFxn";
        var f, that;
        that = this;
        if (isFunction(obj.content) === false) {
         // Resuscitate the function from string if possible ... I'll rewrite
         // this part soon, I promise!
            try {
                f = eval(obj.content);
            } catch (err) {
                throw new Error("Unable to resuscitate the function.");
            }
        } else {
            f = obj.content;
        }
        that = add_meta(that, obj);
        that = add_onready(that);
        that = add_pusher(that, "content", (function () {
         // NOTE: This is just _begging_ for malicious code injection ...
            var front, back;
            front = '(function main() {\nreturn ';
            back  = ';\n}());'
            if (isFunction(f.toJSON)) {
                return front + f.toJSON() + back;
            } else if (isFunction(f.toSource)) {
                return front + f.toSource() + back;
            } else if (isFunction(f.toString)) {
                return front + f.toString() + back;
            } else {
                throw new Error("Method Q cannot stringify this function.");
            }
        }()));
        return that;
    }

    function QuanahTask(obj) {
        if ((typeof obj !== 'object') || (obj === null)) {
            obj = {};
        }
        obj.type = "QuanahTask";
        var content, that;
        content = {
            argv:       obj.hasOwnProperty("argv") ? obj.argv : null,
            main:       obj.hasOwnProperty("main") ? obj.main : null,
            results:    obj.hasOwnProperty("results") ? obj.results : null,
            status:     obj.hasOwnProperty("status") ? obj.status : null
        };
        that = this;
        that = add_meta(that, obj);
        that = add_onready(that);
        that = add_pusher(that, "content", content);
        return that;
    }

    function QuanahVar(obj) {
        if ((typeof obj !== 'object') || (obj === null)) {
            obj = {};
        }
        obj.type = "QuanahVar";
        var that;
        that = this;
        that = add_meta(that, obj);
        that = add_onready(that);
        that = add_pusher(that, "content", obj.content);
        return that;
    }

 // Definitions

    add_meta = function (that, obj) {
        if ((typeof obj !== 'object') || (obj === null)) {
            throw new Error('Invalid "meta" property');
        }
        that.meta = {};
        that.meta._id   = obj.hasOwnProperty("_id")  ? obj._id : uuid();
        that.meta._rev  = obj.hasOwnProperty("_rev") ? obj._rev : null;
        that.meta.type  = obj.hasOwnProperty("type") ? obj.type : "QuanahVar";
        that.meta.url   = bookmarks.db + that.meta._id;
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
        content = initial_value || null;
        delete that[name];
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

    parseFlags = function (flags) {
     // This function treats the global "location" object's "search" property
     // as a set of ampersand-separated Boolean key=value parameters whose
     // keys are valid JS identifiers and whose values are either "true" or
     // "false" (without quotes). The function accepts an object whose own
     // properties will be used to override flags that are already present,
     // and the resulting assignment will refresh the context if necessary.
        if ((typeof flags !== 'object') || (flags === null)) {
            flags = {};
        }
        var key, uri, results;
        uri = parseURI(global.location.href);
        for (key in flags) {
            if (flags.hasOwnProperty(key)) {
                if (typeof flags[key] === 'boolean') {
                    uri.flags[key] = flags[key];
                }
            }
        }
        results = Object.keys(uri.flags).sort(function (a, b) {
            return (a.toLowerCase() < b.toLowerCase());
        }).map(function (key) {
            return key + "=" + uri.flags[key];
        }).join("&");
        if (global.location.search.slice(1) !== results) {
            global.location.search = results;
        }
        return uri.flags;
    };

    parseURI = function (str) {
     // This function is based on "parseUri" by Steven Levithan:
     //
     //     parseUri 1.2.2
     //     (c) Steven Levithan <stevenlevithan.com>
     //      MIT License
     //
        var opts;
        opts = {
            key: [
                "source", "protocol", "authority", "userInfo", "user",
                "password", "host", "port", "relative", "path", "directory",
                "file", "query", "anchor"
            ],
            parser: new RegExp("^(?:([^:\\/?#]+):)?(?:\\/\\/((?:(([^:@" +
                "]*)(?::([^:@]*))?)?@)?([^:\\/?#]*)(?::(\\d*))?))?((("  +
                "(?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)"),
            q: {
                name:   "flags",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            }
        };
        parseURI = function (str) {
            var i, m, uri;
            i = 14;
            m = opts.parser.exec(str);
            uri = {};
            for (i = 14; i > 0; i -= 1) {
                uri[opts.key[i]] = m[i] || "";
            }
            uri[opts.q.name] = {};
            uri[opts.key[12]].replace(opts.q.parser, function ($0, $1, $2) {
                if ($1) {
                    uri[opts.q.name][$1] = ($2 !== "false") ? true : false;
                }
            });
            return uri;
        };
        return parseURI(str);
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
                ajax$get(bookmarks.uuids(1000), function (err, txt) {
                    if (err !== null) {
                        throw err;
                    }
                    cache.push.apply(cache, JSON.parse(txt).uuids);
                });
                if (cache.length === 0) {
                 // If we're totally empty, we will block until more arrive.
                    req = new XMLHttpRequest();
                    req.open("GET", bookmarks.uuids(1000), false);
                    req.send();
                    uuids = JSON.parse(req.responseText).uuids;
                    cache.push.apply(cache, uuids);
                }
            }
            return cache.pop();
        };
        return uuid();
    };

 // Invocations

    bookmarks = (function () {
        var uri = parseURI(global.location.href);
        if (uri.port === '') {
         // This happens if we are actually using the rewrite rules I created
         // for my personal machine, but I haven't tested them on CouchOne ...
            return {
                db: uri.protocol + '://' + uri.authority + '/db/',
                uuids: function (n) {
                    return uri.protocol + '://' + uri.authority +
                        '/_uuids?count=' + parseInt(n >> 0)
                }
            };
        } else {
         // Because this is still experimental, we may find problems.
            throw new Error("The rewrite rules are quite fragile.");
        }
    }());

    QuanahFxn.prototype = new QuanahVar(null);

    QuanahTask.prototype = new QuanahVar(null);

    QuanahVar.prototype.pull = function () {
        var that = this;
        that.onready = function (data, exit) {
            ajax$get(that.meta.url, function (err, txt) {
                var key, response;
                if (err === null) {
                 // We can test for the presence of this property to see if
                 // the variable has been initialized on CouchDB yet or not.
                    response = JSON.parse(txt);
                    that.meta._rev = response._rev;
                    that.content = response.content;
                    exit.success('Finished "push" :-)');
                } else {
                    exit.failure(err);
                }
            });
        };
        return that;
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

    methodQ = function (func) {
        var f, x, y, z;
        f = (new QuanahFxn({content: func})).push();
        x = (new QuanahVar({content: this})).push();
        y = (new QuanahVar({content: null})).push();
        z = (new QuanahTask({content: null})).push();
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

    methodQ.volunteer = function () {
     // This function encapsulates all the necessary functions of a volunteer
     // machine into a method callable as "Object.prototype.Q.volunteer". I
     // plan to read in an external copy of JSLINT in the future :-)
        var bee, readURL, puts, write;
        if (parseURI(global.location.href).flags.volunteer !== true) {
         // This function was called directly by a mouse-click, so we will
         // "refresh" the page to provide visual feedback to the user :-)
            parseFlags({volunteer: true});
        } else if (global.hasOwnProperty("window")) {
         // If called from a standard browser context, it will test for the
         // ability to launch Web Workers, and it will launch one if possible.
            puts = function () {
                document.body.appendChild(document.createElement("pre")).
                    innerHTML += Array.prototype.join.call(arguments, " ");
            };
            if (global.hasOwnProperty("Worker")) {
                bee = new global.Worker("method-Q.js?volunteer=true");
                bee.onmessage = function (evt) {
                    if (evt.hasOwnProperty("data")) {
                        puts(evt.data);
                    }
                };
                bee.onerror = function (evt) {
                    console.error(evt.data);
                };
            } else {
                puts([
                    "This browser lacks an advanced security feature called",
                    "a Web Worker. Please see the FAQ for more information."
                ].join(" "));
            }
        } else {
         // If the "window" object isn't present, we can assume we are already
         // running inside a worker, and we'll start executing tasks. Hooray!
            puts = function () {
                global.postMessage(Array.prototype.join.call(arguments, " "));
            };
            readURL = global.importScripts;
            puts("Thanks for helping out!");
         // The following properties need to be globally available for JSONP
         // to work correctly ...
            global.argv = function (x) {
                global.argv = new QuanahVar(x);
            };
            global.main = function (x) {
                global.main = new QuanahFxn(x);
            };
            global.queue = function (x) {
                global.queue = x.hasOwnProperty("results") ? x.results : [];
            };
            global.results = function (x) {
                global.results = new QuanahVar(x);
            };
            global.task = function (x) {
                global.task = (new QuanahTask(x)).pull();
            };
            readURL(
             // First, we read the queue using a JSONP callback.
                (bookmarks.db +
                    "_changes?filter=quanah/waiting&callback=queue")
            );
            if (global.queue.length > 0) {
                global.task$url = bookmarks.db + global.queue[0].id;
                readURL(global.task$url + "?callback=task");
                global.task.onready = function (data, exit) {
                    data.status = "running";
                    global.task.push();
                    global.task.onready = function (data, exit) {
                        var counter, n;
                        counter = function () {
                            n += 1;
                            if (n === 3) {
                                puts("READY TO COMPUTE :-)");
                                exit.success('Ready to compute :-)');
                            }
                        };
                        n = 0;
                        readURL(
                            (data.argv + "?callback=argv"),
                            (data.main + "?callback=main"),
                            (data.results + "?callback=results")
                        );
                        global.argv.onready = function (data, exit) {
                            counter();
                            exit.success("(synced argv)");
                        };
                        global.main.onready = function (data, exit) {
                            counter();
                            exit.success("(synced main)");
                        };
                        global.results.onready = function (data, exit) {
                            counter();
                            exit.success("(synced results)");
                        };
                        exit.success("(done printing)");
                    };
                    global.task.onready = function (data, exit_task) {
                     // We conditioned the ready state here on the ready state
                     // of the individual components of the task, so it's okay
                     // not to check their states _again_.
                        var y;
                        try {
                         // I'm not sure if this form will support higher-order
                         // remote function calls, so stay tuned ...
                            y = eval(global.main.content)(global.argv.content);
                            global.results.content = y;
                        } catch (err) {
                            global.results.content = err;
                        } finally {
                            global.results.onready = function (data, exit) {
                                puts("Computation is finished.");
                                exit.success("(uploaded results");
                                exit_task.success("(almost there!)");
                            };
                        }
                    };
                    global.task.onready = function (data, exit) {
                        data.status = "done";
                        global.task.push();
                        global.task.onready = function (data, exit) {
                            puts("FINISHED!!!");
                            puts(JSON.stringify(data));
                            exit.success("DONE!");
                        };
                        exit.success("(argh)");
                    };
                    exit.success("?");
                };
            } else {
                puts("Nothing to do ...");
            }
        }

    };

 // Invocations

    if (parseFlags({}).volunteer === true) {
        setTimeout(methodQ.volunteer, 200);
    }

 // Finally, we return the Q method itself :-)

    return methodQ;

}(function (outer_scope) {
    "use strict";
    return (this === null) ? outer_scope : this;
}.call(null, this)));

//- vim:set syntax=javascript:
