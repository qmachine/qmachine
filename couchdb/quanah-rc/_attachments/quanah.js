//- JavaScript source code

//- quanah.js ~~
//  This is the basic Quanah library, which contructs the "quanah" object that
//  contains basic functions necessary to write programs for Quanah. It also
//  defines the function "quanah.load" which allows the looading of external
//  libraries. It does currently depend on CouchDB in a few places, but I will
//  abstract those dependencies away soon, to allow compatibility with other
//  backends such as NodeJS, Ruby on Rails, or perhaps even the LAMP stack.
//                                                          ~~ SRW, 13 Nov 2010

//- NOTE: Be careful when loading large frameworks like jQuery -- make sure the
//  framework doesn't depend on objects like "window" that won't be available
//  to the Web Worker context!

if (this.quanah === undefined) {
    var quanah = {};
}

if (this.bookmarks === undefined) {
    var bookmarks = {};
}

(function () {

//- "Private" definitions -- these are scoped to the anonymous closure.

    var as_array = function (obj) {
            return Array.prototype.slice.call(obj);
        }, 

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

        jax = {                         //- synchronous XMLHttpRequest wrapper
            get: function (url) {
                var req = new XMLHttpRequest();
                req.open('GET', url, false);
                req.send(null);
                return req.responseText;
            },
            put: function (url, data) {
                data = data || "";
                var req = new XMLHttpRequest();
                req.open('PUT', url, false);
                req.setRequestHeader("Content-type", "application/json");
                req.send(data);
                return req.responseText;
            }
        },

        environment = (function () {
            if (typeof window === 'object') {
                if (typeof window.console === 'object') {
                    return "has-console";
                } else {
                    return "has-window";
                }
            } else {
                if (typeof importScripts === 'function') {
                    return "is-worker";
                } else {
                    return "unknown";
                }
            }
        })(),

        root = location.href.replace(location.pathname, '/'),
        subs = location.pathname.match(/([^\/]+)\//g),
        db = root + subs[0],
        app = db + subs[1] + subs[2],

        stdout = [],
        stderr = [];

//- "Public" definitions -- these will persist outside the anonymous closure.
//  These functions DO currently depend on CouchDB, but I am not going to worry
//  about portability to other platforms until I have this working perfectly.

    bookmarks.root = root;
    bookmarks.db = db;
    bookmarks.app = app;

    quanah.print = (function () {
        switch (environment) {
        case "has-console":
            return function () {
                console.log.apply(console, as_array(arguments));
            };
        case "has-window":
            return function () {
                var args = as_array(arguments),
                    sink = document.body,
                    tag = '<div class="tt">';
                sink.innerHTML += (tag + args.join("</div>" + tag) + "</div>");
            };
        case "is-worker":
            return function () {
                stdout = stdout.concat(as_array(arguments));
                return stdout;
            };
        default:
            return function () {};
        }
    })();

    quanah.error = (function () {
        switch (environment) {
        case "has-console":
            return function () {
                console.error.apply(console, as_array(arguments));
            };
        case "has-window":
            return function () {
                var args = as_array(arguments),
                    sink = document.body,
                    tag = '<div class="tt,error">';
                sink.innerHTML += (tag + args.join("</div>" + tag) + "</div>");
            };
        case "is-worker":
            return function () {
                stderr = stderr.concat(as_array(arguments));
                return stderr;
            };
        default:
            return function () {};
        }
    })();

    quanah.reset = function () {
        stdout.length = 0;
        stderr.length = 0;
    };

    quanah.read = function (x) {
        switch (x.constructor) {
        case String:                    //  treat x as a URL
            return jax.get(x);
        case Object:                    //- treat x as a CouchDB document
            return jax.get(db + x._id);
        default:
            throw "'quanah.read' does not support this type.";
        }
    };

    quanah.load = (function () {
        switch (environment) {
        case "has-console":
            return function (x) {
                var s = document.createElement('script');
                s.src = x;
                document.body.appendChild(s);
            };
        case "has-window":
            return function (x) {
                var s = document.createElement('script');
                s.src = x;
                document.body.appendChild(x);
            };
        case "is-worker":
            return function (x) {
                importScripts(x);
            };
        default:
            return function (x) {
                eval(quanah.read(x));
            };
        }
    })();

    quanah.write = function (obj, url) {
        var response;
        if (obj._id === undefined) {
            response = JSON.parse(jax.get(root + "_uuids"));
            obj._id = response.uuids[0];
        }
        url = url || db + obj._id;
        response = JSON.parse(jax.put(url, JSON.stringify(obj)));
        if (response.ok === true) {
            obj._rev = response.rev;
        }
        return obj;
    };

    quanah.toc = function () {},        //- returns HH:MM:SS.SSS since "tic()"

    quanah.tic = function () {          //- returns ms since 01 Jan 1970, 12 AM
        var start_time = new Date(),
            pad = function (value) {
                return (value < 10) ? "0" + value : value;
            },
            toc = function () {      //- returns HH:MM:SS.SSS since "tic()"
                var now = ((new Date()) - start_time) / 1000,
                    hours = Math.floor(now / 3600),
                    minutes = Math.floor((now % 3600) / 60),
                    seconds = (now % 60).toFixed(3);
                return [pad(hours), pad(minutes), pad(seconds)].join(':');
            };
        if (typeof this.toc === 'function') {
            this.toc = toc;
        }
        quanah.toc = toc;
        return start_time;
    };

    quanah.merge = deepcopy;

})();

//- vim:set syntax=javascript:
