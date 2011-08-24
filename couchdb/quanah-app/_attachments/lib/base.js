//- JavaScript source code

//- base.js ~~
//
//  This module implements a base library of higher-order functional patterns
//  by defining and using a system for generic programming :-)
//
//                                                      ~~ (c) SRW, 22 Aug 2011

/*jslint indent: 4, maxlen: 80, nomen: true */
/*global chassis: true */

chassis(function (q) {
    "use strict";

 // Prerequisites (n/a)

 // Module definition

    q.base = function () {

     // Constructors

        function Duck(x) {
            this.raw = x;
        }

        Duck.prototype.isArrayLike = function () {
            var raw = this.raw;
            switch (typeof raw) {
            case "string":
                return true;            //- need to revisit this later!
            case "object":
                return ((raw !== null) && (raw.hasOwnProperty("length")));
            default:
                return false;
            }
        };

        Duck.prototype.has = function (type, name) {
            return ((this.raw !== null)                 &&
                    (typeof this.raw !== 'undefined')   &&
                    (typeof this.raw[name] === type)
            );
        };

        Duck.prototype.isObjectLike = function () {
            return (this.raw instanceof Object);
        };

        Duck.prototype.toNumber = function () {
            return parseFloat(this.raw);
        };

     // Declarations

        var duck, fakeObject, generic, guts, key_gen, known_types;

     // Definitions

        duck = function (x) {
            return new Duck(x);
        };

        fakeObject = {
         // This object implements some important ES5 static Object methods.
         // Yes, I could extend the global Array prototype, but doing so
         // directly affects other (potentially unrelated) scripts running in
         // the global environment. If any of those detects method existence
         // as a means of self-configuration, for example, then I might be at
         // fault for introducing bugs. I do _not_ like to be a scapegoat!
            create: function (obj) {
                if (typeof Object.create === 'function') {
                    fakeObject.create = Object.create;
                } else {
                    fakeObject.create = function (obj) {
                        function F() {}
                        F.prototype = obj;
                        return new F();
                    };
                }
                return fakeObject.create(obj);
            },
            defineProperty: function (obj, key, params) {
                if (typeof Object.defineProperty === 'function') {
                    fakeObject.defineProperty = Object.defineProperty;
                } else {
                    fakeObject.defineProperty = function (obj, key, params) {
                        var each;
                        for (each in params) {
                            if (params.hasOwnProperty(each)) {
                                switch (each) {
                                case "get":
                                    obj.__defineGetter__(key, params[each]);
                                    break;
                                case "set":
                                    obj.__defineSetter__(key, params[each]);
                                    break;
                                case "value":
                                    delete obj[key];
                                    obj[key] = params[each];
                                    break;
                                default:
                                 // (placeholder)
                                }
                            }
                        }
                        return obj;
                    };
                }
                return fakeObject.defineProperty(obj, key, params);
            }
        };

        generic = function generic() {
            var f;
            f = function self() {
                return guts.apply(self, arguments);
            };
            f.constructor = generic;
            f.def = {};
            return f;
        };

        guts = function () {
         // This is the "fake prototype" for all generic functions. Yes, it
         // intentionally forces you to use nine named arguments or less. If
         // that offends you, you may contact me directly to state your case,
         // because it is entirely possible I have made a misjudgment.
         // NOTE: Currently, you cannot define generic rules that expect zero
         // input arguments. I will deal with this soon.
            var args, def, key, i, index, n, temp;
            args = Array.prototype.slice.call(arguments, 0, 9);
            def = this.def;
            key = key_gen(args);
            index = key.index;
            n = args.length;
            if (key.special === true) {
                return fakeObject.defineProperty({}, "def", {
                    configurable: false,
                    enumerable:   false,
                    get: function () {
                        return def[index];
                    },
                    set: function (g) {
                        def[index] = g;
                    }
                });
            }
            if (typeof def[index] === 'function') {
                return def[index].apply(this, args);
            }
         // Try converting the arguments to Duck types using a 'map' pattern.
            temp = [];
            for (i = 0; i < n; i += 1) {
                temp[i] = duck(args[i]);
            }
            index = key_gen(temp).index;
            if (typeof def[index] === 'function') {
                return def[index].apply(this, temp);
            }
         // We're not ever supposed to fall this far, but if we do, it's
         // nice to have some debugging advice. (This may be removed ...)
            temp = [];
            for (i = 0; i < n; i += 1) {
                temp[i] = Function;     //- a "map-along" pattern :-P
            }
            if (key_gen(temp).index === key_gen(args).index) {
                if (args.length === 1) {
                    throw new Error("Unregistered type");
                } else {
                    throw new Error("Unregistered types");
                }
            } else {
                throw new Error("No definition found (" + this + ").");
            }
        };

        known_types = [
         // These are listed in the order shown in the ES5 standard (Jan 2011,
         // pp.110-111) under Section 15.1.4; performance is irrelevant here.
            Object, Function, Array, String, Boolean, Number, Date, RegExp,
            Error, EvalError, RangeError, ReferenceError, SyntaxError,
            TypeError, URIError,
         // This is a type I have defined in this closure itself, and ...
            Duck,
         // ... these are some "types" whose behavior isn't well-defined yet.
            null, undefined
        ];

        key_gen = function (x) {
            var find;
            if (typeof Array.prototype.indexOf === 'function') {
                find = function (x) {
                    var i = Array.prototype.indexOf.call(known_types, x);
                    return {
                        special:    (i !== -1),
                        index:      (i !== -1) ? i : find(x.constructor).index
                    };
                };
            } else {
                find = function (x) {
                    var i, index, n;
                    i = -1;
                    n = known_types.length;
                    for (index = 0; index < n; index += 1) {
                        if (x === known_types[index]) {
                            i = index;
                        }
                    }
                    return {
                        special:    (i !== -1),
                        index:      (i !== -1) ? i : find(x.constructor).index
                    };
                };
            }
            key_gen = function (x) {
                var i, n, special, temp, y;
                n = x.length;
                special = true;
                y = [];
                for (i = 0; i < n; i += 1) {
                 // We map over one return variable and reduce on the other :-)
                    temp = find(x[i]);
                    special = (special && temp.special);
                    y[i] = temp.index;
                }
                return {
                    special:    special,
                    index:      Array.prototype.join.call(y, "-")
                };
            };
            return key_gen(x);
        };

        q.base$duck     =   duck;
        q.base$generic  =   generic;

        q.base$registerType = function (x) {
            if (key_gen([x]).special === false) {
                known_types.push(x);
            }
        };

        q.base$compose  =   generic();
        q.base$filter   =   generic();
        q.base$format   =   generic();
        q.base$map      =   generic();
        q.base$ply      =   generic();
        q.base$reduce   =   generic();
        q.base$seq      =   generic();
        q.base$trim     =   generic();
        q.base$zip      =   generic();

        q.base$compose(Array).def = function (x) {
            return q.base$reduce(x).using(function (f, g) {
                return function () {
                    return f.call(this, g.apply(this, arguments));
                };
            });
        };

        q.base$filter(Array).def = function (x) {
            if (typeof Array.prototype.filter === 'function') {
                q.base$filter(Array).def = function (x) {
                    return {
                        using: function (f) {
                            var test;
                            if (f.constructor === RegExp) {
                                test = function (each) {
                                    return f.test(each);
                                };
                            } else {
                                test = f;
                            }
                            return Array.prototype.filter.call(x, test);
                        }
                    };
                };
            } else {
                q.base$filter(Array).def = function (x) {
                    return {
                        using: function (f) {
                            var test, y;
                            if (f.constructor === RegExp) {
                                test = function (each) {
                                    return f.test(each);
                                };
                            } else {
                                test = f;
                            }
                            y = [];
                            q.base$ply(x).by(function (key, val) {
                                if (test(val) === true) {
                                    y.push(val);
                                }
                            });
                            return y;
                        }
                    };
                };
            }
            return (q.base$filter(Array).def)(x);
        };

        q.base$filter(Duck).def = function (x) {
            if (x.isArrayLike()) {
                return (q.base$filter(Array).def)(x.raw);
            }
            if (x.isObjectLike()) {
                return {
                    using: function (f) {
                        var test, y;
                        if (f.constructor === RegExp) {
                            test = function (each) {
                                return f.test(each);
                            };
                        } else {
                            test = f;
                        }
                        y = fakeObject.create(Object.getPrototypeOf(x.raw));
                        q.base$ply(x.raw).by(function (key, val) {
                            if (test(val) === true) {
                                y[key] = val;
                            }
                        });
                        return y;
                    }
                };
            } else {
                return {
                    using: function (f) {
                        if (f.constructor === RegExp) {
                            return f.test(x.raw.toString());
                        } else {
                            return f(x.raw);
                        }
                    }
                };
            }
        };

        q.base$format(Array).def = function (x) {
            var y = q.base$map(x).using(q.base$format);
            return Array.prototype.join.call(y, ",");
        };

        q.base$format(Duck).def = function (x) {
            var keys, temp, y;
            if (x.isObjectLike()) {
             // This part is a little ugly right now, but the idea is not only
             // to stringify an object, but also to sort its keys to make it
             // easier for a human to read -- that's why we're formatting it,
             // after all :-P
                keys = [];
                temp = x.raw;
                y = [];
                q.base$ply(temp).by(function (key, val) {
                    keys.push(key);
                });
                keys = keys.sort(function (a, b) {
                    return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;
                });
                if (keys.length > 0) {
                    y = q.base$map(keys).using(function (each) {
                        return each + ': "' + q.base$format(temp[each]) + '"';
                    });
                    return "{\n    " + y.join(",\n    ") + "\n}";
                } else {
                    return "{}";
                }
            } else {
                if (x.has("function", "toSource")) {
                    y = x.raw.toSource();
                } else {
                    y = x.raw.toString();
                }
                return y;
            }
        };

        q.base$format(Error).def = function (x) {
            return x.name + ": " + x.message;
        };
        q.base$format(EvalError).def        =   (q.base$format(Error).def);
        q.base$format(RangeError).def       =   (q.base$format(Error).def);
        q.base$format(ReferenceError).def   =   (q.base$format(Error).def);
        q.base$format(SyntaxError).def      =   (q.base$format(Error).def);
        q.base$format(TypeError).def        =   (q.base$format(Error).def);
        q.base$format(URIError).def         =   (q.base$format(Error).def);

        q.base$format(Function).def = function (f) {
            var key, obj;
            obj = {};
            if (typeof f.toSource === 'function') {
                obj.sourcecode = f.toSource();
            } else if (typeof f.toString === 'function') {
                obj.sourcecode = f.toString();
            } else {
                obj.sourcecode = f.valueOf();
            }
            obj.properties = {};
            for (key in f) {
                if (f.hasOwnProperty(key)) {
                    obj.properties[key] = f[key];
                }
            }
            return q.base$format(obj);
        };

        q.base$format(Number).def = function (x) {
         // See also: x.toExponential, x.toFixed, x.toString ...
            if (q.flags.hasOwnProperty("digits")) {
                return x.toPrecision(parseInt(q.flags.digits, 10));
            } else {
                return x.toPrecision(5);
            }
        };

        q.base$format(String).def = function (x) {
            return x;
        };

        q.base$map(Array).def = function (x) {
            if (typeof Array.prototype.map === 'function') {
                q.base$map(Array).def = function (x) {
                    return {
                        using: function (f) {
                            return Array.prototype.map.call(x, function (val) {
                                return f(val);
                            });
                        }
                    };
                };
            } else {
                q.base$map(Array).def = function (x) {
                    return {
                        using: function (f) {
                            var y = [];
                            q.base$ply(x).by(function (key, val) {
                                y[key] = f(val);
                            });
                            return y;
                        }
                    };
                };
            }
            return (q.base$map(Array).def)(x);
        };

        q.base$map(Duck).def = function (x) {
         // This is significantly harder than the reduce function because maps
         // should (in my opinion) return the same output type as input type.
         // Should I restrict ply-ish methods to Array-Like Objects? Hmm ...
            if (x.isArrayLike()) {
                return (q.base$map(Array).def)(x.raw);
            }
            if (x.isObjectLike()) {
                return {
                    using: function (f) {
                        var temp, y;
                        temp = x.raw;
                        y = fakeObject.create(Object.getPrototypeOf(temp));
                        q.base$ply(temp).by(function (key, val) {
                            y[key] = f(val);
                        });
                        return y;
                    }
                };
            } else {
                return {
                    using: function (f) {
                        return f(x.raw);
                    }
                };
            }
        };

        q.base$ply(Array).def = function (x) {
            if (typeof Array.prototype.forEach === 'function') {
                q.base$ply(Array).def = function (x) {
                    return {
                        by: function (f) {
                            Array.prototype.forEach.call(x, function (v, k) {
                                f(k, v);
                            });
                        }
                    };
                };
            } else {
                q.base$ply(Array).def = function (x) {
                    return {
                        by: function (f) {
                            var i, n;
                            n = x.length;
                            for (i = 0; i < n; i += 1) {
                                f(i, x[i]);
                            }
                        }
                    };
                };
            }
            return (q.base$ply(Array).def)(x);
        };

        q.base$ply(Duck).def = function (x) {
            if (x.isArrayLike()) {
                return (q.base$ply(Array).def)(x.raw);
            }
            if (x.isObjectLike()) {
                return {
                    by: function (f) {
                        var key, temp;
                        temp = x.raw;
                        for (key in temp) {
                            if (temp.hasOwnProperty(key)) {
                                f(key, temp[key]);
                            }
                        }
                    }
                };
            } else {
                return {
                    by: function (f) {
                        f(undefined, x.raw);
                    }
                };
            }
        };

        q.base$reduce(Array).def = function (x) {
            if (typeof Array.prototype.reduce === 'function') {
                q.base$reduce(Array).def = function (x) {
                    return {
                        using: function (f) {
                            return Array.prototype.reduce.call(x, f);
                        }
                    };
                };
            } else {
                q.base$reduce(Array).def = (q.base$reduce(Duck).def)(duck(x));
            }
            return (q.base$reduce(Array).def)(x);
        };

        q.base$reduce(Duck).def = function (x) {
            return {
                using: function (f) {
                    var first, y;
                    first = true;
                    q.base$ply(x.raw).by(function (key, val) {
                        if (first) {
                            y = val;
                            first = false;
                        } else {
                            y = f(y, val);
                        }
                    });
                    return y;
                }
            };
        };

        q.base$seq(Duck).def = function (x) {
            return q.base$seq(0, x.toNumber(), 1);
        };

        q.base$seq(Duck, Duck).def = function (x1, x2) {
            return q.base$seq(x1.toNumber(), x2.toNumber(), 1);
        };

        q.base$seq(Duck, Duck, Duck).def = function (x1, x2, x3) {
            return q.base$seq(x1.toNumber(), x2.toNumber(), x3.toNumber());
        };

        q.base$seq(Number, Number, Number).def = function (x1, x2, x3) {
         // This works like Python's "range" and R's "seq(from, to, by)".
            var i, y;
            y = [];
            for (i = x1; i < x2; i += x3) {
                y[i] = i;
            }
            return y;
        };

        q.base$trim(String).def = function (x) {
            if (typeof String.prototype.trim === 'function') {
                q.base$trim(String).def = function (x) {
                    return String.prototype.trim.call(x);
                };
            } else {
                q.base$trim(String).def = function (x) {
                    return x.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
                };
            }
            return (q.base$trim(String).def)(x);
        };

        q.base$zip(Duck).def = function (x) {
            if (x.isArrayLike()) {
                return {
                    using: function (f) {
                        var n, seq;
                        n = q.base$reduce(x).using(function (a, b) {
                            return (a.length < b.length) ? a : b;
                        }).length;
                        seq = q.base$seq(0, n, 1);
                        return q.base$map(seq).using(function (j) {
                            var col;
                            col = q.base$map(x).using(function (row) {
                                return row[j];
                            });
                            return f.apply(this, col);
                        });
                    }
                };
            } else {
                throw new Error("q.base$zip is for array-like objects.");
            }
        };

     // And while we're at it, we'll go ahead and replace one of the builtins.

        (function (puts) {
            q.puts = function () {
                var args, temp;
                args = Array.prototype.slice.call(arguments);
                temp = q.base$map(args).using(q.base$format);
                puts(Array.prototype.join.call(temp, " "));
            };
        }(q.puts));

    };

});

//- vim:set syntax=javascript:
