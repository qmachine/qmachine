//- JavaScript source code

//- q.js ~~
//  This is the "convenience" library for programming with Quanah. It allows
//  you to get work done quickly by providing useful tools and optimizations in
//  any way it can -- it even uses a single-letter "namespace" to cut down on
//  typing. In fact, its biggest inconvenience is that you must explicitly load
//  it yourself by including the line, 'load("q.js");' :-)
//                                                          ~~ SRW, 13 Nov 2010

if (this.q === undefined) {
    var q = {};
}

(function () {

//- PRIVATE DEFINITIONS -- these are confined to this anonymous closure.

    var as_array = function (obj) {
            return Array.prototype.slice.call(obj);
        },

        iterate = function (x) {
            switch (x.constructor) {
            case Array:
                return {
                    using: function (func) {
                        for (var index = 0; index < x.length; index += 1) {
                            func(index);
                        }
                    }
                };
            case Object:
                return {
                    using: function (func) {
                        for (var key in x) {
                            if (x.hasOwnProperty(key)) {
                                func(key);
                            }
                        }
                    }
                };
            default:
                throw "'q.iterate' arg 'x' was not an Array or an Object.";
            }
        },

        map = function (x) {
            return {
                using: function (f) {
                    var y = [];
                    iterate(x).using(function (i) {
                        y[i] = f(x[i]);
                    });
                    return y;
                }
            };
        },

        reduce = function (init, x) {
            return {
                using: function (f) {
                    var y = init;
                    iterate(x).using(function (i) {
                        y = f(y, x[i]);
                    });
                    return y;
                }
            };
        },

        compose = function () {
            var identity = function (x) {
                    return x;
                },
                funcs = as_array(arguments),
                composition = function (f, g) {
                    return function () {
                        return f.apply(this, [g.apply(this, arguments)]);
                    };
                };
            return reduce(identity, funcs).using(composition);
        },

        sum = function (x) {
            return reduce(0, x).using(function (a, b) {
                return a + b;
            });
        },

        mean = function (x) {
            return sum(x) / x.length;
        },

        variance = function (x) {
            var xbar = Maths.mean(x),
                n = x.length;
            return std.reduce(0, x, function (a, b) {
                return a + (Maths.pow(b - xbar, 2) / (n - 1));
            });
        };

//- PUBLIC DEFINITIONS -- these will be persistent outside this closure.

    q = {

        iterate:    iterate,
        map:        map,
        reduce:     reduce,
        compose:    compose,

        sum:        sum,
        mean:       mean,
        variance:   variance

    };

})();

//- vim:set syntax=javascript:
