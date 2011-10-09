//- JavaScript source code

//- quanah.js ~~
//
//  TO-DO:
//  -   argument parsing
//  -   automatic polling
//
//                                                      ~~ (c) SRW, 08 Oct 2011

(function (global) {
    'use strict';

 // Assertions

    if (typeof Object.prototype.Q === 'function') {
     // Avoid unnecessary work if Method Q already exists.
        return;
    }

 // Private declarations

    var argv, bookmarks, countdown, define, isFunction;

 // Private definitions

    argv = {
        developer:  true,
        volunteer:  true
    };

    bookmarks = {
        doc: function (id) {
            return 'http://' + global.location.host + '/db/' + id;
        },
        queue: function (key) {
            return 'http://' + global.location.host + '/_view/tasks?key="' +
                key + '"';
        },
        uuids: function (n) {
            return 'http://' + global.location.host + '/_uuids?count=' + n;
        }
    };

    countdown = function (n, callback) {
        var t = n;
        return function () {
            t -= 1;
            if (t === 0) {
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

 // Private constructors

    function QuanahVar(obj) {
        obj = ((typeof obj === 'object') && (obj !== null)) ? obj : {};
        var egress, ready, revive, stack, that;
        egress = function () {
            return {
             // I wish these synced automatically, and I may attempt to do it
             // soon either by removing "sync"'s internal "onready" or else by
             // directly manipulating the stack ...
                failure: function (x) {
                    that.val = x;
                },
                success: function (x) {
                    that.val = x;
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
                    f.call(that, that.val, egress());
                }
            }
        };
        stack = [];
        that = this;
        define(that, 'onready', {
            configurable: false,
            enumerable: true,
            get: function () {
                return (stack.length > 0) ? stack[0] : null;
            },
            set: function (f) {
                if (isFunction(f) === false) {
                    throw new Error('"onready" method expects a function.');
                }
                stack.push(f);
                revive();
            }
        });
     // Here, we add user-specified properties directly to the new object; we
     // don't worry if either is missing, though, because the "sync" method
     // handles that. NOTE: "sync" won't be defined till the very end!
        if (obj.hasOwnProperty('key')) {
            that.key = obj.key;
        }
        if (obj.hasOwnProperty('val')) {
            that.val = obj.val;
        }
        return that.sync();
    }

    QuanahVar.prototype.sync = function () {
     // This prototype method implements the "transfer layer" completely, with
     // small exceptions noted for the "bookmarks" variable and the initial
     // "importScripts" invocation in the Web Worker script.
        var key2meta, uuid;
        key2meta = {};
        uuid = function () {
         // This function generates hexadecimal UUIDs of length 32.
            var x = '';
            while (x.length < 32) {
                x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
            }
            return x;
        };
        QuanahVar.prototype.sync = function () {
            var that = this;
            that.onready = function (x, exit) {
                var count, flags, meta, pull, push, y;
                count = countdown(2, function () {
                    exit.failure(x);
                });
                flags = {
                    pull:   false,
                    push:   false
                };
                pull = function () {
                    var req = new XMLHttpRequest();
                    req.onreadystatechange = function () {
                        var response;
                        if (req.readyState === 4) {
                            response = JSON.parse(req.responseText);
                            if (req.status === 200) {
                             // NOTE: I may need to compare version numbers ...
                                meta.rev = response._rev;
                                if (flags.push === true) {
                                    that.val = response.val;
                                    push();
                                } else {
                                    exit.success(response.val);
                                }
                            } else {
                                count();
                            }
                        }
                    };
                    req.open('GET', meta.url, true);
                    req.send(null);
                };
                push = function () {
                    var req = new XMLHttpRequest();
                    req.onreadystatechange = function () {
                        var response;
                        if (req.readyState === 4) {
                            response = JSON.parse(req.responseText);
                            if (req.status === 201) {
                                if (response.ok === true) {
                                    meta.rev = response.rev;
                                 // NOTE: Check that (x === that.val)?
                                    exit.success(x);
                                } else {
                                    count();
                                }
                            } else {
                                count();
                            }
                        }
                    };
                    req.open('PUT', meta.url, true);
                    req.setRequestHeader('Content-type', 'application/json');
                    req.send(JSON.stringify(y));
                };
                if (that.hasOwnProperty('key')) {
                 // Instance may be initializing from key ==> pull.
                    flags.pull = true;
                    if (that.hasOwnProperty('val')) {
                     // Instance needs to be synced ==> push _also_ :-)
                        flags.push = true;
                    }
                } else {
                 // Instance is initializing from value ==> push.
                    flags.push = true;
                    that.key = uuid();
                    that.val = (that.hasOwnProperty('val')) ? that.val : null;
                }
                if (key2meta.hasOwnProperty(that.key) === false) {
                    key2meta[that.key] = {
                        id:     that.key,
                        rev:    undefined,
                        url:    bookmarks.doc(that.key)
                    };
                }
                meta = key2meta[that.key];
                y = {
                    '_id':  meta.id,
                    '_rev': meta.rev,
                    'type': (typeof that.val),
                    'val':  (function (val) {
                        var left, right;
                        left = '(function () {\nreturn ';
                        right = ';\n}());';
                        if (isFunction(val)) {
                            if (isFunction(val.toJSON)) {
                                return left + val.toJSON() + right;
                            } else if (isFunction(val.toSource)) {
                                return left + val.toSource() + right;
                            } else if (isFunction(val.toString)) {
                                return left + val.toString() + right;
                            } else {
                                return left + val + right;
                            }
                        } else {
                            return val;
                        }
                    }(that.val))
                };
                if ((flags.pull === false) && (flags.push === true)) {
                    push();
                } else {
                    pull();
                }
                return that;
            };
            return that;
        };
        return this.sync();             //- returns a reference to "this"
    };

 // Global definitions

    Object.prototype.Q = function (func) {  //  y = x.Q(f);
        var f, task, x, y;
        f = new QuanahVar({val: func});
        x = new QuanahVar({val: this});
        y = new QuanahVar();
        task = new QuanahVar({val: {f: null, x: null, y: null, status: null}});
        task.onready = function (task, exit) {
            var count;
            count = countdown(3, function () {
                task.status = 'waiting';
                exit.success(task);
            });
            x.onready = function (val, exit) {
                task.x = x.key;
                exit.success(val);
                count();
            };
            f.onready = function (val, exit) {
                task.f = f.key;
                exit.success(val);
                count();
            };
            y.onready = function (val, exit) {
                task.y = y.key;
                exit.success(val);
                count();
            };
        };
        return task.sync();             //- returns a reference to "task"
    };

 // Invocations

    if (argv.developer === true) {
        (function developer() {
            var x, y;
            if (global.hasOwnProperty('window')) {
                x = [1, 2, 3, 4, 5];
                y = x.Q(function (x) {
                    var i, n, y;
                    n = x.length;
                    y = [];
                    for (i = 0; i < n; i += 1) {
                        y[i] = 3 * x[i];
                    }
                    return y;
                });
                y.sync();
            }
        }());
    }

    if (argv.volunteer === true) {
        (function volunteer() {
            var bee;
            if (global.hasOwnProperty('window')) {
             // This part runs in a web browser.
                bee = new Worker('quanah.js');
                bee.onmessage = function (evt) {
                    console.log(evt.data);
                };
                bee.onerror = function (evt) {
                    console.error(evt);
                };
            } else {
             // This part runs in a Web Worker.
                global.run = function (queue) {
                    var x, n, f, obj, y, task;
                    n = queue.rows.length;
                    if (n === 0) {
                        postMessage('Nothing to do ...');
                    } else {
                        obj = queue.rows[0];
                        f = new QuanahVar({key: obj.value.f});
                        x = new QuanahVar({key: obj.value.x});
                        y = new QuanahVar({key: obj.value.y});
                        task = new QuanahVar({key: obj.id});
                        task.onready = function (val, exit) {
                            val.status = 'running';
                            exit.success(val);
                        };
                        task.sync();
                        task.onready = function (val, exit) {
                            var count;
                            count = countdown(3, function () {
                             // Yes, I know this is begging for a malicious
                             // code injection -- that's precisely the reason
                             // I was using JSLINT as a preprocessor ...
                                y.val = (eval(f.val))(x.val);
                                y.sync();
                                postMessage(y.val);
                                task.val.status = 'done';
                                task.sync();
                                exit.success(val);
                            });
                            f.onready = x.onready = y.onready =
                                function (val, exit) {
                                    exit.success(val);
                                    count();
                                };
                        };
                    }
                };
                importScripts(bookmarks.queue('waiting') + '&callback=run');
            }
        }());
    }

}(function (outer) {
    'use strict';
    return (this === null) ? outer : this;
}.call(null, this)));

//- vim:set syntax=javascript:
