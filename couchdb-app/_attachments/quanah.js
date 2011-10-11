//- JavaScript source code

//- quanah.js ~~
//
//  Browser features that are required:
//  -   XMLHttpRequest object
//  -   [Web] Worker object
//  -   getters and setters (ES5 recommended!)
//
//  TO-DO:
//  -   argument parsing
//  -   error message "bubbling" from remote machines
//
//                                                      ~~ (c) SRW, 11 Oct 2011

(function (global) {
    'use strict';

 // Assertions

    if (typeof Object.prototype.Q === 'function') {
     // Avoid unnecessary work if Method Q already exists.
        return;
    }

 // Private declarations

    var argv, bookmarks, countdown, define, isFunction, key2meta, read, uuid,
        write;

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
                callback.apply(this, arguments);
            }
        };
    };

    define = function (obj, name, params) {
        if (typeof Object.defineProperty === 'function') {
            define = function (obj, name, params) {
                return Object.defineProperty(obj, name, params);
            };
        } else {
            define = function (obj, name, params) {
                var key;
                for (key in params) {
                    if (params.hasOwnProperty(key) === true) {
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
        return define(obj, name, params);
    };

    isFunction = function (f) {
        return ((typeof f === 'function') && (f instanceof Function));
    };

    key2meta = {};                      //- a cache for CouchDB metadata

    read = function (url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            var response;
            if (request.readyState === 4) {
                response = JSON.parse(request.responseText);
                callback(request, response);
            }
        };
        request.open('GET', url, true);
        request.send(null);
    };

    uuid = function () {
     // This function generates hexadecimal UUIDs of length 32.
        var x = '';
        while (x.length < 32) {
            x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
        }
        return x;
    };

    write = function (url, data, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            var response;
            if (request.readyState === 4) {
                response = JSON.parse(request.responseText);
                callback(request, response);
            }
        };
        request.open('PUT', url, true);
        request.setRequestHeader('Content-type', 'application/json');
        request.send(JSON.stringify(data));
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
                read(meta.url, function (request, response) {
                    if (request.status === 200) {
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
                });
            };
            push = function () {
                write(meta.url, y, function (request, response) {
                    if (request.status === 201) {
                        if (response.ok === true) {
                            meta.rev = response.rev;
                            exit.success(x);
                        } else {
                            count();
                        }
                    } else {
                        count();
                    }
                });
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
        };
        return that;
    };

 // Global definitions

    Object.prototype.Q = function (func) {  //  y = x.Q(f);
        var count, f, task, x, y;
        count = countdown(3, function () {
            task.onready = function (val, exit) {
                val.f = f.key;
                val.x = x.key;
                val.y = y.key;
                val.status = 'waiting';
                exit.success(val);
            };
            task.sync();
        });
        f = new QuanahVar({val: func});
        x = new QuanahVar({val: this});
        y = new QuanahVar();
        task = new QuanahVar({val: {f: null, x: null, y: null, status: null}});
        f.onready = x.onready = y.onready = function (val, exit) {
            count();
            exit.success(val);
        };
        y.onready = function (val, exit) {
            var check, timer;
            check = function () {
                read(bookmarks.doc(task.key), function (request, response) {
                    if (request.status === 200) {
                        if (response.val.status === 'done') {
                         // Exit with current value so the "sync" can occur.
                            global.clearInterval(timer);
                            read(bookmarks.doc(y.key), function (req, res) {
                                if (req.status === 200) {
                                    exit.success(res.val);
                                } else {
                                    exit.failure(res.val);
                                }
                            });
                        } else {
                            console.log(bookmarks.doc(task.key) + ': ' +
                                response.val.status
                            );
                        }
                    }
                });
            };
            timer = global.setInterval(check, 1000); //- check every 1000 ms
        };
        return y;
    };

 // Invocations

    if (argv.developer === true) {
        (function developer() {
            if (global.hasOwnProperty('console')) {
                console.log('--- Developer Mode enabled ---');
            }
        }());
    }

    if (argv.volunteer === true) {
        (function volunteer() {
            var bee;
            if (global.hasOwnProperty('console')) {
                console.log('--- Volunteer Mode enabled ---');
            }
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
                read(bookmarks.queue('waiting'), function (request, response) {
                    var f, n, obj, queue, task, x, y;
                    if (request.status === 200) {
                        queue = response;
                        n = queue.rows.length;
                        if (n === 0) {
                            global.postMessage('Nothing to do ...');
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
                            task.onready = function (tval, exit) {
                                var count, func;
                                count = countdown(3, function () {
                                 // Yes, I know this is begging for a malicious
                                 // code injection -- that's precisely why I've
                                 // suggested using JSLINT as a preprocessor.
                                    try {
                                        y.val = (eval(f.val))(x.val);
                                        task.val.status = 'done';
                                    } catch (err) {
                                        y.val = err;
                                        task.val.status = 'failed';
                                    } finally {
                                        y.sync();
                                        task.sync();
                                        exit.success(tval);
                                    }
                                });
                                func = function (val, exit) {
                                    exit.success(val);
                                    count();
                                };
                                f.onready = x.onready = y.onready = func;
                            };
                        }
                    } else {
                        throw new Error('Badness?');
                    }
                });
            }
        }());
    }

}(function (outer) {
    'use strict';
    return (this === null) ? outer : this;
}.call(null, this)));

//- vim:set syntax=javascript:
