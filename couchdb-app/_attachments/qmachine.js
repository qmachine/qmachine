//- JavaScript source code

//- qmachine.js ~~
//                                                      ~~ (c) SRW, 17 Feb 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, unparam: true */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

    if (({}).Q.hasOwnProperty('global') === false) {
        throw new Error('Method Q has no "global" property.');
    }

    if (({}).Q.global.hasOwnProperty('navigator') === false) {
     // Exit early if the current environment is not a web browser.
        return;
    }

    if (({}).Q.global.hasOwnProperty('phantom')) {
     // Exit early if running in PhantomJS (http://www.phantomjs.org).
        return;
    }

    if (({}).Q.global.hasOwnProperty('system')) {
     // Exit early if the current environment is a CommonJS implementation that
     // impersonates a browser, such as the Cappuccino JSC version of Narwhal.
        return;
    }

 // Declarations

    var Q, avar, global, isFunction, parseArgs, ply, queue, read, relaunch,
        request, token, when, write;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    global = Q.global;

    isFunction = function (f) {
     // This function returns 'true' only if and only if 'f' is a Function.
     // The second condition is necessary to return 'false' for a RegExp.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    parseArgs = function () {
     // This function is based on "parseUri" by Steven Levithan (MIT license),
     // but I have modified it here because I only care about parsing the
     // query parameters. It treats the 'location.search' value as a set of
     // ampersand-separated Boolean key=value parameters whose keys are valid
     // JS identifiers and whose values are either "true" or "false" (without
     // quotes). The function accepts an object whose own properties will be
     // used to override flags that are already present.
        /*jslint regexp: true */
        var args, i, m, opts, uri;
        args = {};
        opts = {
            key: [
                'source', 'protocol', 'authority', 'userInfo',
                'user', 'password', 'host', 'port', 'relative',
                'path', 'directory', 'file', 'query', 'anchor'
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
     // Now, we'll copy the "command-line arguments" onto our output object.
        ply(uri.flags).by(function (key, val) {
         // Does this function need documentation?
            args[key] = val;
            return;
        });
     // Before exiting, let's make sure that our query parameters match the
     // values shown in the form's options ...
        (function () {
            if (global.hasOwnProperty('document') === false) {
                return;
            }
            var options = {
                volunteer:  global.document.getElementById('volunteer'),
                pulse:      global.document.getElementById('pulse')
            };
            ply(args).by(function (key, val) {
             // This function needs documentation.
                var flag;
                flag = ((options.hasOwnProperty(key)) &&
                        (options[key] !== null) &&
                        (options[key].checked !== undefined) &&
                        (options[key].checked !== val));
                if (flag === true) {
                    options[key].checked = val;
                }
            });
            return;
        }());
     // Finally, we return our object :-)
        return args;
    };

    ply = function () {
     // This function is a generalized "zippered" iterator that also works
     // extremely well for key-value pairs, and it serves as the "fallback"
     // definition for the generic 'Q.ply' method. It is incredibly useful in
     // JavaScript because hash-like objects are so common in that language.
     // It provides access not only to the values of its input arguments, but
     // also to the index at which each set of values was found.
        var args, i, key, obj, n, toc, x;
        args = Array.prototype.slice.call(arguments);
        n = args.length;
        toc = {};
        x = [];
        for (i = 0; i < n; i += 1) {
            if ((args[i] !== null) && (args[i] !== undefined)) {
                obj = args[i].valueOf();
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (toc.hasOwnProperty(key) === false) {
                            toc[key] = x.push([key]) - 1;
                        }
                        x[toc[key]][i + 1] = obj[key];
                    }
                }
            }
        }
        return {
            by: function (f) {
             // This function needs documentation.
                if (isFunction(f) === false) {
                    throw new TypeError('"ply..by" expects a function');
                }
                var i, n;
                n = x.length;
                for (i = 0; i < n; i += 1) {
                    f.apply(this, x[i]);
                }
                return;
            }
        };
    };

    queue = function () {
     // This function needs documentation.
        var y = avar({val: []});
        y.onready = function (evt) {
         // This function needs documentation.
            var req, url;
            req = request();
            url = global.location.protocol + '//' + global.location.host +
                '/db/_changes?filter=qmachine/queue&limit=25&status=waiting&' +
                'token=' + token();
            req.onreadystatechange = function () {
             // This function needs documentation.
                var temp;
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        temp = JSON.parse(req.responseText).results;
                        ply(temp).by(function (key, val) {
                         // This function needs documentation.
                            y.val.push(val.id);
                            return;
                        });
                        return evt.exit();
                    } else {
                        return evt.fail(req.statusText);
                    }
                }
                return;
            };
            req.open('GET', url, true);
            req.send(null);
            return;
        };
        return y;
    };

    read = function (key) {
     // This function needs documentation.
        var y = avar();
        y.onready = function (evt) {
         // This function implements an HTTP GET request.
            var req, url;
            req = request();
            url = global.location.protocol + '//' + global.location.host +
                '/db/_all_docs?key="' + key + '"&include_docs=true';
            req.onreadystatechange = function () {
             // This function needs documentation.
                var temp;
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        temp = JSON.parse(req.responseText).rows[0];
                        if (temp === undefined) {
                            return evt.fail('Remote missing: ' + url);
                        }
                        y.val = temp.doc.$avar;
                        return evt.exit();
                    } else {
                        return evt.fail(req.statusText);
                    }
                }
                return;
            };
            req.open('GET', url, true);
            req.send(null);
            return;
        };
        return y;
    };

    relaunch = function (obj) {
     // This function reloads the current webpage with new query parameters
     // by stringifying its input object, 'obj'.
        var y = [];
        ply(obj).by(function (key, val) {
            y.push(key + '=' + val);
            return;
        });
        global.location.search = y.join('&');
        return;
    };

    request = function () {
     // This function generates a new AJAX request object. I have written it
     // as a separate function so I can handle browser quirks conveniently.
        if (global.location.protocol === 'file:') {
            if (global.hasOwnProperty('ActiveXObject')) {
             // Internet Explorer supports XMLHttpRequest, but that won't work
             // over 'file:', so we'll use an ActiveXObject instead.
                return new global.ActiveXObject('Microsoft.XMLHTTP');
            }
        }
        if (global.hasOwnProperty('XMLHttpRequest')) {
            return new global.XMLHttpRequest();
        }
        if (global.hasOwnProperty('ActiveXObject')) {
            return new global.ActiveXObject('Microsoft.XMLHTTP');
        }
        throw new Error('This browser does not support AJAX.');
    };

    token = function () {
     // This function is mainly a placeholder for more elaborate security
     // measures that we may choose to implement in the future. It needs some
     // more error checking, though ...
        var args, secret;
        args = parseArgs();
        secret = null;
        if (args.hasOwnProperty('token')) {
            if ((typeof args.token === 'string') && (args.token.length > 0)) {
                secret = args.token;
                if (global.hasOwnProperty('localStorage')) {
                    global.localStorage.setItem('QMACHINE_token', secret);
                }
                token = function () {
                    return secret;
                };
                return token();
            }
        }
        if (global.hasOwnProperty('localStorage')) {
            secret = global.localStorage.getItem('QMACHINE_token');
         /*
        } else if (global.hasOwnProperty('moz_indexedDB')) {
         // (placeholder: see http://goo.gl/XArgc)
        } else if (global.hasOwnProperty('webkitIndexedDB')) {
         // (placeholder: see http://goo.gl/XArgc)
        } else if (hOP(global, 'window', 'cookie')) {
         // (placeholder)
        } else {
         // (placeholder)
         */
        }
        args.token = (secret === null) ? Q.uuid() : secret;
        relaunch(args);
        return;
    };

    when = Q.when;

    write = function (key, $val) {
     // This function needs documentation.
     //
     // NOTE: Since 'revision' only exists in this function, how should I pass
     // errors back to the user?
     //
        var revision, y;
        revision = avar({val: undefined});
        y = avar();
        revision.onready = function (evt) {
         // This function reads the revision number from CouchDB in such a way
         // as to avoid 404 errors entirely -- I can't figure out how to keep
         // those from cluttering Chrome's developer console. A more efficient
         // way would use a HEAD request, but efficiency isn't the goal here.
            var req, url;
            req = request();
            url = global.location.protocol + '//' + global.location.host +
                '/db/_all_docs?key="' + key + '"&include_docs=false';
            req.onreadystatechange = function () {
             // This function doesn't fail if the status code returned isn't
             // 200 because we're only interested in getting the revision
             // number. If something really important has failed, it is highly
             // probable that it's going to fail again during the 'when' ;-)
                var temp;
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        temp = JSON.parse(req.responseText).rows[0];
                        if (temp !== undefined) {
                            revision.val = temp.value.rev;
                        }
                    }
                    return evt.exit();
                }
                return;
            };
            req.open('GET', url, true);
            req.send(null);
            return;
        };
        when(revision, y).areready = function (evt) {
         // This function implements an HTTP PUT request.
            /*jslint nomen: true */
            var doc, req, temp, url;
            doc = {
                '_id':  key,
                '_rev': revision.val,
                $avar:  $val,
                token:  token()
            };
            req = request();
            temp = JSON.parse($val).val;
            url = global.location.protocol + '//' + global.location.host +
                '/db/' + key;
            if ((temp !== null) && (temp !== undefined) &&
                    (temp.hasOwnProperty('status'))) {
             // This simplifies Qmachine's 'queue' filter in CouchDB.
                doc.status = temp.status;
            }
            req.onreadystatechange = function () {
             // This function needs documentation.
                if (req.readyState === 4) {
                    if (req.status === 201) {
                        y.val = JSON.parse(req.responseText);
                        return evt.exit();
                    } else {
                        return evt.fail(req.responseText);
                    }
                }
                return;
            };
            req.open('PUT', url, true);
            req.setRequestHeader('Content-type', 'application/json');
            req.send(JSON.stringify(doc));
            return;
        };
        return y;
    };

 // Initialization

    Q.init({
        queue:  queue,
        read:   read,
        write:  write
    });

    token();

 // Browser configuration

    if (global.hasOwnProperty('document')) {
     // This part would probably be cleaner with jQuery ...
        (function () {
            var options = ['volunteer', 'pulse'];
            ply(options).by(function (key, val) {
             // This function is necessary because I need to close inside a
             // loop, which is error-prone without functional iteration.
                var temp = global.document.getElementById(val);
                if (temp !== null) {
                    temp.onclick = function () {
                        var obj = {};
                        obj[val] = this.checked;
                        return relaunch(obj);
                    };
                }
                return;
            });
            return;
        }());
    }

 // Demonstrations

    if (parseArgs().volunteer === true) {
        global.console.log('Thanks for volunteering!');
        (function f() {
         // This function just keeps things moving :-)
            var dt, g, x;
            dt = 1000;
            x = Q.volunteer();
            g = x.onerror;
            x.onerror = function (message) {
             // This function demonstrates that "errors" are not always a big
             // deal, and that Quanah lets you handle errors however you want.
                if ((typeof g === 'function') && (g instanceof Function)) {
                    g(message);
                }
                if (message !== 'Nothing to do ...') {
                    global.console.error(message);
                }
                global.setTimeout(f, dt);
                return;
            };
            x.onready = function (evt) {
             // This function provides instant gratification :-)
                global.console.log('Completed task: ' + x.key);
                global.setTimeout(f, dt);
                return evt.exit();
            };
            if (parseArgs().pulse === true) {
                global.console.log('(pulse)');
            }
            return;
        }());
    } else {
        global.console.log('Run "demo()" for a live example :-)');
        (function f() {
         // This function just keeps things moving :-)
            var x = avar();
            x.onerror = function (message) {
             // I don't how this can possibly go wrong anyway ...
                global.console.error(message);
                global.setTimeout(f, 1000);
                return;
            };
            x.onready = function (evt) {
             // This function runs locally because it closes over 'f' :-)
                global.setTimeout(f, 1000);
                return evt.exit();
            };
            if (parseArgs().pulse === true) {
                global.console.log('(pulse)');
            }
            return;
        }());
    }

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
