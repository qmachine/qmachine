//- JavaScript source code

//- rainman.js ~~
//                                                      ~~ (c) SRW, 17 Oct 2011

(function (global) {
    'use strict';

 // Assertions

    if (global.hasOwnProperty('RAINMAN')) {
     // If RAINMAN is already present, avoid extra setup cost.
        return;
    }

 // Declarations

    var define, isFunction, read, remove, uuid, write;

 // Definitions

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

    read = function (key) {
        throw new Error('RAINMAN needs a definition for "read".');
    };

    remove = function (key) {
        throw new Error('RAINMAN needs a definition for "remove".');
    };

    uuid = function () {
     // This function generates hexadecimal UUIDs of length 32.
        var x = '';
        while (x.length < 32) {
            x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
        }
        return x;
    };

    write = function (key, val) {
        throw new Error('RAINMAN needs a definition for "write".');
    };

 // Constructors

    function AVar(obj) {
        obj = (obj instanceof Object) ? obj : {};
        var estack, rstack, ready, revive, that;
        if (obj instanceof AVar) {
            return obj;
        } else {
            estack = [];
            rstack = [];
            ready  = true;
            revive = function (stack) {
                var f;
                if (ready === true) {
                    ready = false;
                    f = stack.shift();
                    if (f === undefined) {
                        ready = true;
                    } else {
                        try {
                            f.call(that, that.val, {
                                failure: function (x) {
                                    that.val = x;
                                    //ready = true;
                                    revive(estack);
                                },
                                success: function (x) {
                                    that.val = x;
                                    ready = true;
                                    revive(rstack);
                                }
                            });
                        } catch (err) {
                            that.val = err;
                            ready = true;
                            revive(estack);
                        }
                    }
                }
            };
            that = this;
            define(that, 'onerror', {
                configurable: false,
                enumerable: true,
                get: function () {
                    return (estack.length > 0) ? estack[0] : null;
                },
                set: function (f) {
                    if (isFunction(f)) {
                        estack.push(f);
                        //revive(estack);
                    } else {
                        throw new Error('"onerror" expects a function.');
                    }
                }
            });
            define(that, 'onready', {
                configurable: false,
                enumerable: true,
                get: function () {
                    return (rstack.length > 0) ? rstack[0] : null;
                },
                set: function (f) {
                    if (isFunction(f)) {
                        rstack.push(f);
                        revive(rstack);
                    } else {
                        throw new Error('"onready" expects a function.');
                    }
                }
            });
            that.key = (obj.hasOwnProperty('key')) ? obj.key : uuid();
            that.val = (obj.hasOwnProperty('val')) ? obj.val : null;
            return that;
        }
    }

 // Global definitions

    global.RAINMAN = function (x) {
     // NOTE: This function requires initialization before use!
        var y = new AVar(x);
        switch ((x.hasOwnProperty('key') ? 2 : 0) +
                (x.hasOwnProperty('val') ? 1 : 0)) {
        case 1:
         // Only 'val' was specified.
            y.onready = function (val, exit) {
                write(y.key, val, exit);
            };
            break;
        case 2:
         // Only 'key' was specified.
            y.onready = function (val, exit) {
                read(y.key, exit);
            };
            break;
        case 3:
         // Both 'key' and 'val' were specified.
            y.onready = function (val, exit) {
                if (val === undefined) {
                    remove(y.key, exit);
                } else {
                    write(y.key, val, exit);
                }
            };
            break;
        default:
         // Neither 'key' nor 'val' was specified -- assume a preallocation?
            y.onready = function (val, exit) {
                write(y.key, val, exit);
            };
        }
        return y;
    };

    global.RAINMAN.init = function (obj) {
        obj = (obj instanceof Object) ? obj : {};
        read = (isFunction(obj.read)) ? obj.read : read;
        remove = (isFunction(obj.remove)) ? obj.remove : remove;
        write = (isFunction(obj.write)) ? obj.write : write;
        delete global.RAINMAN.init;
    };

 // That's all, folks!

    return;

}(function (outer_scope) {
    'use strict';
 // This strict anonymous closure is taken from my Web Chassis project.
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : outer_scope;
    } else {
        return (typeof this.global === 'object') ? this.global : this;
    }
}.call(null, this)));

//- vim:set syntax=javascript:
