//- JavaScript source code

//- cloudCache.js ~~
//                                                      ~~ (c) SRW, 17 Nov 2011

(function (global) {
    'use strict';

 // Assertions

    if (global.hasOwnProperty('WANKEL')) {
        return;
    }

    if (global.hasOwnProperty('JSON') === false) {
        throw new Error('A JSON library is required.');
    }

 // Private declarations

    var cloudCache, defineProperty, hasMethods, hasProperties, isFunction,
        lazydef, localCache, online, ply, queue, uuid, when;

 // Private definitions

    defineProperty = function (obj, name, params) {
        if (isFunction(Object.defineProperty)) {
            defineProperty = Object.defineProperty;
        } else {
            defineProperty = function (obj, name, params) {
             // TO-DO: Assert input types and throw errors like native does.
                /*jslint nomen: true */
                ply(params).by(function (key, val) {
                    switch (key) {
                    case 'get':
                        obj.__defineGetter__(name, params[key]);
                        break;
                    case 'set':
                        obj.__defineSetter__(name, params[key]);
                        break;
                    case 'value':
                        delete obj[name];
                        obj[name] = params[key];
                        break;
                    default:
                     // (placeholder)
                    }
                });
                return obj;
            };
        }
        return defineProperty(obj, name, params);
    };

    hasMethods = function (x) {
        return ((x !== null) && (x !== undefined));
    };

    hasProperties = function (obj) {
     // NOTE: This isn't correct --> 'Hello'.hasOwnProperty('length') ...
        return (obj instanceof Object);
    };

    isFunction = function (f) {
        return ((typeof f === 'function') && (f instanceof Function));
    };

    lazydef = function (obj) {
     // This function creates a getter/setter pair on WANKEL so a property or
     // method may be lazy-loaded precisely once, either from its default
     // definition given in this function or else by an external assignment.
     // This technique enables an external definition to access private data
     // within this closure safely, as I have shown previously with Rainman.
        if (hasProperties(obj) === false) {
            throw new Error('Input argument must be an object.');
        }
        if (obj.hasOwnProperty('key') === false) {
            throw new Error('No "key" specified.');
        }
        if (obj.hasOwnProperty('val') === false) {
            throw new Error('No "val" specified.');
        }
        var key, val;
        key = obj.key;
        val = obj.val;
        return defineProperty(global.WANKEL, key, {
            configurable: true,
            enumerable: true,
            get: function () {
             // A "getter" induces the lazy-load by assigning to the "setter".
                global.WANKEL[key] = val;
                return global.WANKEL[key];
            },
            set: function (val) {
             // The "setter" deletes the pair and assigns an immutable value.
                delete global.WANKEL[key];
                defineProperty(global.WANKEL, key, {
                    configurable: false,
                    enumerable: true,
                    value: val
                });
            }
        });
    };

    ply = function (x) {
        var forEach, keys;
        forEach = function (f) {
            if (isFunction(Array.prototype.forEach)) {
                forEach = Array.prototype.forEach;
            } else {
                forEach = function (f) {
                    var i, n;
                    n = this.length;
                    for (i = 0; i < n; i += 1) {
                        f(this[i], i);
                    }
                };
            }
            forEach.call(this, f);
        };
        keys = function (obj) {
            if (Object.hasOwnProperty('keys')) {
                keys = Object.keys;
            } else {
                keys = function (obj) {
                    var key, y;
                    y = [];
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            y.push(key);
                        }
                    }
                    return y;
                };
            }
            return keys(obj);
        };
        ply = function (x) {
            return {
                by: function (f) {
                    if (isFunction(f) === false) {
                        throw new Error('"ply..by" expects a function.');
                    }
                    if (hasProperties(x) === false) {
                        f(null, x);
                        return;
                    }
                    if (x.hasOwnProperty('length')) {
                        forEach.call(x, function (val, key) {
                            f(key, val);
                        });
                    } else {
                        forEach.call(keys(x), function (xkey, key) {
                            f(xkey, x[xkey]);
                        });
                    }
                }
            };
        };
        return ply(x);
    };

    uuid = function () {
     // This function generates hexadecimal UUIDs of length 32.
        var x = '';
        while (x.length < 32) {
            x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
        }
        return x;
    };

 // Conditional definitions

    (function () {                      //- begin "localCache" definition

     // Declarations

        var AVar, db, deserialize, keys, read, remove, serialize, write;

     // Define the "AVar" constructor and its methods.

        AVar = function AVar(obj) {
            obj = (hasProperties(obj)) ? obj : {};
            var ready, revive, stack, that;
            ready = true;
            revive = function () {
                var evt, f;
                if (ready === true) {
                    ready = false;
                    evt = {
                        exit: {
                            failure: function () {
                             // (placeholder)
                            },
                            success: function () {
                                ready = true;
                            }
                        },
                        key: that.key,
                        val: that.val
                    };
                    f = stack.shift();
                    if (f === undefined) {
                        ready = true;
                    } else {
                        try {
                            f.call(that, evt);
                        } catch (err) {
                            evt.val = err;
                            that.onerror(evt);
                        }
                    }
                }
            };
            stack = [];
            that = this;
            defineProperty(that, 'onready', {
                configurable: false,
                enumerable: false,
                get: function () {
                    return (stack.length > 0) ? stack[0] : undefined;
                },
                set: function (f) {
                    if (isFunction(f)) {
                        stack.push(f);
                        revive();
                    } else {
                        throw new Error('"onready" expects a function.');
                    }
                }
            });
            that.key = (obj.hasOwnProperty('key')) ? obj.key : uuid();
            that.val = (obj.hasOwnProperty('val')) ? obj.val : undefined;
            return that;
        };

        AVar.prototype.onerror = function (evt) {
         // (placeholder)
        };

        AVar.prototype.valueOf = function () {
            return this.val;
        };

     // Define JSON-based serialization functions that understand functions.

        deserialize = function (obj) {
            return JSON.parse(obj, function revive(key, val) {
                var flag;
                if (val instanceof Object) {
                    flag = ((val.hasOwnProperty('type')) &&
                            (val.hasOwnProperty('val'))  &&
                            (val.type === 'true-function'));
                    if (flag === true) {
                        return eval(val.val);
                    }
                }
                return val;
            });
        };

        serialize = function (x) {
            return JSON.stringify(x, function replacer(key, val) {
                var left, obj, right;
                obj = {};
                if (isFunction(val)) {
                    left = '(function () {\nreturn ';
                    right = ';\n}());';
                    obj.type = 'true-function';
                    if (isFunction(val.toJSON)) {
                        obj.val = left + val.toJSON() + right;
                    } else if (isFunction(val.toSource)) {
                        obj.val = left + val.toSource() + right;
                    } else if (isFunction(val.toString)) {
                        obj.val = left + val.toString() + right;
                    } else {
                        obj.val = left + val + right;
                    }
                    return obj;
                } else {
                    return val;
                }
            });
        };

     // Define values for "db", "keys", "read", "remove", and "write" based on
     // the availability of known API's for persistent storage; otherwise, we
     // will fall back to a portable, non-persistent implementation.

        if (global.hasOwnProperty('localStorage')) {
            db = global.localStorage;
            keys = function () {
                var i, n, y;
                n = db.length;
                y = [];
             // Unfortunately, I cannot "ply..by" this one ...
                for (i = 0; i < n; i += 1) {
                    y[i] = db.key(i);   //- technically, isn't this a "map"?
                }
                return y;
            };
            read = function (obj) {
                var item = db.getItem(obj.key);
                obj.val = (item !== null) ? deserialize(item) : obj.val;
                return obj;
            };
            remove = function (obj) {
                db.removeItem(obj.key);
                return true;
            };
            write = function (obj) {
                db.setItem(obj.key, serialize(obj.val));
                return obj;
            };
        } else {
            db = {};
            keys = function () {
                if (Object.hasOwnProperty('keys')) {
                    keys = function () {
                        return Object.keys(db);
                    };
                } else {
                    keys = function () {
                        var y = [];
                        ply(db).by(function (key, val) {
                            y.push(key);
                        });
                        return y;
                    };
                }
                return keys();
            };
            read = function (obj) {
                if (db.hasOwnProperty(obj.key)) {
                    obj.val = deserialize(db[obj.key]);
                }
                return obj;
            };
            remove = function (obj) {
                return (delete db[obj.key]);
            };
            write = function (obj) {
                db[obj.key] = serialize(obj.val);
                return obj;
            };
        }

     // Out-of-scope definitions for "localCache" and "when".

        localCache = {};

        defineProperty(localCache, 'keys', {
            configurable: false,
            enumerable: false,
            get: function () {
                return keys();
            }
        });

        defineProperty(localCache, 'sync', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function (obj) {
                if (hasProperties(obj) === false) {
                    throw new Error('"sync" expects an object');
                }
                switch ((obj.hasOwnProperty('key') ? 2 : 0) +
                        (obj.hasOwnProperty('val') ? 1 : 0)) {
                case 1:
                 // Only 'val' was specified.
                    return write(new AVar(obj));
                case 2:
                 // Only 'key' was specified.
                    return read(new AVar(obj));
                case 3:
                 // Both 'key' and 'val' were specified.
                    if (obj.val === undefined) {
                        return remove(obj);
                    } else {
                        return write(new AVar(obj));
                    }
                default:
                 // Neither 'key' nor 'val' was specified.
                    throw new Error('"sync" requires a "key" or "val".');
                }
            }
        });

        when = function () {
         // This function needs documentation ;-)
            if (arguments.length === 0) {
                throw new Error('"when" requires at least one argument.');
            }
         // TO-DO: Assert that all input arguments are AVars.
            var args, count, egress, evt, f, i, label, n, obj, remaining;
            args = Array.prototype.slice.call(arguments);
            count = function (exit) {
                remaining -= 1;
                egress.push(exit);
                if (remaining === 0) {
                    if (isFunction(obj[label])) {
                        obj[label](evt);
                    } else {
                        defineProperty(obj, label, {
                            configurable: false,
                            enumerable: true,
                            get: function () {
                                return undefined;
                            },
                            set: function (f) {
                                if (isFunction(f)) {
                                    f(evt);
                                } else {
                                    throw new Error(label +
                                        ' expects a function as argument.');
                                }
                            }
                        });
                    }
                }
            };
            egress = [];
            evt = {
                exit: {
                    failure: function () {
                        ply(egress).by(function (key, exit) {
                            exit.failure();
                        });
                    },
                    success: function () {
                        ply(egress).by(function (key, exit) {
                            exit.success();
                        });
                    }
                }
            };
            if (args.length === 1) {
                evt.key = args[0].key;
                evt.val = args[0].val;
                label = 'isready';
            } else {
                evt.key = uuid();
                evt.val = null;
                label = 'areready';
            }
            f = function (evt) {
                count(evt.exit);
            };
            n = remaining = args.length;
            obj = {};
            ply(args).by(function (key, arg) {
                arg.onready = f;
            });
            return obj;
        };

    }());                               //- end "localCache" definition

    (function () {                      //- begin "cloudCache" definition

     // Declarations

        var db, doc, read, remove, write;

     // Definitions (including "online", which is out-of-scope)

        if (global.hasOwnProperty('location')) {
         // We are using a web browser.
            db = {
             // (placeholder)
            };
            doc = function (id) {
                return global.location.protocol + '//' +
                    global.location.host + '/db/' + id;
            };
            online = function () {
                return ((global.location.protocol.slice(0, 4) === 'http') &&
                        (global.navigator.onLine));
            };
            read = function (url, callback) {
             // This function is currently just an AJAX 'get' operation.
                var request = new global.XMLHttpRequest();
                request.onreadystatechange = function () {
                    var error, response;
                    if (request.readyState === 4) {
                        if (request.status === 200) {
                            error = null;
                            response = request.responseText;
                        } else {
                            error = new Error(request.statusText);
                            response = request.responseText;
                        }
                        if (isFunction(callback)) {
                            callback(error, response);
                        }
                    }
                };
                request.open('GET', url, true);
                request.send(null);
            };
            remove = function (url, callback) {
             // This function is currently just an AJAX 'delete' operation.
                var request = new global.XMLHttpRequest();
                request.onreadystatechange = function () {
                    var error, response;
                    if (request.readyState === 4) {
                        if (request.status === 200) {
                            error = null;
                            response = request.responseText;
                        } else {
                            error = new Error(request.statusText);
                            response = request.responseText;
                        }
                        if (isFunction(callback)) {
                            callback(error, response);
                        }
                    }
                };
                request.open('DELETE', url, true);
                request.send(null);
            };
            write = function (data, url, callback) {
             // This function is currently just an AJAX 'put' operation.
                var request = new global.XMLHttpRequest();
                request.onreadystatechange = function () {
                    var error, response;
                    if (request.readyState === 4) {
                        if (request.status === 201) {
                            error = null;
                            response = request.responseText;
                        } else {
                            error = new Error(request.statusText);
                            response = request.responseText;
                        }
                        if (isFunction(callback)) {
                            callback(error, response);
                        }
                    }
                };
                request.open('PUT', url, true);
                request.send(data);
            };
        } else {
         // We are not using a web browser.
            db = {};
            doc = function (id) {
                return id;
            };
            online = function () {
                return false;
            };
            read = function (url, callback) {
             // (placeholder)
            };
            remove = function (url, callback) {
             // (placeholder)
            };
            write = function (data, url, callback) {
             // (placeholder)
            };
        }

     // Out-of-scope definition for "cloudCache"

        cloudCache = {};

        defineProperty(cloudCache, 'keys', {
            configurable: false,
            enumerable: false,
            get: function () {
                return ['(placeholder)'];
            }
        });

        defineProperty(cloudCache, 'sync', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function (obj) {
                return online('?');
            }
        });

    }());                               //- end "cloudCache" definition

    (function () {                      //- begin "queue" definition

        var revive, stack1, stack2, state, unlock;

        revive = function () {
            global.WANKEL.puts('ENTERING REVIVE ...');
            var func;
            console.log('stack1:', stack1);
            console.log('stack2:', stack2);
            while ((func = stack1.shift()) !== undefined) {
                try {
                    func();
                    global.WANKEL.puts('Task succeeded.');
                } catch (err) {
                    if (err.message === 'This task is not finished yet!') {
                        global.WANKEL.puts('Task failed.');
                        stack2.push(func);
                    } else {
                        console.log('ERROR:', err);
                        console.log('stack1:', stack1);
                        console.log('stack2:', stack2);
                    }
                }
            }
            stack1.push.apply(stack1, stack2.splice(0, stack2.length));
        };

        stack1 = [];
        stack2 = [];

        state = {};

        unlock = function (key) {
            global.WANKEL.puts('(unlock):', key, '-->', state[key]);
            state[key] = 'unlocked';
            global.WANKEL.puts('(unlock):', key, '-->', state[key]);
            revive();
        };

        if (global.hasOwnProperty('window')) {
            global.window.onstorage = function (evt) {
                var f, flag, task, val, x, y;
                flag = false;
                try {
                    val = JSON.parse(evt.newValue);
                    flag = ((val.hasOwnProperty('token'))           &&
                            (   (val.status === 'done')     ||
                                (val.status === 'failed')   )       &&
                            (val.token === global.WANKEL.token())   );
                } catch (err) {
                    flag = false;
                }
                if (flag === true) {
                    global.WANKEL.puts('EVENT:', evt.key, evt);
                    unlock(evt.key);
                } else {
                    global.WANKEL.puts('EVENT flag was false ...');
                }
            };
        }

     // Out-of-scope definition for "queue"

        queue = function (task) {
            var f, x, y;
            if (online('?')) {
                when(task).isready = function (evt) {
                    localCache.sync(task);
                    state[evt.key] = 'locked';
                    stack1.push(function () {
                        global.WANKEL.puts('(revive):', evt.key);
                        if (state[evt.key] === 'unlocked') {
                            delete state[evt.key];
                            evt.exit.success();
                        } else {
                            throw new Error('This task is not finished yet!');
                        }
                    });
                };
                when(task).isready = function (evt) {
                    global.WANKEL.puts("I'm free!");
                    evt.exit.success();
                };
            } else {
                task.val.status = 'running';
                localCache.sync(task);
             // Generate new copies of variables by deserialization.
                f = localCache.sync({key: task.val.f});
                x = localCache.sync({key: task.val.x});
                y = localCache.sync({key: task.val.y});
                when(f, x, y, task).areready = function (evt) {
                    try {
                        y.val = f.val(x.val);
                        task.val.status = 'done';
                    } catch (err) {
                        y.val = err;
                        task.val.status = 'failed';
                    } finally {
                        localCache.sync(y);
                        localCache.sync(task);
                        evt.exit.success();
                    }
                };
            }
        };

    }());                               //- end "queue" definition

 // Global definitions

    Object.prototype.Q = function (func) {
     // Current strategy for generalizing the computation "y = f(x)" using an
     // auxiliary object named "task":
     //
     //     1.  Serialize f, x, y, and task.
     //     2.  Update task to point to the serialized values of f, x, and y.
     //     3.  Place the task in an external queue for evaluation using
     //         the serialized values of f, x, and y.
     //     4.  Copy the new serialized value of y into the "live" instance.
     //
        if (isFunction(func) === false) {
            throw new Error('Method Q requires a function as its argument.');
        }
        var f, x, y, task;
        f = localCache.sync({val: func});
        x = localCache.sync({val: this});
        y = localCache.sync({val: null});
        task = localCache.sync({
            val: {
                f:      null,
                x:      null,
                y:      null,
                status: 'initializing',
                token:  global.WANKEL.token()
            }
        });
        when(f, x, y, task).areready = function (evt) {
            task.val.f = f.key;
            task.val.x = x.key;
            task.val.y = y.key;
            task.val.status = 'waiting';
            evt.exit.success();
        };
        queue(task);
        when(f, x, y, task).areready = function (evt) {
         // This presence of this function prevents further evaluation using
         // any of the variables named, but the lock is released when it runs.
            y.val = localCache.sync({key: y.key}).val;
            evt.exit.success();
        };
        return y;
    };

    global.WANKEL = {
     // Here, I use "WANKEL" as a global namespace so I can provide access to
     // [some of] the private metaprogramming functions and parameters.
        cloudCache: cloudCache,
        localCache: localCache,
        options: {
            debug: false
        },
        when: function () {
            return when.apply(this, arguments);
        }
    };

    lazydef({
     // The real beauty here is that lazy definitions allow me to upgrade the
     // functions pretty painlessly later :-)
        key: 'filter',
        val: function (x) {
            return {
                using: function (f) {
                    var y;
                    if (isFunction(x.filter)) {
                        y = x.filter(f);
                    } else {
                        y = [];
                        ply(x).by(function (key, val) {
                            if (f(val) === true) {
                                y.push(f(val));
                            }
                        });
                    }
                    return y;
                }
            };
        }
    });

    lazydef({
        key: 'map',
        val: function (x) {
            return {
                using: function (f) {
                    var y;
                    if (isFunction(x.map)) {
                        y = x.map(f);
                    } else {
                        y = new x.constructor();
                        ply(x).by(function (key, val) {
                            y[key] = f(val);
                        });
                    }
                    return y;
                }
            };
        }
    });

    lazydef({
        key: 'ply',
        val: function (x) {
            return ply(x);
        }
    });

    lazydef({
        key: 'puts',
        val: function () {
         // This function attempts to provide a conventional output logging
         // facility by configuring itself to the running JS implementation.
         // Unfortunately, this _cannot_ lazy-load itself in-place because
         // of the getter/setter pair, but it might be able to lazy-load using
         // the "puts" reference contained in the giant anonymous closure.
         // That's pretty convoluted, though -- even for me :-P
            if (global.hasOwnProperty('navigator')) {
             // We're in a web browser. Is it a Web Worker?
                if (global.hasOwnProperty('window') === false) {
                    return global.postMessage.apply(this, arguments);
                } else if (global.hasOwnProperty('console')) {
                    return global.console.log.apply(global.console, arguments);
                } else {
                    return global.alert.apply(this, arguments);
                }
            } else if (global.hasOwnProperty('console')) {
                return global.console.log.apply(global.console, arguments);
            } else if (global.hasOwnProperty('print')) {
                return global.print.apply(this, arguments);
            } else {
                throw new Error('The "puts" definition fell through.');
            }
        }
    });

    lazydef({
        key: 'reduce',
        val: function (x) {
            return {
                using: function (f) {
                    var first, y;
                    if (isFunction(x.reduce)) {
                        y = x.reduce(f);
                    } else {
                        first = true;
                        ply(x).by(function (key, val) {
                            if (first) {
                                first = false;
                                y = val;
                            } else {
                                y = f(y, val);
                            }
                        });
                        return y;
                    }
                    return y;
                }
            };
        }
    });

    lazydef({
        key: 'token',
        val: function () {
            if (localCache.sync({key: 'token'}).val === undefined) {
                localCache.sync({key: 'token', val: uuid()});
            }
            return localCache.sync({key: 'token'}).val;
        }
    });

 // GUI invocations ...

    (function () {

        if (global.hasOwnProperty('window') === false) {
            return;
        }

        var argv, loc, nav, parseArgs, relaunch, silencer, volunteer, win;

     // Private definitions

        loc = global.location;
        nav = global.navigator;

        parseArgs = function () {
         // This function is based in part on parseUri 1.2.2 by Steven
         // Levithan (stevenlevithan.com, MIT License). It treats the
         // 'location.search' value as a set of ampersand-separated Boolean
         // key=value parameters whose keys are valid JS identifiers and whose
         // values are either "true" or "false" (without quotes). The function
         // accepts an object whose own properties will be used to override
         // flags that are already present.
            var argv, i, key, m, opts, uri;
            opts = {
                key: [
                    'source', 'protocol', 'authority', 'userInfo', 'user',
                    'password', 'host', 'port', 'relative', 'path',
                    'directory', 'file', 'query', 'anchor'
                ],
                parser: new RegExp('^(?:([^:\\/?#]+):)?(?:\\/\\/((?:(([^:@' +
                    ']*)(?::([^:@]*))?)?@)?([^:\\/?#]*)(?::(\\d*))?))?((('  +
                    '(?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'),
                q: {
                    name:   'flags',
                    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                }
            };
            m = opts.parser.exec(loc.href);
            uri = {};
            for (i = 14; i > 0; i -= 1) {
                uri[opts.key[i]] = m[i] || '';
            }
            uri[opts.q.name] = {};
            uri[opts.key[12]].replace(opts.q.parser, function ($0, $1, $2) {
                if ($1) {
                 // These are "explicit coercions" ;-)
                    switch ($2) {
                    case '':
                        uri[opts.q.name][$1] = true;
                        break;
                    case 'false':
                        uri[opts.q.name][$1] = false;
                        break;
                    case 'true':
                        uri[opts.q.name][$1] = true;
                        break;
                    default:
                        uri[opts.q.name][$1] = decodeURI($2);
                    }
                }
            });
         // First, let's compute the "command-line arguments" :-)
            argv = {};
            for (key in uri.flags) {
                if (uri.flags.hasOwnProperty(key)) {
                    argv[key] = uri.flags[key];
                }
            }
            return argv;
        };

        relaunch = function (obj) {
            obj = (obj instanceof Object) ? obj : {};
            var key, parameters;
            parameters = [];
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    parameters.push(key + '=' + obj[key]);
                }
            }
            loc.search = '?' + parameters.sort().join('&');
        };

        silencer = function (evt) {
         // (placeholder)
        };

        volunteer = function () {
            window.onstorage = function (evt) {
                var f, flag, task, val, x, y;
                flag = false;
                try {
                    val = JSON.parse(evt.newValue);
                    flag = ((val.hasOwnProperty('token'))   &&
                            (val.status === 'waiting')      &&
                            (val.token === global.WANKEL.token()));
                } catch (err) {
                    console.error('Volunteer:', err);
                    flag = false;
                }
                if (flag === true) {
                    task = localCache.sync({key: evt.key});
                    task.val.status = 'running';
                    localCache.sync(task);
                 // Generate new copies of variables by deserialization.
                    f = localCache.sync({key: task.val.f});
                    x = localCache.sync({key: task.val.x});
                    y = localCache.sync({key: task.val.y});
                    when(f, x, y, task).areready = function (evt) {
                        try {
                            y.val = f.val(x.val);
                            task.val.status = 'done';
                        } catch (err) {
                            y.val = err;
                            task.val.status = 'failed';
                        } finally {
                            localCache.sync(y);
                            localCache.sync(task);
                            global.WANKEL.puts(y);
                            evt.exit.success();
                        }
                    };
                }
            };
        };

        win = global.window;

        if (win.hasOwnProperty('applicationCache')) {
         // These work correctly, but they fail to inhibit Chrome's default
         // behavior. Perhaps they are executing at the wrong time?
            win.applicationCache.oncached = silencer;
            win.applicationCache.onchecking = silencer;
            win.applicationCache.ondownloading = silencer;
            win.applicationCache.onerror = silencer;
            win.applicationCache.onnoupdate = silencer;
            win.applicationCache.onobsolete = silencer;
            win.applicationCache.onprogress = silencer;
            win.applicationCache.onupdateready = silencer;
        }

     /*
        win.onoffline = win.ononline = function (evt) {
            if (nav.onLine) {
                global.alert('Your computer is online.');
            } else {
                global.alert('Your computer is not online.');
            }
        };
     */

        argv = parseArgs();

        if (argv.hasOwnProperty('token') && (argv.token !== true)) {
            localCache.sync({key: 'token', val: argv.token});
        } else {
            argv.token = global.WANKEL.token();
            relaunch(argv);
        }

        if (argv.developer === true) {
            (function () {
                var f, x, y;

                f = function (x) {
                    return x.map(function (each) {
                        return 3 * each;
                    });
                };

                x = [1, 2, 3, 4, 5];

                y = x.Q(f);

                when(y).isready = function (y) {
                    global.WANKEL.puts('ANSWER:', y);
                    y.exit.success();
                };

            }());
        }

        if (argv.volunteer === true) {
            volunteer();
        }

        return;

    }());

 // That's all, folks!

    return;

}(function (outer_scope) {
    'use strict';

 // This strict anonymous closure encapsulates the logic for detecting which
 // object in the environment should be treated as _the_ global object. It's
 // not as easy as you may think -- strict mode disables the 'call' method's
 // default behavior of replacing "null" with the global object. Luckily, we
 // can work around that by passing a reference to the enclosing scope as an
 // argument at the same time and testing to see if strict mode has done its
 // deed. This task is not hard in the usual browser context because we know
 // that the global object is 'window', but CommonJS implementations such as
 // RingoJS confound the issue by modifying the scope chain, running scripts
 // in sandboxed contexts, and using identifiers like "global" carelessly ...

    /*global global: true */

    if (this === null) {

     // Strict mode has captured us, but we already passed a reference :-)

        return (typeof global === 'object') ? global : outer_scope;

    } else {

     // Strict mode isn't supported in this environment, but we still need to
     // make sure we don't get fooled by Rhino's 'global' function.

        return (typeof this.global === 'object') ? this.global : this;

    }

}.call(null, this)));

//- vim:set syntax=javascript:
