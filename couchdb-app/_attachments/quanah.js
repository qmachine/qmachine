//- JavaScript source code

//- quanah.js ~~
//                                                      ~~ (c) SRW, 03 Oct 2011

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

    var argv, countdown, define, isFunction, uuid;

 // Private definitions

    argv = {
        developer:  false,
        volunteer:  false
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

    uuid = function () {
     // This function generates hexadecimal UUIDs of length 32.
        var x = '';
        while (x.length < 32) {
            x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
        }
        return x;
    };

 // Private constructors

    function QuanahVar(obj) {
        if ((typeof obj !== 'object') || (obj === null)) {
            obj = {};
        }
        var egress, ready, revive, stack, that;
        egress = function () {
            return {
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
        that.key = (obj.hasOwnProperty('key')) ? obj.key : uuid();
        that.val = (obj.hasOwnProperty('val')) ? obj.val : null;
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
        that.sync();
        return that;
    }

    QuanahVar.prototype.sync = function () {
     // This prototype method implements the "transfer layer" completely. I
     // am a lot more concerned with correctness than performance right now.
        var base, bookmarks, key2meta;
        base = 'http://' + global.location.host;
        bookmarks = {
         // NOTE: This part will be initialized by a "parseURI" function soon,
         // but for now I have hardcoded it and matched development settings
         // to the deployment settings :-P
            db:         base + '/db/',
            done:       base + '/_view/status?key="done"',
            running:    base + '/_view/status?key="running"',
            uuids:      base + '/_uuids?count=1000',
            waiting:    base + '/_view/status?key="waiting"'
        };
        key2meta = {};
        console.log(bookmarks);         //- DEBUGGING ONLY!
        QuanahVar.prototype.sync = function () {
            var that = this;
            that.onready = function (x, exit) {
                var count, meta, pull, push, y;
                count = countdown(2, function () {
                    exit.failure(x);
                });
                if (key2meta.hasOwnProperty(that.key) === false) {
                    meta = key2meta[that.key] = {
                        '_id':  that.key,
                        '_rev': null,
                        'url':  bookmarks.db + that.key
                    };
                } else {
                    meta = key2meta[that.key];
                }
                pull = new XMLHttpRequest();
                push = new XMLHttpRequest();
                pull.onreadystatechange = function () {
                    var response;
                    if (pull.readyState === 4) {
                        if (pull.status === 200) {
                            response = JSON.parse(pull.responseText);
                         // NOTE: I need to compare the version numbers ...
                            meta._rev = response._rev;
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
                                meta._rev = response.rev;
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
                y = {
                    '_id':  meta._id,
                    'type': (typeof x)  //- this will be one of the "basic 5"
                };
                if (isFunction(x)) {
                    if (isFunction(x.toJSON)) {
                        y.val = [
                            '(function main() {\nreturn ',
                            x.toJSON(),
                            ';\n}());'
                        ].join(''); 
                    } else if (isFunction(x.toSource)) {
                        y.val = [
                            '(function main() {\nreturn ',
                            x.toSource(),
                            ';\n}());' 
                        ].join('');
                    } else {
                        y.val = [
                            '(function main() {\nreturn ',
                            x.toString(),
                            ';\n}());' 
                        ].join('');
                    }
                } else {
                    y.val = x;
                }
                if (meta._rev === null) {
                    push.send(JSON.stringify(y));
                } else {
                    y._rev = meta._rev;
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
        return task;
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

 // Demonstrations (for testing only)

    console.log(([1, 2, 3, 4, 5].Q(null, function (x, exit) {
        console.log(x);
        exit.success(x);
    })).sync());

}(function (outer) {
    'use strict';
    return (this === null) ? outer : this;
}.call(null, this)));

//- vim:set syntax=javascript:
