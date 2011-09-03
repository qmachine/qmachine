//- JavaScript source code

//- q.js ~~
//
//  This is the "convenience" library for programming with Quanah. It allows
//  you to get work done quickly by providing useful tools and optimizations in
//  any way it can -- it even uses a single-letter "namespace" to cut down on
//  typing. In fact, its biggest inconvenience is that you must explicitly load
//  it yourself by including the line, 'load("q.js");' :-)
//
//  NOTE: This file is much more subject to change than the other JS codes!
//
//                                                          ~~ SRW, 13 Nov 2010

if (this.q === undefined) {
    var q = {};
}

(function () {

//- PRIVATE DEFINITIONS -- these are confined to this anonymous closure.

    var all, any, as_Array, assert, chomp, compose, filter, identity, map,
        max, mean, min, reduce, traverse, seq, sum, variance, zip;

    as_Array = function (x) {
        return Array.prototype.slice.call(arguments);
    };

    chomp = function (str) {
        return str.replace(/\s*$/, "");
    };

    identity = function (x) {
        return x;
    };

    assert = function (expr, message) {
        if (expr !== true) {
            throw 'Error: statement "' + message + '" was not satisfied.';
        }
    };

    traverse = function (x) {
        switch (x.constructor) {
        case Array:
            return {
                using: function (func) {
                    var index;
                    for (index = 0; index < x.length; index += 1) {
                        func(index);
                    }
                }
            };
        case Object:
            return {
                using: function (func) {
                    var key;
                    for (key in x) {
                        if (x.hasOwnProperty(key)) {
                            func(key);
                        }
                    }
                }
            };
        case String:
            return {
                using: function (func) {
                    var index;
                    for (index = 0; index < x.length; index += 1) {
                        func(index);
                    }
                }
            };
        default:
            throw "'q.traverse' expects an Array, Object, or String.";
        }
    };

    map = function (x) {
        return {
            using: function (f) {
                var y;
                y = [];
                traverse(x).using(function (i) {
                    y[i] = f(x[i]);
                });
                return y;
            }
        };
    };

    reduce = function (init, x) {
        return {
            using: function (f) {
                var y;
                y = init;
                traverse(x).using(function (i) {
                    y = f(y, x[i]);
                });
                return y;
            }
        };
    };

    filter = function (x) {
        return {
            using: function (pred) {
                var y;
                y = [];
                traverse(x).using(function (i) {
                    if (pred(x[i]) === true) {
                        y.push(x[i]);
                    }
                });
                return y;
            }
        };
    };

    compose = function () {
        var composition, funcs;
        composition = function (f, g) {
            return function () {
                return f.apply(this, [g.apply(this, arguments)]);
            };
        };
        funcs = as_Array(arguments);
        return reduce(identity, funcs).using(composition);
    };

    all = function (x) {
        var y;
        y = filter(x).using(identity);
        return (x.length === y.length);
    };

    any = function (x) {
        var y;
        y = filter(x).using(identity);
        return (y.length !== 0);
    };

    max = function (x) {
        return reduce(-Infinity, x).using(function (a, b) {
            return (a < b) ? b : a;
        });
    };

    min = function (x) {
        return reduce(Infinity, x).using(function (a, b) {
            return (a < b) ? a : b;
        });
    };

    seq = function (from, to, skip) {
        var i, y;
        skip = skip || 1;
        y = [];
        for (i = from; i <= to; i += skip) {
            y.push(i);
        }
        return y;
    };

    zip = function () {
        var args, lengths, n, y;
        args = as_Array(arguments);
        lengths = map(args).using(function (each) {
            return each.length;
        });
        n = min(lengths);
        y = [];
        traverse(args).using(function (i) {
            traverse(seq(0, n - 1)).using(function (j) {
                if (y[j] === undefined) {
                    y[j] = [];
                }
                y[j][i] = args[i][j];
            });
        });
        return y;
    };

    sum = function (x) {
        return reduce(0, x).using(function (a, b) {
            return a + b;
        });
    };

    mean = function (x) {
        return sum(x) / x.length;
    };

    variance = function (x) {
        var n, series, xbar;
        xbar = mean(x);
        n = x.length;
        series = map(x).using(function (each) {
            return Math.pow(each - xbar, 2) / (n - 1);
        });
        return sum(series);
    };

//- PUBLIC DEFINITIONS -- these will be persistent outside this closure.

    q = {
        all:        all,
        any:        any,
        assert:     assert,
        chomp:      chomp,
        compose:    compose,
        filter:     filter,
        map:        map,
        max:        max,
        mean:       mean,
        min:        min,
        reduce:     reduce,
        seq:        seq,
        sum:        sum,
        traverse:   traverse,
        variance:   variance,
        zip:        zip
    };

})();

//- vim:set syntax=javascript:
