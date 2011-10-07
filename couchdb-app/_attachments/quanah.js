//- JavaScript source code

//- quanah.js ~~
//
//  TO-DO:
//  -   argument parsing
//  -   automatic polling
//  -   worker script
//  -   the "define" function can probably disappear soon :-)
//
//                                                      ~~ (c) SRW, 03 Oct 2011

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
        developer:  false,
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
     // Here, we add user-specified properties directly to the new object.
        if (obj.hasOwnProperty('key')) {
            that.key = obj.key;
        }
        if (obj.hasOwnProperty('val')) {
            that.val = obj.val;
        }
     // We don't worry if either property is missing, though, because we take
     // care of that during the invocation of the "sync" method :-)
        return that.sync();
    }

    QuanahVar.prototype.sync = function () {
     // This prototype method implements the "transfer layer" completely. I
     // am a lot more concerned with correctness than performance right now.
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
                var count, meta, pull, push, y;
                count = countdown(2, function () {
                    exit.failure(x);
                });
                if (that.hasOwnProperty('key')) {
                 // ==> pull
                    if (that.hasOwnProperty('val')) {
                     // Instance is out-of-date and needs only be synced.
                     // ==> push also (and let one fail?)
                    } else {
                     // Instance is being revived from a known key.
                    }
                } else {
                 // Instance is being initialized from value.
                    that.key = uuid();
                    that.val = (that.hasOwnProperty('val')) ? that.val : null;
                 // ==> push
                }
                if (key2meta.hasOwnProperty(that.key) === false) {
                    key2meta[that.key] = {
                        id:     that.key,
                        rev:    null,
                        url:    bookmarks.doc(that.key)
                    };
                }
                meta = key2meta[that.key];
                y = {
                    '_id':  meta.id,
                    //'_rev': meta.rev, //- this line can be troublesome ...
                    'type': (typeof that.val),
                    'val':  (function (val) {
                     // Here, I am experimenting with using 'eval' to revive
                     // _all_ values for consistency rather than security. I
                     // don't care to rant about Crockford here ... ;-)
                        var left, right;
                        left = '(function () {\nreturn ';
                        right = ';\n}());';
                        if (isFunction(val.toJSON)) {
                            return left + val.toJSON() + right;
                        } else if (isFunction(val.toSource)) {
                            return left + val.toSource() + right;
                        } else {
                            return left + JSON.stringify(val) + right;
                        }
                    }(that.val))
                };
                pull = new XMLHttpRequest();
                push = new XMLHttpRequest();
                pull.onreadystatechange = function () {
                    var response;
                    if (pull.readyState === 4) {
                        if (pull.status === 200) {
                            response = JSON.parse(pull.responseText);
                         // NOTE: I need to compare the version numbers ...
                            meta.rev = response._rev;
                            exit.success(response.val);
                        } else {
                            count();
                        }
                    }
                };
                push.onreadystatechange = function () {
                    var response;
                    if (push.readyState === 4) {
                        if (push.status === 201) {
                            response = JSON.parse(push.responseText);
                            if (response.ok === true) {
                                meta.rev = response.rev;
                                exit.success(x);
                            } else {
                                count();
                            }
                        } else {
                            count();
                        }
                    }
                };
                pull.open('GET', meta.url, true);
                push.open('PUT', meta.url, true);
                push.setRequestHeader('Content-type', 'application/json');
                if (meta.rev === null) {
                    pull.send(null);
                    push.send(JSON.stringify(y));
                } else {
                    y._rev = meta.rev;
                    pull.send(null);
                    push.send(JSON.stringify(y));
                }
                return that;
            };
            return that;
        };
        return this.sync();
    };

 // Global definitions

    Object.prototype.Q = function (func) {  //  y = x.Q(f);
        if (arguments.length < 2) {
            throw new Error('Method "Q" requires two input arguments.');
        }
        var argv, main, results, task;
        argv = new QuanahVar({
            val: this
        });
        main = new QuanahVar({
            val: func
        });
        results = new QuanahVar({
            val: null
        });
        task = new QuanahVar({
            val: {
                main:       null,
                argv:       null,
                results:    null,
                status:     null
            }
        });
        task.onready = function (task, exit) {
            var count;
            count = countdown(3, function () {
                task.status = 'waiting';
                exit.success(task);
            });
            argv.onready = function (val, exit) {
                task.argv = argv.key;
                exit.success(val);
                count();
            };
            main.onready = function (val, exit) {
                task.main = main.key;
                exit.success(val);
                count();
            };
            results.onready = function (val, exit) {
                task.results = results.key;
                exit.success(val);
                count();
            };
        };
        return task.sync();             //- returns a reference to task
    };

 // Invocations

    // (DEVELOPER SCRIPT GOES HERE)

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
                    var n, obj, task;
                    n = queue.rows.length;
                    if (n === 0) {
                        postMessage('Nothing to do ...');
                    } else {
                     // TO-DO: Select "obj" randomly ...
                        obj = queue.rows[0];
                        task = new QuanahVar({
                            key: obj.id || obj._id,
                            val: {
                                main:       obj.value.main,
                                argv:       obj.value.argv,
                                results:    obj.value.results,
                                status:     obj.key
                            }
                        });
                        task.onready = function (val, exit) {
                            val.status = "running";
                            task.onready = function (val, exit) {
                             // This part is purely for debugging :-P
                                postMessage(task);
                                task.sync();
                                exit.success(val);
                            };
                            exit.success(val);
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
