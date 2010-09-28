//- JavaScript source code -- browser only

//- Q.js ~~
//  This is a reference implementation for Q, an object that defines the core
//  functionality of Quanah. It is written in the "Good Parts" subset of JS and
//  depends only on constructs guaranteed to be available inside Web Workers.
//                                                          ~~ SRW, 27 Sep 2010

/*jslint
    white: true, onevar: true, undef: true, eqeqeq: true,
    plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true,

    browser: true, devel: true, nomen: false, evil: true
*/

/*members
    call concat console constructor hasOwnProperty href length open parse
    pathname port prototype push replace responseText send setRequestHeader
    slice splice stringify toString

    _id _rev
    as chomp code compose Doc filter find from get io iterate log map
    merge name ok
    put Q read reduce results rev reval run stdout stderr uuids userCtx
    using write
*/

//- The next bit is modeled after Crockford's construction of the JSON object.
//  We create Q only if it doesn't already exist, and we create its methods in
//  a closure to avoid creating global variables.

if (!this.Q) {
    var Q = {};
}

(function () {                          //- Begin giant anonymous closure

//- Begin by augmenting the standard types with a couple of convenient members.

    Object.prototype.as = function (type) {
        if (type === Array) {
            return Array.prototype.slice.call(this);
        }
        return this;
    };

    String.prototype.chomp = function () {
        return this.replace(/(\n|\r)+$/, '');
    };

//- First, we'll define some constants, such as the host and database names.
//  Rewrite rules in CouchDB allow us to ignore the database name, but using
//  port 5984 on couchone.com disables the rewrite handler; then, we detect.

    var root = location.href.replace(location.pathname, '/'),
        db = (function () {
            if (location.port !== "5984") {
                return root + 'db/';
            } else {
                var pattern = /(\/[^\/]+\/).*/;
                return root + location.pathname.replace(pattern, "$1");
            }
        }()),

        curl = {                        //- synchronous XMLHttpRequest wrapper
            get: function (url) {
                var req = new XMLHttpRequest();
                req.open('GET', url, false);
                req.send(null);
                return req.responseText;
            },
            put: function (url, data) {
                var req = new XMLHttpRequest();
                req.open('PUT', url, false);
                req.setRequestHeader("Content-type", "application/json");
                req.send(data);
                return req.responseText;
            }
        },

        author = (function () {
            var source = root + '_session',
                msg = JSON.parse(curl.get(source));
            return msg.userCtx.name;
        }()),

        fresh_id = (function () {       //- Constructor for memoized function
            var ideal = 100,
                source = root + '_uuids?count=' + ideal,
                the_uuids = [],
                refill_uuids = function () {
                    if (the_uuids.length < ideal / 2) {
                        var msg = curl.get(source),     //- AJAX will go here
                            latest = JSON.parse(msg);
                        the_uuids = the_uuids.concat(latest.uuids);
                    }
                };
            refill_uuids();
            return function (n) {       //- the "actual" function
                n = n || 1;
                var temp = the_uuids.splice(0, n);
                refill_uuids();
                return (n === 1) ? temp[0] : temp;
            };
        }()),

        results = {
            stdout: [],
            stderr: []
        },

//- Now, let's define a deep-copy function (JS defaults to shallow-copy).

        deepcopy = function (source, dest) {
            dest = dest || [];
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    dest[i] = source[i];
                    if (typeof source[i] === 'object') {
                        dest[i] = deepcopy(source[i]);
                    }
                }
            }
            return dest;
        },

//- Now, let's define a function that creates objects from literal inputs.

        create = function (obj) {
            obj = obj || {};
            return {
                from: function (def) {
                    def = def || {};
                    return deepcopy(def, obj);
                }
            };
        };

//- Finally, having armed ourselves with a "create" command, we build Q :-)

    create(Q).from({

        iterate: function (x) {         //- returns a "participle" object ;-)
            if (x.constructor !== Array) {
                throw "Error: 'iterate' only operates on arrays.";
            }
            return {
                using: function (func) {//- does not return anything
                    for (var index = 0; index < x.length; index += 1) {
                        func(index);
                    }
                }
            };
        },

        log: function (message) {       //- Quanah's "console.log" equivalent
            results.stdout.push(message);
        },

        map: function (x, f) {          //- returns an array
            var y = [];
            Q.iterate(x).using(function (i) {
                y[i] = f(x[i]);
            });
            return y;
        },

        reduce: function (init, x, f) { //- returns a value
            var y = init;
            Q.iterate(x).using(function (i) {
                y = f(y, x[i]);
            });
            return y;
        },

        filter: function (x, f) {       //- returns an array
            var y = [];
            Q.iterate(x).using(function (i) {
                if (f(x[i]) === true) {
                    y.push(x[i]);
                }
            });
            return y;
        },

        find: function (x, f) {         //- returns an array
            var y = [];
            Q.iterate(x).using(function (i) {
                if (f(x[i]) === true) {
                    y.push(i);
                }
            });
            return y;
        },

        compose: function () {          //- returns a function
            var args = arguments.as(Array),
                identity = function (x) {
                    return x;
                };
            return Q.reduce(identity, args, function (f, g) {
                return function (x) {
                    return f(g(x));
                };
            });
        },

        merge: deepcopy,

        io: {

            read: function (id) {       //- non-AJAX cloud --> client transfer
                var source = db + id,
                    msg = curl.get(source);
                return JSON.parse(msg);
            },

            write: function (obj) {

                if (typeof obj !== 'object') {
                    throw 'Error: Argument to "Q.write" must be an object.';
                }

                obj._id = obj._id || fresh_id(1);
                obj.name = author;

                var url = db + obj._id,
                    data = JSON.stringify(obj),
                    msg = curl.put(url, data);
                return JSON.parse(msg);
            }

        },

        run: function (code) {          //- CLEARS RESULTS, then runs inline JS

            results.stdout.length = 0;  //- Sterilize the environment as much
            results.stderr.length = 0;  //  as possible before proceeding.

            try {                       //- Now, use a 'try/catch' statement
                eval(code);             //  to evaluate the user's code and
            } catch (error) {           //  catch the exceptions for debugging.
                results.stderr.push(error);
            }
            return results;
        },

        Doc: function (obj) {           //- constructor for new CouchDB docs
            obj = obj || {};
            obj._id = obj._id || fresh_id(1);
            obj.name = author;
            var msg = Q.io.write(obj);

            if (msg.ok === 'false') {
                throw msg;
            }

            obj._rev = msg.rev;
            return obj;
        },

        reval: function (func, argarray) {
            argarray = argarray || [];
            var dQ = new Q.Doc(),
                id = dQ._id;
            dQ.code = '(' + func.toString() + ').apply(this, ' +
                JSON.stringify(argarray) + ')';
            Q.io.write(dQ);
            if (typeof this.console !== undefined) {
                console.log('Waiting for response ...');
            }
            while (!dQ.results) {
                dQ = Q.io.read(id);
            }
            if (typeof this.console !== undefined) {
                Q.iterate(dQ.results.stdout).using(function (i) {
                    console.log(dQ.results.stdout[i]);
                });       
            }
            return dQ.results.stdout;
        }

    });

    if (this.console) {
        console.log("Welcome to Quanah :-)");
    }

}());                                   //- End of giant anonymous closure

//- vim:set syntax=javascript:
