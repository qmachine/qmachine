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

        Duck.prototype.has = function (name, type) {
            return ((this.raw !== null)                 &&
                    (typeof this.raw !== 'undefined')   &&
                    (typeof this.raw[name] === type)
            );
        };

        Duck.prototype.isObjectLike = function () {
            return (this.raw instanceof Object);
        };

        Duck.prototype.toNumber = function () {
         // This function implements the abstract operation ToNumber defined
         // in Section 9.3 of the ES5 specification (Jan. 2011, pp.43-46).
            switch (this.raw) {
            case undefined:
                return NaN;
            case null:
                return 0;
            case true:
                return 1;
            case false:
                return 0;
            default:
                return parseFloat(this.raw);
            }
        };

     // Declarations

        var duck, fakeObject, generic, guts, known_types;

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
         // This function acts as a "fake prototype" for all generics, because
         // JavaScript doesn't allow inheritance from a Function object. Yes,
         // I have deliberately forced you to use nine or less named arguments.
         // If that offends you, contact me directly to state your case; it's
         // entirely possible I have made a misjudgment. Also, note that the
         // value of 'known_types[0]' is always the 'Duck' constructor; I have
         // hard-coded that assumption to avoid nested "for" loops that would
         // otherwise make the function slower and uglier.
            var args, def, flag, i, j, key, temp;
            args = Array.prototype.slice.call(arguments, 0, 9);
            def = this.def;
            flag = true;                //- Is this a definition? --> true
            temp = [];
            if (args.length === 0) {
             // I have now added minimal support for generic definitions that
             // take zero arguments. Currently, you cannot redefine the rule
             // once it has been defined. I have some ideas how to extend the
             // behavior completely, but my main focus for development right
             // now is Quanah, not Web Chassis. I'll improve this when I can.
                flag = (def.hasOwnProperty("zero") === false);
                key  = "zero";
            } else {
                for (i = 0; i < args.length; i += 1) {
                    if (flag === true) {
                        for (j = 0; j < known_types.length; j += 1) {
                            if (args[i] === known_types[j]) {
                                temp[i] = j;
                                break;
                            }
                        }
                        if (temp.hasOwnProperty(i) === false) {
                            flag = false;
                            temp = [];
                            i = -1;
                        }
                    } else {
                        for (j = 0; j < known_types.length; j += 1) {
                            if (args[i].constructor === known_types[j]) {
                                temp[i] = j;
                            }
                        }
                        if (temp.hasOwnProperty(i) === false) {
                         // If it isn't a known type, we'll treat it as a Duck.
                            args[i] = duck(args[i]);
                            temp[i] = 0;
                        }
                    }
                }
                key = Array.prototype.join.call(temp, "-");
            }
            if (flag === true) {
             // Hooray! You're (probably) defining a new generic rule. If not,
             // well, I must admit your invocation is rather odd ... :-P
                return fakeObject.defineProperty({}, "def", {
                    configurable:   false,
                    enumerable:     false,
                    get: function () {
                        return def[key];
                    },
                    set: function (f) {
                        if (typeof f !== 'function') {
                            throw new Error("Generic defs must be functions.");
                        }
                        def[key] = f;
                    }
                });
            } else {
             // You are invoking a generic function to act on some arguments.
             // If an appropriate definition already exists, we will skip the
             // "for" loop and use that definition, but otherwise we will have
             // to try converting the arguments to Duck types. In that case,
             // proceed one at a time from left to right while checking to see
             // if a matching definition exists for the transformed arguments.
             // If we find one, we will use it, and otherwise we'll "panic" ;-)
                flag = (typeof def[key] === 'function');
                for (i = 0; (flag === false) && (i < temp.length); i += 1) {
                    if (temp[i] !== 0) {
                        args[i] = duck(args[i]);
                        temp[i] = 0;
                        key = Array.prototype.join.call(temp, "-");
                        flag = (typeof def[key] === 'function');
                    }
                }
                if (flag === true) {
                    return def[key].apply(this, args);
                } else {
                    throw new Error("No generic def for given arguments.");
                }
            }
        };

        known_types = [
         // This array contains a list of type constructors. I have listed the
         // Duck type first to allow me to hardcode a default into 'guts'.
            Duck,
         // The rest are listed in the order shown in Section 15.1.4 of the
         // ES5 standard (Jan 2011, pp.110-111). No consideration whatsoever
         // has been given to optimizing this order for better performance.
            Object, Function, Array, String, Boolean, Number, Date, RegExp,
            Error, EvalError, RangeError, ReferenceError, SyntaxError,
            TypeError, URIError,
         // These are "types" whose behavior isn't well-defined yet ...
            null, undefined
        ];

        q.base$duck     =   duck;
        q.base$generic  =   generic;

        q.base$registerType = function (x) {
            var flag, i;
            flag = false;
            while ((flag === false) && (i < known_types.length)) {
                flag = (x === known_types[i]);
                i += 1;
            }
            if (flag === false) {
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

        q.base$filter(Array, Function).def = function (x, f) {
            return q.base$filter(x).using(f);
        };

        q.base$filter(Duck, Function).def = function (x, f) {
            return q.base$filter(x).using(f);
        };

        q.base$format(Array).def = function (x) {
            var y = q.base$map(x).using(q.base$format);
            return Array.prototype.join.call(y, ",");
        };

        q.base$format(Date).def = function (x) {
            if (x.hasOwnProperty("toJSON")) {
                return x.toJSON();
            } else {
                return JSON.parse(JSON.stringify(x));
            }
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
                if (x.has("toSource", "function") === true) {
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

        q.base$format(undefined).def = function (x) {
            return "undefined";
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

        q.base$map(Array, Function).def = function (x, f) {
            return q.base$map(x).using(f);
        };

        q.base$map(Duck, Function).def = function (x, f) {
            return q.base$map(x).using(f);
        };

        q.base$ply(Array).def = function (x) {
            if (typeof Array.prototype.forEach === 'function') {
                q.base$ply(Array).def = function (x) {
                    return {
                        by: function (f) {
                         // Although this looks really strange to return the
                         // input argument, we need to do this consistently in
                         // all types so that users can monitor remote jobs.
                            Array.prototype.forEach.call(x, function (v, k) {
                                f(k, v);
                            });
                            return x;
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
                            return x;   //- see note in Array definition
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
                        return x.raw;   //- see note in Array definition
                    }
                };
            } else {
                return {
                    by: function (f) {
                        f(undefined, x.raw);
                        return x.raw;   //- see note in Array definition
                    }
                };
            }
        };

        q.base$ply(Array, Function).def = function (x, f) {
            return q.base$ply(x).by(f);
        };

        q.base$ply(Duck, Function).def = function (x, f) {
            return q.base$ply(x).by(f);
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

        q.base$reduce(Array, Function).def = function (x, f) {
            return q.base$reduce(x).using(f);
        };

        q.base$reduce(Duck, Function).def = function (x, f) {
            return q.base$reduce(x).using(f);
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

        q.base$zip(Duck, Function).def = function (x, f) {
            return q.base$zip(x).using(f);
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
