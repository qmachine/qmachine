//- JavaScript source code

//- gui.js ~~
//
//  This file contains the web app's interactive elements. I may eventually
//  move to jQuery, but for now this has been sufficient for Quanah's needs.
//
//                                                      ~~ (c) SRW, 02 Nov 2011

(function (global) {
    'use strict';

 // Assertions

    if (global.hasOwnProperty('window') === false) {
        throw new Error('The GUI targets web browsers only.');
    }

 // Private declarations

    var argv, doh, loc, nav, parseArgs, queue, relaunch, silencer, uuid, win;

 // Private definitions

    doh = global.alert;

    loc = global.location;
    nav = global.navigator;

    parseArgs = function () {
     // This function is based in part on parseUri 1.2.2 by Steven Levithan
     // (stevenlevithan.com, MIT License). It treats the 'location.search'
     // value as a set of ampersand-separated Boolean key=value parameters
     // whose keys are valid JS identifiers and whose values are either "true"
     // or "false" (without quotes). The function accepts an object whose own
     // properties will be used to override flags that are already present.
        var argv, i, key, m, opts, uri;
        opts = {
            key: [
                'source', 'protocol', 'authority', 'userInfo', 'user',
                'password', 'host', 'port', 'relative', 'path', 'directory',
                'file', 'query', 'anchor'
            ],
            parser: new RegExp('^(?:([^:\\/?#]+):)?(?:\\/\\/((?:(([^:@' +
                ']*)(?::([^:@]*))?)?@)?([^:\\/?#]*)(?::(\\d*))?))?((('  +
                '(?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'),
            q: {
                name:   'flags',
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            }
        };
        m = opts.parser.exec(global.location.href);
        uri = {};
        for (i = 14; i > 0; i -= 1) {
            uri[opts.key[i]] = m[i] || '';
        }
        uri[opts.q.name] = {};
        uri[opts.key[12]].replace(opts.q.parser, function ($0, $1, $2) {
            if ($1) {
             // These are "explicit coercions" ;-)
                switch ($2) {
                case '':
                    uri[opts.q.name][$1] = true;
                    break;
                case 'false':
                    uri[opts.q.name][$1] = false;
                    break;
                case 'true':
                    uri[opts.q.name][$1] = true;
                    break;
                default:
                    uri[opts.q.name][$1] = decodeURI($2);
                }
            }
        });
     // First, let's compute the "command-line arguments" :-)
        argv = {};
        for (key in uri.flags) {
            if (uri.flags.hasOwnProperty(key)) {
                argv[key] = uri.flags[key];
            }
        }
        return argv;
    };

    relaunch = function (obj) {
        obj = (obj instanceof Object) ? obj : {};
        var key, parameters;
        parameters = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                parameters.push(key + '=' + obj[key]);
            }
        }
        global.location.search = '?' + parameters.join('&');
    };

    silencer = function (evt) {
     // (placeholder)
    };

    uuid = function () {
     // This function generates hexadecimal UUIDs of length 32.
        var x = '';
        while (x.length < 32) {
            x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
        }
        return x;
    };

    win = global.window;

 // Private constructors (n/a)

 // Global definitions

    if (win.hasOwnProperty('applicationCache')) {
     // These work correctly, but they fail to inhibit Chrome's default
     // behavior. Perhaps they are executing at the wrong time?
        win.applicationCache.oncached = silencer;
        win.applicationCache.onchecking = silencer;
        win.applicationCache.ondownloading = silencer;
        win.applicationCache.onerror = silencer;
        win.applicationCache.onnoupdate = silencer;
        win.applicationCache.onobsolete = silencer;
        win.applicationCache.onprogress = silencer;
        win.applicationCache.onupdateready = silencer;
    }

    win.onoffline = win.ononline = function (evt) {
        if (nav.onLine) {
            doh('Your computer is online.');
        } else {
            doh('Your computer is not online.');
        }
    };

 // Invocations

    argv = parseArgs();

    if (argv.hasOwnProperty('token') && (argv.token !== true)) {
        if (window.hasOwnProperty('localStorage')) {
            window.localStorage.setItem('token', argv.token);
        }
    } else {
        if (window.hasOwnProperty('localStorage')) {
            if (window.localStorage.getItem('token') === null) {
                window.localStorage.setItem('token', uuid());
            }
            argv.token = window.localStorage.getItem('token');
        } else {
            argv.token = uuid();
        }
        relaunch(argv);
    }

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
