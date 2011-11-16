/** POSIX shell launcher stuff goes here ****************** >/dev/null 2>&1; #*\

#-  wankel.js ~~
#
#   Upgrades to the Web Chassis model:
#   -   uses "defineProperty" internally to avoid clashing with AMD/requirejs,
#       in case I end up using those for its module system ...
#   -   uses "lazydef" so that the giant anonymous closure used for WANKEL's
#       initialization contains _only_ metaprogramming definitions :-)
#
#   NOTES:
#   -   I am considering using TypeErrors where appropriate ...
#   -   What happens in Method Q if the input function is actually an AVar
#       that represents a remote function?
#
#   Also, my new idea is to implement a "worker" under _most_ conditions, so
#   that the same JS code can run in a developer shell, an offline browser, or
#   in parallel in an online browser that has access to a CouchDB instance.
#
#                                                       ~~ (c) SRW, 10 Nov 2011

#******************************************************************************/

/*jslint maxlen: 80, indent: 4, unparam: true */

(function (global) {                    //- begin giant anonymous closure
    'use strict';

 // Pragmas

 // Assertions

    if (global.hasOwnProperty('WANKEL')) {
     // Avoid initialization costs if it's already loaded anyway.
        return;
    }

 // Private declarations

    var cache, defineProperty, generic, hasMethods, hasProperties, isFunction,
        lazydef, parallel, ply, puts, sync, token, uuid, when;

 // Private definitions

    cache = {};

    defineProperty = function (obj, name, params) {
        if (isFunction(Object.defineProperty)) {
            defineProperty = Object.defineProperty;
        } else {
            defineProperty = function (obj, name, params) {
             // TO-DO: Assert input types and throw errors like native does.
                /*jslint nomen: true */
                var key;
                for (key in params) {
                    if (params.hasOwnProperty(key)) {
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
                    }
                }
                return obj;
            };
        }
        return defineProperty(obj, name, params);
    };

    generic = function (f) {
     // NOTE: This is still just a placeholder definition, but I am already
     // phasing out the original syntax from Web Chassis's generic functions.
        var guts, indexOf, known_types, g;
        guts = function () {
         // NOTE: This is also just a placeholder ...
            //var args = Array.prototype.slice.call(arguments, 0, 9);
        };
        indexOf = function (type) {
            if (isFunction(known_types.indexOf)) {
                indexOf = function (type) {
                    var i = known_types.indexOf(type);
                    return (i < 0) ? (known_types.push(type) - 1) : i;
                };
            } else {
                indexOf = function (type) {
                    var i, n;
                    n = known_types.length;
                    for (i = 0; i < n; i += 1) {
                        if (type === known_types[i]) {
                            return i;
                        }
                    }
                    return (known_types.push(type) - 1);
                };
            }
            return indexOf(type);
        };
        known_types = [
         // This array contains a list of type constructors. I have listed the
         // AVar type first to allow me to hardcode a default into 'guts'.
            //AVar,
         // The rest are listed in the order shown in Section 15.1.4 of the
         // ES5 standard (Jan 2011, pp.110-111). No consideration whatsoever
         // has been given to optimizing this order for better performance.
            Object, Function, Array, String, Boolean, Number, Date, RegExp,
            Error, EvalError, RangeError, ReferenceError, SyntaxError,
            TypeError, URIError,
         // These are "types" whose behavior isn't well-defined yet ...
            null, undefined
        ];
        generic = function (f) {
            var guts;
            if (isFunction(f)) {
                guts = f;
                g = function self() {
                    return guts.apply(self, arguments);
                };
                g.constructor = generic;
                g.def = {};
                return g;
            } else {
                throw new Error('"generic" expects a function.');
            }
        };
        return generic(f);
    };

    hasMethods = function (x) {
        return ((x !== null) && (x !== undefined));
    };

    hasProperties = function (x) {
        return (x instanceof Object);
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

    parallel = function () {
     // This function answers the question, "Can we run in parallel?". For now,
     // I am only supporting a browser-based parallel environment, but I may
     // eventually write a Node.js client as well.
        return ((global.hasOwnProperty('location'))     &&
                (global.hasOwnProperty('navigator'))    &&
                (global.navigator.onLine)               &&
                (global.location.protocol.slice(0, 4) === 'http'));
    };

    ply = function (x) {
     // This lazy-loading private function reads from a global definition :-)
        ply = global.WANKEL.ply;
        return ply(x);
    };

    puts = function () {
     // This lazy-loading private function reads from a global definition :-)
        puts = global.WANKEL.puts;
        return puts.apply(this, arguments);
    };

    sync = function (x, callback) {
     // Lazy-loader ...
        var deserialize, doc, read, serialize, write;
        deserialize = function (obj) {
            if (parallel()) {
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
            } else {
                return obj;
            }
        };
        doc = function (id) {
            if (parallel()) {
                return global.location.protocol + '//' +
                    global.location.host + '/db/' + id;
            } else {
                return id;
            }
        };
        read = function (x, callback) {
            var request;
            if (parallel()) {
                request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    var error, response;
                    if (request.readyState === 4) {
                        if (request.status === 200) {
                            error = null;
                            response = deserialize(request.responseText);
                        } else {
                            error = new Error(request.status);
                            response = request.statusText;
                        }
                        callback(error, response);
                    }
                };
                request.open('GET', doc(x.key), true);
                request.send(null);
            } else {
                if (cache.hasOwnProperty(x.key)) {
                    callback(null, cache[x.key]);
                } else {
                    callback((new Error('404 ;-)')), undefined);
                }
            }
        };
        serialize = function (x) {
            if (parallel()) {
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
            } else {
                return x;
            }
        };
        sync = function (x, callback) {
            if (x instanceof AVar) {
                if (cache.hasOwnProperty(x.key) === false) {
                    x._id = x.key;
                    write(x, function (err, res) {
                        if (res.hasOwnProperty('rev')) {
                            x._rev = res.rev;
                        }
                        cache[x.key] = x;
                        if (isFunction(callback)) {
                            callback();
                        }
                    });
                } else {
                 // Pull, compare, and then push if appropriate.
                    read(x, function (err, res) {
                        if (err === null) {
                            if (res.hasOwnProperty('_rev')) {
                                if (x._rev < res._rev) {
                                    x._rev = res._rev;
                                    x.val = res.val;
                                }
                            }
                            if (serialize(res) !== serialize(x)) {
                                puts('updating ...', res, x);
                                write(x, function (err, res) {
                                    if (res.hasOwnProperty('rev')) {
                                        x._rev = res.rev;
                                    }
                                    cache[x.key] = x;
                                    if (isFunction(callback)) {
                                        callback();
                                    }
                                });
                            } else {
                                if (isFunction(callback)) {
                                    callback();
                                }
                            }
                        } else {
                         // Not sure what should go here yet ...
                            throw err;
                        }
                    });
                }
            } else {
                throw new Error('Cannot sync "conventional" variables.');
            }
        };
        write = function (x, callback) {
            var request;
            if (parallel()) {
                request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    var error, response;
                    if (request.readyState === 4) {
                        if (request.status === 201) {
                            error = null;
                            response = deserialize(request.responseText);
                        } else {
                            error = new Error(request.status);
                            response = request.statusText;
                        }
                        callback(error, response);
                    }
                };
                request.open('PUT', doc(x.key), true);
                request.send(serialize(x));
            } else {
                if (cache.hasOwnProperty(x.key)) {
                    callback(null, cache[x.key]);
                } else {
                    callback((new Error('404 ;-)')), {});
                }
            }
        };
     // This is a very unusual lazy-load step, haha.
        if (Object.keys(cache).length === 0) {
            puts('Initializing the AVar cache ...');
            if (parallel() === true) {
                (function () {
                 // This definition is currently BLOCKING ewwwww ...
                    var i, n, queue, req, res;
                    queue = (global.location.protocol + '//' +
                        global.location.host +
                        '/db/_changes?filter=quanah/queue&token=' +
                        token());
                    req = new XMLHttpRequest();
                    req.open('GET', queue, false);
                    req.send(null);
                    if ((req.readyState === 4) && (req.status === 200)) {
                        res = JSON.parse(req.response).results;
                        n = res.length;
                        for (i = 0; i < n; i += 1) {
                            cache[res[i].id] = null;
                        }
                        //puts(cache);
                        sync(x, callback);
                    }
                }());
            } else {
                sync(x, callback);
            }
        } else {
            sync(x, callback);
        }
    };

    token = function () {
     // This lazy-loading private function reads from a global definition :-)
        token = global.WANKEL.token;
        return token();
    };

    uuid = function () {
     // This lazy-loading private function reads from a global definition :-)
        uuid = global.WANKEL.uuid;
        return uuid();
    };

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
                failure: function (val) {
                    var i, n;
                    n = egress.length;
                    for (i = 0; i < n; i += 1) {
                        egress[i].failure();
                    }
                },
                success: function (val) {
                    var i, n;
                    n = egress.length;
                    for (i = 0; i < n; i += 1) {
                        egress[i].success();
                    }
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
        for (i = 0; i < n; i += 1) {
            args[i].onready = f;
        }
        return obj;
    };

 // Private constructors

    function AVar(obj) {
        obj = (hasProperties(obj)) ? obj : {};
        if (obj.hasOwnProperty('key') && cache.hasOwnProperty(obj.key)) {
         // Is this correct?
            return cache[obj.key];
        }
        var ready, revive, stack, that;
        ready = true;
        revive = function () {
            var evt, f;
            if (ready === true) {
                ready = false;
                evt = {
                    exit: {
                        failure: function (val) {
                            that.val = (arguments.length < 1) ? that.val : val;
                            sync(that);
                        },
                        success: function (val) {
                            that.val = (arguments.length < 1) ? that.val : val;
                            ready = true;
                         // Ideally, this callback will eventually be removed.
                            sync(that, revive);
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
                    throw new Error('"onready" handler expects a function.');
                }
            }
        });
        that.key = (obj.hasOwnProperty('key')) ? obj.key : uuid();
        that.val = (obj.hasOwnProperty('val')) ? obj.val : undefined;
        while (cache.hasOwnProperty(that.key) === true) {
         // Guarantee uniqueness, just in case ;-)
            that.key = uuid();
        }
        that.onready = function (evt) {
            sync(that, evt.exit.success);
        };
        return that;
    }

    AVar.prototype.onerror = function (evt) {
        if (global.WANKEL.options.debug === true) {
            puts(evt.val);
        }
        evt.exit.failure(evt.val);
    };

    AVar.prototype.valueOf = function () {
        return this.val;
    };

 // Global definitions

    global.WANKEL = {
     // Here, I use "WANKEL" as a global namespace so I can provide access to
     // [some of] the private metaprogramming functions and parameters.
        generic: function (f) {
            return generic.call(this, f);
        },
        options: {
            debug: false
        },
        when: function () {
            return when.apply(this, arguments);
        }
    };

    Object.prototype.Q = function (func) {
     // Assertions
        if (isFunction(func) === false) {
            throw new Error('Method Q expects a function.');
        }
     // Initialization
        var f, x, y, task;
        f = new AVar({val: func});
        x = (this instanceof AVar) ? this : new AVar({val: this});
        y = new AVar({val: null});
        task = new AVar({
            val: {
                f:      null,
                x:      null,
                y:      null,
                status: 'initializing',
                token:  token()
            }
        });
     // Submission ** NOT FULLY IMPLEMENTED! (doesn't submit to server ...) **
        when(f, x, y, task).areready = function (evt) {
            task.val.f = f.key;
            task.val.x = x.key;
            task.val.y = y.key;
            task.val.status = 'waiting';
            evt.exit.success();
        };
     // Execution (if external workers are not available)
        if (parallel() === false) {
            when(task).isready = function (evt) {
                task.val.status = 'running';
                evt.exit.success();
            };
            when(f, x, y, task).areready = function (evt) {
                try {
                    y.val = f.val(x.val);
                    task.val.status = 'done';
                    evt.exit.success();
                } catch (err) {
                    y.val = err;
                    task.val.status = 'failed';
                    evt.exit.failure();
                }
            };
        }
     // Retrieval
        when(y, task).areready = function (evt) {
            var poll, timer;
            poll = (function () {
                puts('Polling: ' + task.key + ' ...');
                sync(task, function () {
                    switch (task.val.status) {
                    case 'done':
                        if (isFunction(global.clearTimeout)) {
                            puts('Clearing timer');
                            global.clearTimeout(timer);
                        }
                        sync(y, evt.exit.success);
                        break;
                    case 'failed':
                        if (isFunction(global.clearTimeout)) {
                            global.clearTimeout(timer);
                        }
                        sync(y, evt.exit.failure);
                        break;
                    default:
                        if (isFunction(global.setTimeout)) {
                            puts('Repolling ...');
                            timer = global.setTimeout(poll, 1000);
                        } else {
                            poll();
                        }
                    }
                });
            }());
        };
        return y;
    };

 // Invocations (loosely speaking ;-)

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
            if (hasProperties(x)) {
                return {
                    by: function (f) {
                        if (isFunction(f)) {
                            var key;
                            for (key in x) {
                                if (x.hasOwnProperty(key)) {
                                    f(key, x[key]);
                                }
                            }
                        } else {
                            throw new Error('"by" expects a function.');
                        }
                    }
                };
            } else {
                throw new Error('Cannot "ply" a primitive.');
            }
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
            if (global.hasOwnProperty('localStorage')) {
                if (global.localStorage.getItem("token") === null) {
                    global.localStorage.setItem("token", uuid());
                }
                return global.localStorage.getItem("token");
            } else {
             // Look at other storage containers, such as location.search?
                return uuid();
            }
        }
    });

    lazydef({
        key: 'uuid',
        val: function () {
         // This function generates hexadecimal UUIDs of length 32.
            var x = '';
            while (x.length < 32) {
                x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
            }
            return x;
        }
    });

 // That's all, folks!

    return;                             //- end of giant anonymous closure

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
