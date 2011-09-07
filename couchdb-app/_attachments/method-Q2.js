//- JavaScript source code

//- method-Q2.js ~~
//                                                      ~~ (c) SRW, 07 Sep 2011

Object.prototype.Q = (function () {     //- (begin strict anonymous closure)
    "use strict";

 // Declarations

    var __DEBUG__, bookmarks, celebrate, define, die, map, methodQ, ply,
        postpone, reduce;

 // Fake macros

    __DEBUG__ = false;

 // Constructors

    function ExitFailure(report) {
        this.report = report;
        return this;
    }

    function ExitSuccess(report) {
        this.report = report;
        return this;
    }

    function QuanahVar(x) {
        var content, job, ready, revive, stack, that;
        content = x;
        job = undefined;
        ready = true;
        revive = function () {
            if (ready === true) {
                job = stack.shift();
                if (job !== undefined) {
                    try {
                        job.call(that, that.content);
                    } catch (err) {
                        that.trigger = err;
                    }
                }
            }
        };
        stack = [];
        that = this;
        define(that, "content", {
            configurable: false,
            enumerable: true,
            get: function () {
                if (__DEBUG__ === true) {
                    console.log("(tripped getter)");
                }
                return content;
            },
            set: function (x) {
                content = x;
                if (__DEBUG__ === true) {
                    console.log("(tripped setter)");
                }
                return content;
            }
        });
        define(that, "onready", {
            configurable: false,
            enumerable: true,
            get: function () {
             // This is intended to provide a means to inspect outstanding
             // tasks that have not yet been applied to the content's value
             // but JS pass-by-reference immediately implies that it could
             // be used to modify the queue in-place ...
                return (stack.length === 0) ? null : stack[0];
            },
            set: function (f) {
                if ((f instanceof Function) && (typeof f === 'function')) {
                    stack.push(f);
                    revive();
                } else {
                    throw new Error('"onready" only accepts functions.');
                }
            }
        });
        define(that, "trigger", {
            configurable: false,
            enumerable: true,
         // (no getter defined)
            set: function (x) {
                switch (x.constructor) {
                case ExitSuccess:
                    console.log("(exit success)");
                    ready = true;
                    return;
                case ExitFailure:
                    console.log("(exit failure)");
                    return;
                case TryAgainLater:
                    console.log("(try again later)");
                    stack.push(job);
                    ready = true;
                    return;
                default:
                    console.log(x);
                    console.log("(unknown trigger)");
                    return;
                }
            }
        });
        define(that, "type", {
            configurable: false,
            enumerable: true,
            value: "QuanahVar"
        });
        return that;
    }

    function TryAgainLater(message) {
        if (message.toString().length === 0) {
            this.message = "Dying ...";
        } else {
            this.message = message.toString();
        }
    }

    TryAgainLater.prototype = new Error();

 // Definitions

    if (location.port === "") {
     // This happens if we are actually using the rewrite rules I created
     // for my personal machine, but I haven't tested them on CouchOne ...
        bookmarks = {
            app:    location.href.replace(location.pathname, '/'),
            db:     location.href.replace(location.pathname, '/db/'),
            uuids:  location.href.replace(location.pathname,
                        '/_uuids?count=1000')
        };
    } else if (location.port === "5984") {
     // This is CouchDB's default debugging port, and the convention then
     // is to disable rewrite rules when using that port. In that case, I
     // have avoided hard-coding assumptions about the deployment target
     // by instead opting to navigate paths relative to the current URL.
        bookmarks = {
            app:    location.href.replace(location.pathname, '/') +
                        location.pathname.match(/([\w]+\/){3}/)[0],
            db:     location.href.replace(location.pathname, '/') +
                        location.pathname.match(/([\w]+\/){1}/)[0],
            uuids:  location.href.replace(location.pathname,
                        '/_uuids?count=1000')
        };
    } else {
     // Because this is still experimental, we may find problems.
        throw new Error("Relative path detection fell through.");
    }

    celebrate = function (message) {
        this.trigger = new ExitSuccess(message);
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
                        case "get":
                            obj.__defineGetter__(key, params[prop]);
                            break;
                        case "set":
                            obj.__defineSetter__(key, params[prop]);
                            break;
                        case "value":
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

    die = function (message) {
        this.trigger = new ExitFailure(message);
    };

    methodQ = function (f) {
        var x, y;
        x = new QuanahVar(this);
        switch (f.name) {
        case "map":
            x.onready = function (x) {
                y = map(x, f);
                celebrate.call(x, '(finished "map")');
            };
            return y;
        case "ply":
            x.onready = function (x) {
                ply(x, f);
                celebrate.call(x, '(finished "ply")');
            };
            return x;
        case "reduce":
            x.onready = function (x) {
                y = reduce(x, f);
                celebrate.call(x, '(finished "reduce")');
            };
            return y;
        default:
            x.onready = f;
            return x;
        }
    };

    map = function (x, f) {
        var y;
        if ((x instanceof Object) === false) {
            return f(x);
        } else {
            y = Object.create(Object.getPrototypeOf(x));
            ply(x, function (key, val) {
                y[key] = f(val);
            });
            return y;
        }
    };

    ply = function (x, f) {
        var key;
        if ((x instanceof Object) === false) {
            f(undefined, x);
        } else {
            for (key in x) {
                if (x.hasOwnProperty(key)) {
                    f(key, x[key]);
                }
            }
        }
    };

    postpone = function (message) {
        this.trigger = new TryAgainLater(message);
    };

    reduce = function (x, f) {
        var first, y;
        if ((x instanceof Object) === false) {
            throw new Error('Cannot "reduce" a primitive.');
        } else {
            first = true;
            ply(x, function (key, val) {
                if (first === true) {
                    first = false;
                    y = val;            //- initialize y
                } else {
                    y = f(y, val);      //- apply a simple left-reduce pattern
                }
            });
            return y;
        }
    };

    return methodQ;

}());                                   //- (end strict anonymous closure)

//- Demonstrations -- FOR DEBUGGING PURPOSES ONLY!

console.log([1, 2, 3, 4, 5].Q(function map(each) {
    "use strict";
    return 3 * each;
}));

[1, 2, 3, 4, 5].Q(function ply(key, val) {
    "use strict";
    console.log(key + ": " + val);
});

console.log([1, 2, 3, 4, 5].Q(function reduce(a, b) {
    "use strict";
    return a + b;
}));

//- vim:set syntax=javascript:
