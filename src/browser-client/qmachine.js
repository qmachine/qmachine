//- JavaScript source code

//- qmachine.js ~~
//                                                      ~~ (c) SRW, 15 Nov 2012
//                                                  ~~ last updated 23 Nov 2012

(function (global, sandbox) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (global.hasOwnProperty('QM')) {
     // Exit early if QMachine is already present.
        return;
    }

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var ajax, atob, AVar, avar, btoa, can_run_remotely, copy, deserialize,
        in_a_browser, in_a_WebWorker, is_closed, is_online, is_Function,
        is_RegExp, jobs, lib, load_data, load_script, map, mothership, origin,
        ply, read, recent, reduce, run_remotely, serialize, state, submit,
        update_local, update_remote, volunteer, when, write;

 // Definitions

    ajax = function (method, url, body) {
     // This function needs documentation.
        var y = avar();
        y.Q(function (evt) {
         // This function needs documentation of a more general form ...
            if ((body !== undefined) && (body.length > 1048576)) {
             // If it's certain to fail, why not just fail preemptively?
                return evt.fail('Upload size is too large.');
            }
            if (recent(method, url)) {
             // If we have already issued this request recently, we need to
             // wait a minute before doing it again to avoid hammering the
             // server needlessly.
                return evt.stay('Enforcing refractory period ...');
            }
            var request;
         // As of Chrome 21 (and maybe sooner than that), Web Workers do have
         // the `XMLHttpRequest` constructor, but it isn't one of `global`'s
         // own properties as it is in Firefox 15.01 or Safari 6. In Safari 6,
         // however, `XMLHttpRequest` has type 'object' rather than 'function',
         // which makes _zero_ sense to me right now. Thus, my test is _not_
         // intuitive in the slightest ...
            if (global.XMLHttpRequest instanceof Object) {
                request = new global.XMLHttpRequest();
                if (origin() !== mothership) {
                 // This is a slightly weaker test than using `hasOwnProperty`,
                 // but it may work better with Firefox. I'll test in a minute.
                    if (request.withCredentials === undefined) {
                        if (global.hasOwnProperty('XDomainRequest')) {
                            request = new global.XDomainRequest();
                        } else {
                            return evt.fail('Browser does not support CORS.');
                        }
                    }
                }
            } else if (global.hasOwnProperty('ActiveXObject')) {
                request = new global.ActiveXObject('Microsoft.XMLHTTP');
            } else {
                return evt.fail('Browser does not support AJAX.');
            }
            request.onreadystatechange = function () {
             // This function needs documentation.
                if (request.readyState === 4) {
                    if (request.status === 502) {
                     // These are internal server errors that were occurring
                     // in early "full-stack" versions of QMachine due to a
                     // small error in a Monit script. I've left this arm in
                     // here just in case something silly like that happens
                     // again so that the client keeps trying to connect if
                     // the error is due to a temporary snag on the server.
                        return evt.stay('Internal server error?');
                    }
                    y.val = request.responseText;
                    if (((method === 'GET') && (request.status !== 200)) ||
                            ((method === 'POST') && (request.status !== 201))) {
                     // Something else went wrong, and we can't ignore it.
                        return evt.fail(request.status);
                    }
                    return evt.exit();
                }
                return;
            };
            request.open(method, url, true);
            request.send(body);
            return;
        });
        return y;
    };

    atob = function (x) {
     // This function redefines itself during its first invocation.
        if (is_Function(global.atob)) {
            atob = global.atob;
        } else {
            atob = function (x) {
             // This function decodes a string which has been encoded using
             // base64 encoding. It isn't part of JavaScript or any standard,
             // but it _is_ a DOM Level 0 method, and it is extremely useful
             // to have around. Unfortunately, it isn't available in Node.js,
             // the Web Worker contexts of Chrome 21 or Safari 6, or common
             // server-side developer shells like Spidermonkey, D8 / V8, or
             // JavaScriptCore.
                /*jslint bitwise: true */
                var a, ch1, ch2, ch3, en1, en2, en3, en4, i, n, y;
                n = x.length;
                y = '';
                if (n > 0) {
                    a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg' +
                        'hijklmnopqrstuvwxyz0123456789+/=';
                 // NOTE: This `for` loop may actually require sequentiality
                 // as currently written. I converted it from a `do..while`
                 // implementation, but I will write it as a `map` soon :-)
                    for (i = 0; i < n; i += 4) {
                     // Surprisingly, my own tests have shown that it is faster
                     // to use the `charAt` method than to use array indices,
                     // as of 19 Aug 2012. I _do_ know that `charAt` has better
                     // support in old browsers, but that doesn't matter much
                     // because Quanah currently requires ES5 support anyway.
                        en1 = a.indexOf(x.charAt(i));
                        en2 = a.indexOf(x.charAt(i + 1));
                        en3 = a.indexOf(x.charAt(i + 2));
                        en4 = a.indexOf(x.charAt(i + 3));
                        if ((en1 < 0) || (en2 < 0) || (en3 < 0) || (en4 < 0)) {
                         // It also surprised me to find out that testing for
                         // invalid characters inside the loop is faster than
                         // validating with a regular expression beforehand.
                            throw new Error('Invalid base64 characters: ' + x);
                        }
                        ch1 = ((en1 << 2) | (en2 >> 4));
                        ch2 = (((en2 & 15) << 4) | (en3 >> 2));
                        ch3 = (((en3 & 3) << 6) | en4);
                        y += String.fromCharCode(ch1);
                        if (en3 !== 64) {
                            y += String.fromCharCode(ch2);
                        }
                        if (en4 !== 64) {
                            y += String.fromCharCode(ch3);
                        }
                    }
                }
                return y;
            };
        }
        return atob(x);
    };

    AVar = Object.prototype.Q.avar().constructor;

    avar = Object.prototype.Q.avar;

    btoa = function (x) {
     // This function redefines itself during its first invocation.
        if (is_Function(global.btoa)) {
            btoa = global.btoa;
        } else {
            btoa = function (x) {
             // This function encodes binary data into a base64 string. It
             // isn't part of JavaScript or any standard, but it _is_ a DOM
             // Level 0 method, and it is extremely useful to have around.
             // Unfortunately, it isn't available in Node.js, the Web Worker
             // contexts of Chrome 21 or Safari 6, or common server-side
             // developer shells like Spidermonkey, D8 / V8, or JavaScriptCore.
             // Also, it throws an error in most (?) browsers if you feed
             // it Unicode --> http://goo.gl/3fLFs.
                /*jslint bitwise: true */
                var a, ch1, ch2, ch3, en1, en2, en3, en4, i, n, y;
                n = x.length;
                y = '';
                if (n > 0) {
                    a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg' +
                        'hijklmnopqrstuvwxyz0123456789+/=';
                 // NOTE: This `for` loop may actually require sequentiality
                 // as currently written. I converted it from a `do..while`
                 // implementation, but I will write it as a `map` soon :-)
                    for (i = 0; i < n; i += 3) {
                        ch1 = x.charCodeAt(i);
                        ch2 = x.charCodeAt(i + 1);
                        ch3 = x.charCodeAt(i + 2);
                        en1 = (ch1 >> 2);
                        en2 = (((ch1 & 3) << 4) | (ch2 >> 4));
                        en3 = (((ch2 & 15) << 2) | (ch3 >> 6));
                        en4 = (ch3 & 63);
                        if (isNaN(ch2)) {
                            en3 = en4 = 64;
                        } else if (isNaN(ch3)) {
                            en4 = 64;
                        }
                        y += (a.charAt(en1) + a.charAt(en2) + a.charAt(en3) +
                            a.charAt(en4));
                    }
                }
                return y;
            };
        }
        return btoa(x);
    };

    can_run_remotely = function (task) {
     // This function needs documentation.
        return ((global.hasOwnProperty('JSON'))     &&
                (global.hasOwnProperty('JSLINT'))   &&
                (task instanceof Object)            &&
                (task.hasOwnProperty('f'))          &&
                (task.hasOwnProperty('x'))          &&
                (is_Function(task.f))               &&
                (task.x instanceof AVar)            &&
                (is_online())                       &&
                ((is_closed(task)) === false));
    };

    copy = function (x, y) {
     // This function copies the properties of `x` to `y`, specifying `y` as
     // object literal if it was not provided as an input argument. It does
     // not perform a "deep copy", which means that properties whose values
     // are objects will be "copied by reference" rather than by value. Right
     // now, I see no reason to worry about deep copies or getters / setters.
     // Because the current version of Quanah no longer uses ECMAScript 5.1
     // features to make the `comm` method non-enumerable, however, we do have
     // to be careful not to overwrite the `y.comm` method if `y` is an avar.
        if (y === undefined) {
         // At one point, I used a test here that `arguments.length === 1`,
         // but it offended JSLint:
         //     "Do not mutate parameter 'y' when using 'arguments'."
            y = {};
        }
        var comm, key;
        if (y instanceof AVar) {
            comm = y.comm;
        }
        for (key in x) {
            if (x.hasOwnProperty(key)) {
                y[key] = x[key];
            }
        }
        if (is_Function(comm)) {
            y.comm = comm;
        }
        return y;
    };

    deserialize = function ($x) {
     // This function is a JSON-based deserialization utility that can invert
     // the `serialize` function provided herein. Unfortunately, no `fromJSON`
     // equivalent exists for obvious reasons -- it would have to be a String
     // prototype method, and it would have to be extensible for all types.
     // NOTE: This definition could stand to be optimized, but I recommend
     // leaving it as-is until improving performance is absolutely critical.
        /*jslint unparam: true */
        return JSON.parse($x, function reviver(key, val) {
         // This function is provided to `JSON.parse` as the optional second
         // parameter that its documentation refers to as a `reviver` function.
         // NOTE: This is _not_ the same as Quanah's `revive`!
            var f, re;
            re = /^\[(FUNCTION|REGEXP) ([A-z0-9\+\/\=]+) ([A-z0-9\+\/\=]+)\]$/;
         // Is the second condition even reachable in the line below?
            if ((typeof val === 'string') || (val instanceof String)) {
                if (re.test(val)) {
                    val.replace(re, function ($0, type, code, props) {
                     // This function is provided to the String prototype's
                     // `replace` method and uses references to the enclosing
                     // scope to return results. I wrote things this way in
                     // order to avoid changing the type of `val` and thereby
                     // confusing the JIT compilers, but I'm not certain that
                     // using nested closures is any faster anyway. For that
                     // matter, calling the regular expression twice may be
                     // slower than calling it once and processing its output
                     // conditionally, and that way might be clearer, too ...
                        f = sandbox(atob(code));
                        copy(deserialize(atob(props)), f);
                        return;
                    });
                }
            }
            return (f !== undefined) ? f : val;
        });
    };

    in_a_browser = function () {
     // This function needs documentation.
        return ((global.hasOwnProperty('location'))             &&
                (global.hasOwnProperty('navigator'))            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    in_a_WebWorker = function () {
     // This function needs documentation.
        return ((is_Function(global.importScripts))             &&
                (global.location instanceof Object)             &&
                (global.navigator instanceof Object)            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    is_closed = function (x, options) {
     // This function tests an input argument `x` for references that "close"
     // over external references from another scope. This function solves a
     // very important problem in JavaScript because function serialization is
     // extremely difficult to perform rigorously. Most programmers consider a
     // function only as its source code representation, but because it is also
     // a closure and JavaScript has lexical scope, the exact "place" in the
     // code where the code existed is important, too. A third consideration is
     // that a function is also an object which can have methods and properties
     // of its own, and these need to be included in the serializated form. I
     // puzzled over this problem and eventually concluded that because I may
     // not be able to serialize an entire scope (I haven't solved that yet), I
     // _can_ get the source code representation of a function from within most
     // JavaScript implementations even though it isn't part of the ECMAScript
     // standard (June 2011). Thus, if a static analysis tool were able to
     // parse the source code representation to confirm that the function did
     // not depend on its scope, then I might be able to serialize it, provided
     // that it did not contain any methods that depended on their scopes. Of
     // course, writing such a tool is a huge undertaking, so instead I just
     // used a fantastic program by Douglas Crockford, JSLINT, which contains
     // an expertly-written parser with configurable parameters. A bonus here
     // is that JSLINT allows me to avoid a number of other unsavory problems,
     // such as functions that log messages to a console -- such functions may
     // or may not be serializable, but their executions should definitely
     // occur on the same machines that invoked them! Anyway, this function is
     // only one solution to the serialization problem, and I welcome feedback
     // from others who may have battled the same problems :-)
        /*jslint unparam: true */
        if ((options instanceof Object) === false) {
            options = {};
        }
        var comm, $f, flag, left, right;
        if (x instanceof AVar) {
         // We'll put this back later.
            comm = x.comm;
            delete x.comm;
        }
        flag = false;
        left = '(function () {\nreturn ';
        right = ';\n}());';
        if (x instanceof Object) {
            if (is_Function(x)) {
                if (is_Function(x.toJSON)) {
                    $f = x.toJSON();
                } else if (is_Function(x.toSource)) {
                    $f = x.toSource();
                } else if (is_Function(x.toString)) {
                    $f = x.toString();
                } else {
                 // If we fall this far, we're probably in trouble anyway, but
                 // we aren't out of options yet. We could try to coerce to a
                 // string by adding an empty string or calling the String
                 // constructor without the `new` keyword, but I'm not sure if
                 // either would cause Quanah itself to fail JSLINT. Of course,
                 // we can always just play it safe and return `true` early to
                 // induce local execution of the function -- let's do that!
                    return true;
                }
             // By this point, `$f` must be defined, and it must be a string
             // or else the next line will fail when we try to remove leading
             // and trailing parentheses in order to appease JSLINT.
                $f = left + $f.replace(/^[(]|[)]$/g, '') + right;
             // Now, we send our function's serialized form `$f` into JSLINT
             // for analysis, taking care to disable all options that are not
             // directly relevant to determining if the function is suitable
             // for running in some remote JavaScript environment. If JSLINT
             // returns `false` because the scan fails for some reason, the
             // answer to our question would be `true`, which is why we have
             // to negate JSLINT's output.
                flag = (false === global.JSLINT($f, copy(options.allow, {
                 // JSLINT configuration options, as of version 2012-07-27:
                    'adsafe':   false,  //- enforce ADsafe rules?
                    'anon':     true,   //- allow `function()`?
                    'bitwise':  true,   //- allow use of bitwise operators?
                    'browser':  false,  //- assume browser as JS environment?
                    'cap':      true,   //- allow uppercase HTML?
                    //confusion:true,   //- allow inconsistent type usage?
                    'continue': true,   //- allow continuation statement?
                    'css':      false,  //- allow CSS workarounds?
                    'debug':    false,  //- allow debugger statements?
                    'devel':    false,  //- allow output logging?
                    'eqeq':     true,   //- allow `==` instead of `===`?
                    'es5':      true,   //- allow ECMAScript 5 syntax?
                    'evil':     false,  //- allow the `eval` statement?
                    'forin':    true,   //- allow unfiltered `for..in`?
                    'fragment': false,  //- allow HTML fragments?
                    //'indent': 4,
                    //'maxerr': 50,
                    //'maxlen': 80,
                    'newcap':   true,   //- constructors must be capitalized?
                    'node':     false,  //- assume Node.js as JS environment?
                    'nomen':    true,   //- allow names' dangling underscores?
                    'on':       false,  //- allow HTML event handlers
                    'passfail': true,   //- halt the scan on the first error?
                    'plusplus': true,   //- allow `++` and `--` usage?
                    'predef':   {},     //- predefined global variables
                    'properties': false,//- require JSLINT /*properties */?
                    'regexp':   true,   //- allow `.` in regexp literals?
                    'rhino':    false,  //- assume Rhino as JS environment?
                    'safe':     false,  //- enforce safe subset of ADsafe?
                    'sloppy':   true,   //- ES5 strict mode pragma is optional?
                    'stupid':   true,   //- allow `*Sync` calls in Node.js?
                    'sub':      true,   //- allow all forms of subset notation?
                    'todo':     true,   //- allow comments that start with TODO
                    'undef':    false,  //- allow out-of-order definitions?
                    'unparam':  true,   //- allow unused parameters?
                    'vars':     true,   //- allow multiple `var` statements?
                    'white':    true,   //- allow sloppy whitespace?
                    //'widget': false,  //- assume Yahoo widget JS environment?
                    'windows':  false   //- assume Windows OS?
                })));
            }
            ply(x).by(function (key, val) {
             // This function examines all methods and properties of `x`
             // recursively to make sure none of those are closed, either.
             // Because order isn't important, use of `ply` is justified.
                if (flag === false) {
                    flag = is_closed(val, options);
                }
                return;
            });
        }
        if (is_Function(comm)) {
            x.comm = comm;
        }
        return flag;
    };

    is_Function = function (f) {
     // This function needs documentation.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    is_RegExp = function (x) {
     // This function returns `true` if and only if input argument `x` is a
     // regular expression. I haven't been able to break it yet, but perhaps
     // someone out there will let me know of a counterexample?
        return (Object.prototype.toString.call(x) === '[object RegExp]');
    };

    is_online = function () {
     // This function needs documentation.
        return (mothership === 'LOCAL_NODE') || global.navigator.onLine;
    };

    jobs = function (box) {
     // This function needs documentation.
        var y = ajax('GET', mothership + '/box/' + box + '?status=waiting');
        return y.Q(function (evt) {
         // This function needs documentation.
            y.val = JSON.parse(y.val);
            return evt.exit();
        });
    };

    lib = function (url) {
     // This function needs documentation.
        var y = avar();
        if (in_a_WebWorker()) {
            y.Q(function (evt) {
             // This function needs documentation.
                global.importScripts(url);
                return evt.exit();
            });
        } else if (in_a_browser()) {
            y.Q(function (evt) {
             // This function use the conventional "script tag loading"
             // technique to import external libraries. Ideally, it would try
             // to avoid loading libraries it has already loaded, but it turns
             // out that this is a very difficult once JSONP becomes involved
             // because those scripts _do_ need to reload every time. Thus, I
             // will need to start documenting best practices to teach others
             // how to construct idempotent scripts that won't leak memory and
             // plan to begin using "disposable execution contexts" like Web
             // Workers again soon.
             //
             // See also: http://goo.gl/byXCA and http://goo.gl/fUCXa .
             //
                /*jslint browser: true, unparam: true */
                var current, script;
                current = global.document.getElementsByTagName('script');
                script = global.document.createElement('script');
                if (is_Function(script.attachEvent)) {
                    script.attachEvent('onload', function onload() {
                     // This function needs documentation.
                        script.detachEvent('onload', onload);
                        if (script.parentElement === global.document.head) {
                            global.document.head.removeChild(script);
                        } else {
                            global.document.body.removeChild(script);
                        }
                        script = null;
                        return evt.exit();
                    });
                } else {
                    script.addEventListener('load', function onload() {
                     // This function needs documentation.
                        script.removeEventListener('load', onload, false);
                        if (script.parentElement === global.document.head) {
                            global.document.head.removeChild(script);
                        } else {
                            global.document.body.removeChild(script);
                        }
                        script = null;
                        return evt.exit();
                    }, false);
                }
                script.src = url;
                ply(current).by(function (key, val) {
                 // This function needs documentation.
                    if (script.src === val.src) {
                     // Aha! At long last, I have found a practical use for
                     // Cantor's Diagonalization argument :-P
                        script.src += '?';
                    }
                    return;
                });
                if ((global.document.body instanceof Object) === false) {
                    global.document.head.appendChild(script);
                } else {
                    global.document.body.appendChild(script);
                }
                current = null;
                return;
            });
        } else {
            y.Q(function (evt) {
             // This function needs documentation.
                return evt.fail('Missing `lib` definition');
            });
        }
        return y;
    };

    load_data = function (x, callback) {
     // This function is an incredibly rare one in the sense that it accepts
     // `x` which can be either an object literal or a string. Typically, I am
     // too "purist" to write such a _convenient_ function :-P
        var xdm, y, yql;
        xdm = function (evt) {
         // This function needs documentation.
            var proxy, request;
            proxy = global.document.createElement('iframe');
            request = this;
            proxy.src = request.val.via;
            proxy.display = 'none';
            proxy.style.visibility = 'hidden';
            proxy.onload = function () {
             // This function runs when the iframe loads.
                proxy.contentWindow.postMessage(JSON.stringify({
                    x: request.val.url
                }), proxy.src);
                return;
            };
            global.window.addEventListener('message', function cb(dom_evt) {
             // This function needs documentation.
                var temp = JSON.parse(dom_evt.data);
                if (temp.x === request.val.url) {
                    request.val = temp.y;
                    global.window.removeEventListener('message', cb, false);
                    global.document.body.removeChild(proxy);
                    proxy = null;
                    return evt.exit();
                }
                return;
            }, false);
            global.document.body.appendChild(proxy);
            return;
        };
        y = avar((x instanceof AVar) ? x : {val: x});
        yql = function (evt) {
         // This function uses Yahoo Query Language (YQL) as a cross-domain
         // proxy for retrieving text files. Binary file types probably won't
         // work very well at the moment, but I'll tweak the Open Data Table
         // I created soon to see what can be done toward that end.
            var base, callback, diag, format, params, query, temp;
            global.QM.shelf['temp' + y.key] = function (obj) {
             // This function needs documentation.
                if (obj.query.results === null) {
                    return evt.fail(obj.query.diagnostics);
                }
                y.val = obj.query.results.result;
                delete global.QM.shelf['temp' + y.key];
                return evt.exit();
            };
            base = '//query.yahooapis.com/v1/public/yql?';
            diag = 'diagnostics=true';
            callback = 'callback=QM.shelf.temp' + y.key;
            format = 'format=json';
            query = 'q=' +
                'USE "http://wilkinson.github.com/qmachine/qm.proxy.xml";' +
                'SELECT * FROM qm.proxy WHERE url="' + y.val.url + '";';
            temp = lib(base + [callback, diag, format, query].join('&'));
            temp.on('error', function (message) {
             // This function needs documentation.
                return evt.fail(message);
            });
            return;
        };
        y.on('error', function (message) {
         // This function needs documentation.
            if (is_Function(callback)) {
                callback(message, y.val);
            }
            return;
        }).Q(function (evt) {
         // This function needs documentation.
            var flag;
            flag = ((y.val instanceof Object)       &&
                    (y.val.hasOwnProperty('url'))   &&
                    (y.val.hasOwnProperty('via'))   &&
                    (in_a_browser() === true)       &&
                    (is_Function(global.window.postMessage)));
            return (flag) ? xdm.call(y, evt) : yql.call(y, evt);
        }).Q(function (evt) {
         // This function needs documentation.
            if (is_Function(callback)) {
                callback(null, y.val);
            }
            return evt.exit();
        });
        return y;
    };

    load_script = function (url, callback) {
     // This function loads external JavaScript files using the usual callback
     // idioms to which most JavaScripters are accustomed / addicted ;-)
        return lib(url).Q(function (evt) {
         // This function only runs if the script loaded successfully.
            if (is_Function(callback)) {
                callback(null);
            }
            return evt.exit();
        }).on('error', function (message) {
         // This function only runs if the script fails to load.
            if (is_Function(callback)) {
                callback(message);
            }
            return;
        });
    };

    map = function (f) {
     // This function needs documentation.
        var afunc, x;
        x = f;
        afunc = function (evt) {
         // This function needs documentation.
            var y;
            if (this.hasOwnProperty('Q')) {
             // This arm needs documentation.
                y = map.apply(this, this.val).using(f);
            } else {
                y = map(this.val).using(f);
            }
            y.on('error', function (message) {
             // This function needs documentation.
                return evt.fail(message);
            }).Q(function (y_evt) {
             // This function needs documentation.
                y_evt.exit();
                return evt.exit();
            });
            return;
        };
        afunc.using = function (f) {
         // This function needs documentation.
            var y = avar({val: x});
            y.Q(ply(function (key, val) {
             // This function needs documentation.
                y.val[key] = avar({val: {f: f, x: val}}).Q(function (evt) {
                 // This function needs documentation.
                    this.val = this.val.f(this.val.x);
                    return evt.exit();
                });
                return;
            }));
            when.apply(null, [y].concat(y.val)).Q(function (evt) {
             // This function needs documentation.
                ply(y.val).by(function (key, val) {
                 // This function needs documentation.
                    y.val[key] = val.val;
                    return;
                });
                return evt.exit();
            });
            return y;
        };
        return afunc;
    };

    mothership = 'QM_API_URL';

    origin = function () {
     // This function needs documentation.
        return global.location.protocol + '//' + global.location.host;
    };

    ply = function (f) {
     // This function takes advantage of JavaScript's lack of a type system in
     // order to provide a single functional iterator for either synchronous
     // (blocking) or asynchronous (non-blocking) use cases. Both cases use
     // distinct English-inspired idioms to express their operations without
     // requiring configuration flags or type inferences like most libraries
     // would do. Natural languages often rely heavily on context, but they
     // rarely, if ever, require preprocessing or configuration files full of
     // Booleans -- why, then, should a programming language do so? Here, the
     // idioms motivated by `ply` let JavaScript skip the elaborate inferences
     // by taking advantage of the language's _lack_ of a type system, and the
     // resulting code is more concise, expressive, and performant :-)
        var args, y;
        args = Array.prototype.slice.call(arguments);
        y = function (evt) {
         // This function acts as the "asynchronous definition" for the `ply`
         // function, and it will only be invoked if it is used as an input
         // argument to Method Q; otherwise, it simply takes the place of the
         // object literal that would normally be used to enable `by`. If this
         // definition is invoked, then `f` must have been a function, and if
         // it isn't, Quanah's `evt.fail` function will be invoked :-)
         //
         // NOTE: Any time that we know `this` is an avar, we are justified in
         // accessing the `val` property directly; otherwise, I recommend that
         // you use `valueOf()` instead so that generic programming with arrays
         // and objects will still work correctly.
         //
            if (this.hasOwnProperty('Q')) {
             // The avar to which we assigned this function must have been
             // created by the `when` function, which means that its `val`
             // property is an array of avars designed to be used with the
             // Function prototype's `apply` method :-)
                ply.apply(this, this.val).by(f);
            } else {
                ply(this.val).by(f);
            }
            return evt.exit();
        };
        y.by = function (f) {
         // This function is a general-purpose iterator for key-value pairs,
         // and it works exceptionally well in JavaScript because hash-like
         // objects are so common in this language. This definition itself is
         // a little slower than previous versions because they were optimized
         // for internal use. In performance-critical sections of Quanah that
         // run often but rarely change, I have inlined loops as appropriate.
         // It is difficult to optimize code for use with modern JIT compilers,
         // and my own recommendation is to hand-optimize with loops only if
         // you're truly obsessed with performance -- it's a lot of work, and
         // the auto-detecting and delegating dynamically in order to use the
         // fastest possible loop pattern adds overhead that can be difficult
         // to optimize for use in real-world applications. That said, if you
         // have ideas for how to make `ply` run more efficiently, by all means
         // drop me a line! :-)
            if (is_Function(f) === false) {
                throw new TypeError('`ply..by` expects a function.');
            }
            var i, key, obj, n, toc, x;
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
            n = x.length;
            for (i = 0; i < n; i += 1) {
                f.apply(this, x[i]);
            }
            return;
        };
        return y;
    };

    read = function (x) {
     // This function needs documentation.
        var y = ajax('GET', mothership + '/box/' + x.box + '?key=' + x.key);
        return y.Q(function (evt) {
         // This function deserializes the string returned as the `val` of
         // `y` into a temporary variable and then copies its property values
         // back onto `y`.
            copy(deserialize(y.val), y);
            return evt.exit();
        });
    };

    recent = function (method, url) {
     // This function helps keep clients from polling too rapidly when they are
     // waiting for a remote task to finish. It keeps track of HTTP requests
     // made within the last 1000 milliseconds in order to prevent repeat calls
     // that use the same method and URL. This doesn't affect task execution by
     // volunteers, however, because those alternate between GETs and POSTs.
        var dt, flag, key, time;
        dt = 1000;
        time = Date.now();
        for (key in state.recent) {
            if (state.recent.hasOwnProperty(key)) {
                if ((time - state.recent[key].time) > dt) {
                    delete state.recent[key];
                }
            }
        }
        flag = ((state.recent.hasOwnProperty(url)) &&
                (state.recent[url].method === method));
        if (flag === false) {
            state.recent[url] = {
                method: method,
                time:   time
            };
            global.setTimeout(avar().revive, dt + 1);
        }
        return flag;
    };

    reduce = function (f) {
     // This function needs to be recursive, but ... how best to do it?
        var afunc, x;
        x = f;
        afunc = function (evt) {
         // This function needs documentation.
            var x, y;
            x = this;
            if (x.hasOwnProperty('Q')) {
             // This arm needs documentation.
                y = reduce.apply(x, x.val).using(f);
            } else {
                y = reduce(x.val).using(f);
            }
            y.on('error', function (message) {
             // This function needs documentation.
                return evt.fail(message);
            }).Q(function (y_evt) {
             // This function needs documentation.
                if (y.val.length <= 1) {
                    x.val = y.val[0];
                    y_evt.exit();
                    return evt.exit();
                }
                x.val = y.val;
                y_evt.exit();
                return evt.stay('Re-reducing ...');
            });
            return;
        };
        afunc.using = function (f) {
         // This function needs documentation.
            var y = avar({val: x});
            y.Q(function (evt) {
             // This function runs locally because it closes over `x`.
                var i, n, pairs;
                n = x.length;
                pairs = [];
                if ((n % 2) === 1) {
                    pairs.push({y: x[0]});
                }
                for (i = (n % 2); i < n; i += 2) {
                    pairs.push({f: f, x: [x[i], x[i + 1]]});
                }
                y.val = pairs;
                return evt.exit();
            }).Q(map(function (each) {
             // This function needs documentation.
                if (each.hasOwnProperty('y')) {
                    return each.y;
                }
                return each.f(each.x[0], each.x[1]);
            }));
            return y;
        };
        return afunc;
    };

    run_remotely = function (obj) {
     // This function distributes computations to remote execution nodes by
     // constructing a task that represents the computation, writing it to a
     // shared storage, polling for changes to its status, and then reading
     // the new values back into the local variables. My strategy is to use
     // a bunch of temporary avars that only execute locally -- on this part
     // I must be very careful, because remote calls should be able to make
     // remote calls of their own, but execution of a remote call should not
     // require remote calls of its own! A publication is forthcoming, and at
     // that point I'll simply use a self-citation as an explanation :-)
        var f, first, handler, x;
     // Step 1: copy the computation's function and data into fresh instances,
     // define some error handlers, and write the copies to the "filesystem".
     // If special property values have been added to `x`, they will be copied
     // onto `f` and `x` via the "copy constructor" idiom. Note that special
     // properties defined for `f` will be overwritten ...
        f = avar({box: obj.x.box, val: obj.f});
        first = true;
        handler = function (message) {
         // This function tells the original `x` that something has gone awry.
            if (first === true) {
                first = false;
                obj.x.comm({fail: message});
            }
            return;
        };
        x = avar({box: obj.x.box, key: obj.x.key, val: obj.x.val});
        f.on('error', handler).Q(update_remote);
        x.on('error', handler).Q(update_remote);
     // Step 2: Use a `when` statement to represent the remote computation and
     // track its execution status on whatever system is using Quanah.
        when(f, x).Q(function (evt) {
         // This function creates a `task` object to represent the computation
         // and monitors its status by "polling" the "filesystem" for changes.
         // It initializes using `avar`'s "copy constructor" idiom to enable
         // `task` to "inherit" system-specific properties such as QMachine's
         // `box` property automatically. My design here reflects the idea that
         // the execution should follow the data.
            var task = avar({
                box: obj.x.box,
                status: 'waiting',
                val: {
                    f: f.key,
                    x: x.key
                }
            });
            task.on('error', function (message) {
             // This function alerts `f` and `x` that something has gone awry.
                return evt.fail(message);
            }).Q(update_remote).Q(function (evt) {
             // This function polls for changes in the `status` property using
             // a variation on the `update_local` function as a non-blocking
             // `while` loop -- hooray for disposable avars!
                var temp = read(task);
                temp.on('error', function (message) {
                 // This alerts `task` that something has gone awry.
                    return evt.fail(message);
                }).Q(function (temp_evt) {
                 // This function analyzes the results of the `read` operation
                 // to determine if the `task` computation is ready to proceed.
                    switch (temp.status) {
                    case 'done':
                        task.val = temp.val;
                        evt.exit();
                        break;
                    case 'failed':
                        evt.fail(temp.val.epitaph);
                        break;
                    default:
                        evt.stay('Waiting for results ...');
                    }
                    return temp_evt.exit();
                });
                return;
            }).Q(function (task_evt) {
             // This function ends the enclosing `when` statement.
                task_evt.exit();
                return evt.exit();
            });
            return;
        });
     // Step 3: Update the local instances of `f` and `x` by retrieving the
     // remote versions' representations. If possible, these operations will
     // run concurrently.
        f.Q(update_local);
        x.Q(update_local);
     // Step 4: Use a `when` statement to wait for the updates in Step 3 to
     // finish before copying the new values into the original `obj` argument.
        when(f, x).Q(function (evt) {
         // This function copies the new values into the old object. Please
         // note that we cannot simply write `obj.foo = foo` because we would
         // lose the original avar's internal state!
            obj.f = f.val;
            obj.x.val = x.val;
            obj.x.comm({done: []});
            return evt.exit();
        });
        return;
    };

    serialize = function (x) {
     // This function extends the standard `JSON.stringify` function with
     // support for functions and regular expressions. One of the problems I
     // address here is that the ES5.1 standard doesn't dictate a format for
     // representing functions as strings (see section 15.3.4.2). Another
     // problem is that the standard dictates that _no_ representation be given
     // at all in certain situations (see section 15.3.4.5). Fortunately, we
     // can avoid a lot of these situations entirely by using JSLint prior to
     // invoking the `serialize` function, but it isn't a perfect solution,
     // since users can currently invoke this function indirectly by calling
     // `JSON.stringify`. Also, this function depends on `btoa`, which may or
     // may not have issues with UTF-8 strings in different browsers. I have
     // not found a test case yet that proves I need to work around the issue,
     // but if I do, I will follow advice given at http://goo.gl/cciXV.
        /*jslint unparam: true */
        var comm, y;
        if (x instanceof AVar) {
            comm = x.comm;
            delete x.comm;
        }
        y = JSON.stringify(x, function replacer(key, val) {
         // For more information on the use of `replacer` functions with the
         // `JSON.stringify` method, read the [inline] documentation for the
         // reference implementation, "json2.js", available online at
         // https://raw.github.com/douglascrockford/JSON-js/master/json2.js.
            var obj, $val;
            if (is_Function(val)) {
             // If the input argument `x` was actually a function, we have to
             // perform two steps to serialize the function because functions
             // are objects in JavaScript. The first step is to consider the
             // function as only its "action", represented as the source code
             // of the original function. The second step is to consider the
             // function as only an object with its own methods and properties
             // that must be preserved as source code also. (We can assume that
             // scope need not be preserved because `serialize` is only called
             // when `is_closed` returns `false`.)
                obj = {};
                $val = '[FUNCTION ';
                if (is_Function(val.toJSON)) {
                    $val += btoa(val.toJSON());
                } else if (is_Function(val.toSource)) {
                    $val += btoa(val.toSource());
                } else if (is_Function(val.toString)) {
                    $val += btoa(val.toString());
                } else {
                 // Here, we just hope for the best. This arm shouldn't ever
                 // run, actually, since we've likely already caught problems
                 // that would land here in the `is_closed` function.
                    $val += btoa(val);
                }
                ply(val).by(function f(key, val) {
                 // This function copies methods and properties from the
                 // function stored in `val` onto an object `obj` so they can
                 // be serialized separately from the function itself, but it
                 // only transfers the ones a function wouldn't normally have,
                 // using this function (`f`) itself as a reference. Because
                 // order isn't important, the use of `ply` is justified here.
                    if (f.hasOwnProperty(key) === false) {
                        obj[key] = val;
                    }
                    return;
                });
             // Now, we use recursion to serialize the methods and properties.
                $val += (' ' + btoa(serialize(obj)) + ']');
            } else if (is_RegExp(val)) {
             // Using a similar approach as for functions for almost exactly
             // the same reasons as for functions, we will now try to serialize
             // regular expressions.
                obj = {};
                $val = '[REGEXP ';
                if (val.hasOwnProperty('source')) {
                    $val += btoa([
                     // For now, I am ignoring the non-standard `y` ("sticky")
                     // flag until I confirm that it won't confuse browsers
                     // that don't support it.
                        '/', val.source, '/',
                        ((val.global === true) ? 'g' : ''),
                        ((val.ignoreCase === true) ? 'i' : ''),
                        ((val.multiline === true) ? 'm' : '')
                    ].join(''));
                } else if (is_Function(val.toJSON)) {
                    $val += btoa(val.toJSON());
                } else if (is_Function(val.toSource)) {
                    $val += btoa(val.toSource());
                } else if (is_Function(val.toString)) {
                    $val += btoa(val.toString());
                } else {
                 // Here, we just hope for the best. This arm shouldn't ever
                 // run, actually, since we've likely already caught problems
                 // that would land here in the `is_closed` function.
                    $val += btoa(val);
                }
                ply(val, /^$/).by(function f(key, val, standard) {
                 // This function copies methods and properties from the
                 // regular expression stored in the outer `val` onto an object
                 // `obj` so they can be serialized separately from the regular
                 // expression itself, but it only transfers the ones a regular
                 // expression wouldn't normally have. Because order isn't
                 // important, the use of `ply` is justified here.
                    if ((standard === undefined) && (val !== undefined)) {
                        obj[key] = val;
                    }
                    return;
                });
             // Now, we use recursion to serialize the methods and properties.
                $val += (' ' + btoa(serialize(obj)) + ']');
            }
            return ($val === undefined) ? val : $val;
        });
        if (is_Function(comm)) {
            x.comm = comm;
        }
        return y;
    };

    state = {
        box: avar().key,
        recent: {}
    };

    submit = function (x, f, box, env) {
     // This function needs documentation.
        var arg_box, arg_env, arg_f, arg_x, y;
        if (arguments.length === 1) {
         // Assume here that the input argument is an object with properties
         // corresponding to the four variables. Although this is my preferred
         // syntax, it is not the default because this function is not intended
         // for users like me -- it's the "training wheels" introduction to QM.
            arg_box = x.box;
            arg_env = x.env;
            arg_f = x.f;
            arg_x = x.x;
        } else {
            arg_box = box;
            arg_env = env;
            arg_f = f;
            arg_x = x;
        }
        y = avar();
        when(arg_box, arg_env, arg_f, arg_x, y).Q(function (evt) {
         // This function needs documentation.
            y.box = (arg_box instanceof AVar) ? arg_box.val : arg_box;
            y.val = {
                env: ((arg_env instanceof AVar) ? arg_env.val : arg_env),
                f: ((arg_f instanceof AVar) ? arg_f.val : arg_f),
                x: ((arg_x instanceof AVar) ? arg_x.val : arg_x)
            };
            return evt.exit();
        });
        y.Q(function (evt) {
         // This function runs locally because it closes over `is_closed` and
         // `global.JSLINT`.
            var key, options, task;
            options = {
                predef: {
                    'QM': false
                }
            };
            task = {
                f: y.val.f,
                x: y.val.x
            };
            for (key in y.val.env) {
                if (y.val.env.hasOwnProperty(key)) {
                    options.predef[key] = false;
                }
            }
            if (is_closed(task, options) === false) {
                return evt.fail(global.JSLINT.errors);
            }
            return evt.exit();
        }).Q(function (evt) {
         // This function validates the input and closes over `avar` and `y`
         // to induce local execution on the submitter's own machine.
            var obj, temp;
            obj = this.val;
            if ((obj instanceof Object) === false) {
                return evt.fail('Input argument must be an object.');
            }
            if (obj.hasOwnProperty('f') === false) {
                return evt.fail('`f` property is missing.');
            }
            if (obj.hasOwnProperty('x') === false) {
                return evt.fail('`x` property is missing.');
            }
            temp = avar({box: y.box, val: obj});
            temp.on('error', function (message) {
             // This function needs documentation.
                return evt.fail(message);
            });
            temp.Q(function (evt) {
             // This function runs remotely on a volunteer's machine because
             // `QM` is always excepted from JSLint scrutiny.
                /*global QM: false */
                var env, f, handler, temp, x;
             // NOTE: Still need to load all scripts specified in `env` ...
                env = QM.avar({val: this.val.env});
                f = this.val.f;
                handler = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                temp = this;
                x = QM.avar({val: this.val.x});
                env.on('error', handler);
                x.on('error', handler);
                QM.when(env, x).Q(function (evt) {
                 // This function ensures that the task will not execute until
                 // the prerequisite scripts have finished loading.
                    var prereqs = [];
                    QM.ply(env.val).by(function (key, val) {
                     // This function uses a `for` loop because order matters.
                        var libs = QM.avar({val: val.slice()});
                        libs.on('error', function (message) {
                         // This function needs documentation.
                            return evt.fail(message);
                        }).Q(function (evt) {
                         // This function needs documentation.
                            if (libs.val.length === 0) {
                                return evt.exit();
                            }
                            var v = libs.val;
                            QM.load_script(v.shift()).Q(function (v_evt) {
                             // This function needs documentation.
                                v_evt.exit();
                                if (v.length === 0) {
                                 // This shaves off an extra step, but I'm not
                                 // sure if it's worth the extra lines ...
                                    return evt.exit();
                                }
                                return evt.stay('Recursing ...');
                            }).on('error', function (message) {
                             // This function needs documentation.
                                return evt.fail(message);
                            });
                            return;
                        });
                        prereqs.push(libs);
                        return;
                    });
                    QM.when.apply(null, prereqs).Q(function (w_evt) {
                     // This function needs documentation.
                        w_evt.exit();
                        return evt.exit();
                    });
                    return;
                });
                x.Q(f).Q(function (x_evt) {
                 // This function needs documentation.
                    temp.val = x.val;
                    x_evt.exit();
                    return evt.exit();
                });
                return;
            }).Q(function (temp_evt) {
             // This function needs documentation.
                y.val = temp.val;
                temp_evt.exit();
                return evt.exit();
            });
            return;
        });
        return y;
    };

    update_local = function (evt) {
     // This function is used in the `run_remotely` and `volunteer` functions
     // to update the local copy of an avar so that its `val` property matches
     // the one from its remote representation. It is written as a function of
     // `evt` because it is intended to be used as an argument to Method Q.
        var local = this;
        read(local).Q(function (temp_evt) {
         // This function copies the remote representation's property values
         // onto `local`. Note that the `copy` function does not copy `comm`
         // from `this` to `local` because `evt.exit` wouldn't work anymore.
            copy(this, local);
            temp_evt.exit();
            return evt.exit();
        }).on('error', function (message) {
         // This function tells `local` that something has gone awry.
            return evt.fail(message);
        });
        return;
    };

    update_remote = function (evt) {
     // This function is used in the `remote_call` and `volunteer` functions
     // to update the remote copy of an avar so that its `val` property matches
     // the one from its local representation. It is written as a function of
     // `evt` because it is intended to be used as an argument to Method Q.
        write(this).Q(function (temp_evt) {
         // This function just releases execution for the local avar (`this`).
            temp_evt.exit();
            return evt.exit();
        }).on('error', function (message) {
         // This function tells the local avar that something has gone awry.
            return evt.fail(message);
        });
        return;
    };

    volunteer = function (box) {
     // This function, combined with `run_remotely`, provides the remote code
     // execution mechanism in Quanah. When `run_remotely` on one machine sends
     // a serialized task to another machine, that other machine runs it with
     // the `volunteer` function. This function outputs the avar representing
     // the task so that the underlying system (QM, in this case) can control
     // system resources itself. Examples will be included in the distribution
     // that will accompany the upcoming publication(s).
        if (box === undefined) {
            box = global.QM.box;
        }
        var task = avar({box: box});
        task.Q(function (evt) {
         // This function retrieves the key of a task from the queue so we
         // can retrieve that task's full description. If no tasks are found,
         // we will simply check back later :-)
            var temp = jobs(box);
            temp.on('error', function (message) {
             // This function notifies `task` that something has gone wrong
             // during retrieval and interpretation of its description.
                return evt.fail(message);
            }).Q(function (temp_evt) {
             // This function chooses a task from the queue and runs it.
                var queue = temp.val;
                if ((queue instanceof Array) === false) {
                 // This seems like a common problem that will occur whenever
                 // users begin implementing custom storage mechanisms.
                    return temp_evt.fail('`jobs` should return an array');
                }
                if (queue.length === 0) {
                 // Here, we choose to `fail` not because this is a dreadful
                 // occurrence or something, but because this decision allows
                 // us to avoid running subsequent functions whose assumptions
                 // depend precisely on having found a task to run. If we were
                 // instead to `stay` and wait for something to do, it would
                 // be much harder to tune Quanah externally.
                    return temp_evt.fail('Nothing to do ...');
                }
             // Here, we grab a random entry from the queue, rather than the
             // first element in the queue. Why? Well, recall that tasks cannot
             // enter the "global" queue until the avars they will transform
             // are ready; this immediately implies that no task in the remote
             // queue can ever run out of order anyway. Unfortunately, without
             // fancy server-side transactional logic, workers can potentially
             // execute the same job redundantly, especially when there are a
             // large number of workers and a small number of jobs. This isn't
             // a big deal for an opportunistic system, and it may even be a
             // desirable "inefficiency" because it means the invoking machine
             // will get an answer faster. In some cases, though, such as for
             // batch jobs that take roughly the same amount of time to run, we
             // need to "jitter" the queue a little to avoid deadlock.
                task.key = queue[Math.floor(Math.random() * queue.length)];
                temp_evt.exit();
                return evt.exit();
            });
            return;
        }).Q(function (evt) {
         // This is just for debugging purposes ...
            update_local.call(this, evt);
            return;
        }).Q(function (evt) {
         // This function changes the `status` property of the local `task`
         // object we just synced from remote; the next step, obviously, is
         // to sync back to remote so that the abstract task will disappear
         // from the "waiting" queue.
            task.status = 'running';
            return evt.exit();
        }).Q(update_remote).Q(function (evt) {
         // This function executes the abstract task by recreating `f` and `x`
         // and running them in the local environment. Since we know `task` is
         // serializable, we cannot simply add its deserialized form to the
         // local machine's queue (`queue`), because `revive` would just send
         // it back out for remote execution again. Thus, we deliberately close
         // over local variables like `avar` in order to restrict execution to
         // the current environment. The transform defined in `task.val.f` is
         // still able to distribute its own sub-tasks for remote execution.
            var f, first, handler, x;
            f = avar({box: box, key: task.val.f});
            first = true;
            handler = function (message) {
             // This function runs if execution of the abstract task fails.
             // The use of a `first` value prevents this function from running
             // more than once, because aside from annoying the programmer by
             // returning lots of error messages on his or her screen, such a
             // situation can also wreak all kinds of havoc for reentrancy.
                var temp_f, temp_x;
                if (message === 409) {
                 // If we get `409` as an error message, it is most likely to
                 // be because the server has already received a result for
                 // this task from some other volunteer and thus that we have
                 // received a `409` HTTP status code for an update conflict.
                    return evt.fail('Results were already submitted.');
                }
                if (first) {
                    first = false;
                    task.val.epitaph = message;
                    task.status = 'failed';
                    temp_f = avar(f).Q(update_remote);
                    temp_x = avar(x).Q(update_remote);
                    when(temp_f, temp_x).Q(function (temp_evt) {
                     // This function runs only when the error messages have
                     // finished syncing to remote storage successfully.
                        temp_evt.exit();
                        return evt.exit();
                    });
                }
                return;
            };
            x = avar({box: box, key: task.val.x});
            f.Q(update_local).on('error', handler);
            x.Q(update_local).on('error', handler);
            when(f, x).Q(function (evt) {
             // This function contains the _actual_ execution. (Boring, huh?)
                f.val.call(x, evt);
                return;
            });
         //
         // Here, I would like to have a function that checks `f` and `x` to
         // using `is_closed` to ensure that the results it returns to the
         // invoking machine are the same as the results it computed, because
         // it _is_ actually possible to write a serializable function which
         // renders itself unserializable during its evaluation. Specifically,
         // if the results are not serializable and we are therefore unable to
         // return an accurate representation of the results, then I want to
         // send a special signal to the invoking machine to let it know that,
         // although no error has occurred, results will not be returned; the
         // invoking machine would then execute the "offending" task itself.
         // I have included a simple outline of such a function:
         //
         //     when(f, x).Q(function (evt) {
         //         if (is_closed(f.val) || is_closed(x.val)) {
         //             return evt.abort('Results will not be returned.');
         //         }
         //         return evt.exit();
         //     });
         //
            f.Q(update_remote);
            x.Q(update_remote);
            when(f, x).Q(function (temp_evt) {
             // This function only executes when the task has successfully
             // executed and the transformed values of `f` and `x` are synced
             // back to remote storage. Thus, we are now free to send the
             // signal for successful completion to the invoking machine by
             // updating the `status` property locally and syncing to remote.
                task.status = 'done';
                temp_evt.exit();
                return evt.exit();
            });
            return;
        }).Q(update_remote);
        return task;
    };

    when = Object.prototype.Q.when;

    write = function (x) {
     // This function sends an HTTP POST to QMachine. It doesn't worry
     // about the return data because QMachine isn't going to return
     // any data -- the request will either succeed or fail, as
     // indicated by the HTTP status code returned. It returns an avar.
        var url = mothership + '/box/' + x.box + '?key=' + x.key;
        return ajax('POST', url, JSON.stringify(x));
    };

 // Prototype definitions

    Object.defineProperty(AVar.prototype, 'box', {
     // This definition adds a `box` property to Quanah's avars as a means to
     // enable QMachine's per-instance queueing system. The other necessary
     // component is the `QM.box` definition a little further down.
        configurable: true,
        enumerable: false,
        get: function () {
         // This function needs documentation.
            return state.box;
        },
        set: function (x) {
         // This function needs documentation.
            if (typeof x !== 'string') {
                throw new TypeError('`box` property must be a string.');
            }
            if ((/^[\w\-]+$/).test(x) === false) {
                throw new Error('Invalid assignment to `box`: "' + x + '"');
            }
            Object.defineProperty(this, 'box', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: x
            });
            return;
        }
    });

    Object.defineProperty(AVar.prototype, 'toJSON', {
     // NOTE: I commented two of the next three lines out because their values
     // are the default ones specified by the ES5.1 standard.
        //configurable: false,
        enumerable: true,
        //writable: false,
        value: function () {
         // This function exists as a way to ensure that `JSON.stringify` can
         // serialize avars correctly, because that function will delegate to
         // an input argument's `toJSON` prototype method if one is available.
            return JSON.parse(serialize(copy(this)));
        }
    });

 // Out-of-scope definitions

    Object.defineProperty(global, 'QM', {
     // This creates the "namespace" for QMachine.
        configurable: false,
        enumerable: true,
        writable: false,
        value: {}
    });

    Object.defineProperty(global.QM, 'box', {
     // Here, we enable users to send jobs to different "boxes" by labeling
     // the avars on a per-case basis, rather than on a session-level basis.
     // More explanation will be included in the upcoming paper :-)
        configurable: false,
        enumerable: true,
        get: function () {
         // This function needs documentation.
            return state.box;
        },
        set: function (x) {
         // This function needs documentation.
            if (typeof x !== 'string') {
                throw new TypeError('`QM.box` must be a string.');
            }
            if ((/^[\w\-]+$/).test(x) === false) {
                throw new Error('Invalid assignment to `QM.box`: "' + x + '"');
            }
            state.box = x;
            global.QM.revive();
            return;
        }
    });

    (function () {
     // Here, we add some static methods to `QM` that make QMachine a little
     // more convenient to use ...
        var template;
        template = {
            avar:           avar,
            lib:            lib,
            load_data:      load_data,
            load_script:    load_script,
            map:            map,
            ply:            ply,
            reduce:         reduce,
            revive:         avar().revive,
            shelf:          {},
            submit:         submit,
            volunteer:      volunteer,
            when:           when
        };
        ply(template).by(function (key, val) {
         // This function needs documentation.
            if (global.QM.hasOwnProperty(key) === false) {
                Object.defineProperty(global.QM, key, {
                 // NOTE: I commented out two of the next three lines
                 // because their values match the ES5.1 default values.
                    //configurable: false,
                    enumerable: true,
                    //writable: false,
                    value: val
                });
            }
            return;
        });
        return;
    }());

 // Invocations

    Object.prototype.Q.def({
        can_run_remotely:   can_run_remotely,
        run_remotely:       run_remotely
    });

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';

 // This strict anonymous closure encapsulates the logic for detecting which
 // object in the environment should be treated as _the_ global object. It's
 // not as easy as you may think -- strict mode disables the `call` method's
 // default behavior of replacing `null` with the global object. Luckily, we
 // can work around that by passing a reference to the enclosing scope as an
 // argument at the same time and testing to see if strict mode has done its
 // deed. This task is not hard in the usual browser context because we know
 // that the global object is `window`, but CommonJS implementations such as
 // RingoJS confound the issue by modifying the scope chain, running scripts
 // in sandboxed contexts, and using identifiers like `global` carelessly ...

    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    /*properties global */

    if (this === null) {

     // Strict mode has captured us, but we already passed a reference :-)

        return (typeof global === 'object') ? global : that;

    }

 // Strict mode isn't supported in this environment, but we need to make sure
 // we don't get fooled by Rhino's `global` function.

    return (typeof this.global === 'object') ? this.global : this;

}, null, this), function ($f) {
    'use strict';

 // This is a sandbox for resuscitating function code safely. I will explain
 // more later ...

    /*jslint evil: true, indent: 4, maxlen: 80 */

    return (new Function('return ' + $f))();

}));

//- vim:set syntax=javascript:
