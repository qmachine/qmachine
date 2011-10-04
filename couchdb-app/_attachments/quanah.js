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
        var bookmarks, key2meta;
        bookmarks = {
         // NOTE: This part will be initialized by a "parseURI" function soon,
         // but for now I have hardcoded it and matched development settings
         // to the deployment settings :-P
            db: 'http://' + global.location.host + '/db/'
        };
        key2meta = {};
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

    Object.prototype.Q = function (key, func) {
        if (arguments.length < 2) {
            throw new Error('Method "Q" requires two input arguments.');
        }
        var f, x, y, z;
        if ((key === null) || (key === undefined)) {
         // USE CASE #1 --> y = x.Q(null, f);
            f = new QuanahVar({
                val: func
            });
            x = new QuanahVar({
                val: this
            });
            y = new QuanahVar({
                val: null
            });
            z = new QuanahVar({
                val: {
                    main:       null,
                    argv:       null,
                    results:    null,
                    status:     'initializing'
                }
            });
            z.onready = function (z, exit) {
                var count;
                count = countdown(3, function () {
                    z.status = 'waiting';
                    exit.success(z);
                });
                f.onready = function (val, exit) {
                    z.main = f.key;
                    exit.success(val);
                    count();
                };
                x.onready = function (val, exit) {
                    z.argv = x.key;
                    exit.success(val);
                    count();
                };
                y.onready = function (val, exit) {
                    z.results = y.key;
                    exit.success(val);
                    count();
                };
            };
            return z;
        } else {
         // USE CASE #2 --> y = [].Q(key, f);
            throw new Error('(query support is forthcoming)');
        }
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
