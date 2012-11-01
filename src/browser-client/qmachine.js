//- JavaScript source code

//- qmachine.js ~~
//                                                      ~~ (c) SRW, 31 Oct 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        ActiveXObject, AVar, Q, QM, XDomainRequest, XMLHttpRequest,
        addEventListener, appendChild, apply, areready, attachEvent, avar,
        body, box, by, call, capture, comm, concat, configurable, constructor,
        contentWindow, createElement, data, def, defineProperty, detachEvent,
        diagnostics, display, document, done, enumerable, env, envs, epitaph,
        exit, f, fail, floor, get, getElementsByTagName, global,
        hasOwnProperty, head, host, importScripts, join, key, length, lib,
        load_data, load_script, location, map, navigator, onerror, onload,
        onready, onreadystatechange, open, parentElement, parse, ply,
        postMessage, predef, protocol, prototype, push, query, random,
        readyState, reduce, remote_call, removeChild, removeEventListener,
        responseText, result, results, retrieve, revive, secret, send, set,
        shelf, shift, slice, splice, src, status, stay, stringify, style,
        submit, test, toString, url, using, val, value, via, visibility,
        volunteer, when, window, withCredentials, writable, x, y
    */

 // Prerequisites

    if (global.hasOwnProperty('QM')) {
     // Exit early if the object already exists.
        return;
    }

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, ajax, AVar, avar, capture, isBrowser, isFunction, isWebWorker, jobs,
        lib, load_data, load_script, map, mothership, origin, ply, predef,
        read, reduce, remote_call, retrieve, shallow_copy, state, submit,
        update_local, update_remote, volunteer, when, write;

 // Definitions

    Q = Object.prototype.Q;

    ajax = function (method, url, body) {
     // This function needs documentation.
        var y = avar();
        y.onready = function (evt) {
         // This function needs documentation of a more general form ...
            var request;
         // As of Chrome 21 (and maybe sooner than that), Web Workers do have
         // the `XMLHttpRequest` constructor, but it isn't one of `global`'s
         // own properties like it is Firefox 15.01 or Safari 6. In Safari 6,
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
        };
        return y;
    };

    AVar = Q.avar().constructor;

    avar = Q.avar;

    capture = function (data) {
     // This function "captures" incoming data by saving a reference to it
     // in `state.shelf`. It is quite useful when combined with JSONP :-)
        state.shelf.push(data);
        return avar().revive();
    };

    isBrowser = function () {
     // This function needs documentation.
        return ((global.hasOwnProperty('location'))             &&
                (global.hasOwnProperty('navigator'))            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    isFunction = function (f) {
     // This function needs documentation.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    isWebWorker = function () {
     // This function needs documentation.
        return ((isFunction(global.importScripts))              &&
                (global.location instanceof Object)             &&
                (global.navigator instanceof Object)            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    jobs = function (box) {
     // This function needs documentation.
        var y = ajax('GET', mothership + '/box/' + box + '?status=waiting');
        y.onready = function (evt) {
         // This function needs documentation.
            y.val = JSON.parse(y.val);
            return evt.exit();
        };
        return y;
    };

    lib = function (url) {
     // This function needs documentation.
        var y = avar();
        if (isWebWorker()) {
            y.onready = function (evt) {
             // This function needs documentation.
                global.importScripts(url);
                return evt.exit();
            };
        } else if (isBrowser()) {
            y.onready = function (evt) {
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
                if (isFunction(script.attachEvent)) {
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
            };
        } else {
            y.onready = function (evt) {
             // This function needs documentation.
                return evt.fail('Missing "lib" definition');
            };
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
            temp.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            return;
        };
        y.onerror = function (message) {
         // This function needs documentation.
            if (isFunction(callback)) {
                callback(message, y.val);
            }
            return;
        };
        y.onready = function (evt) {
         // This function needs documentation.
            var flag;
            flag = ((y.val instanceof Object)       &&
                    (y.val.hasOwnProperty('url'))   &&
                    (y.val.hasOwnProperty('via'))   &&
                    (isBrowser() === true)          &&
                    (isFunction(global.window.postMessage)));
            return (flag) ? xdm.call(y, evt) : yql.call(y, evt);
        };
        y.onready = function (evt) {
         // This function needs documentation.
            if (isFunction(callback)) {
                callback(null, y.val);
            }
            return evt.exit();
        };
        return y;
    };

    load_script = function (url, callback) {
     // This function loads external JavaScript files using the usual callback
     // idioms to which most JavaScripters are accustomed / addicted ;-)
        var y = lib(url);
        y.onerror = function (message) {
         // This function only runs if the script failed to load.
            if (isFunction(callback)) {
                callback(message);
            }
            return;
        };
        y.onready = function (evt) {
         // This function only runs if the script loaded successfully.
            if (isFunction(callback)) {
                callback(null);
            }
            return evt.exit();
        };
        return y;
    };

    map = function (f) {
     // This function needs documentation.
        var afunc, x;
        x = f;
        afunc = function (evt) {
         // This function needs documentation.
            var y;
            if ((this.hasOwnProperty('isready')) ||
                    (this.hasOwnProperty('areready'))) {
             // This arm needs documentation.
                y = map.apply(this, this.val).using(f);
            } else {
                y = map(this.val).using(f);
            }
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = function (y_evt) {
             // This function needs documentation.
                y_evt.exit();
                return evt.exit();
            };
            return;
        };
        afunc.using = function (f) {
         // This function needs documentation.
            var y = avar({val: x});
            y.onready = ply(function (key, val) {
             // This function needs documentation.
                y.val[key] = avar({val: {f: f, x: val}}).Q(function (evt) {
                 // This function needs documentation.
                    this.val = this.val.f(this.val.x);
                    return evt.exit();
                });
                return;
            });
            when.apply(null, [y].concat(y.val)).onready = function (evt) {
             // This function needs documentation.
                ply(y.val).by(function (key, val) {
                 // This function needs documentation.
                    y.val[key] = val.val;
                    return;
                });
                return evt.exit();
            };
            return y;
        };
        return afunc;
    };

    mothership = 'MOTHERSHIP';

    origin = function () {
     // This function needs documentation.
        return global.location.protocol + '//' + global.location.host;
    };

    ply = Q.ply;

    predef = function (task) {
     // This function needs documentation.
        var flag, globals;
        flag = ((task instanceof Object)        &&
                (task.hasOwnProperty('x'))      &&
                (task.x instanceof Object)      &&
                (task.x.hasOwnProperty('key'))  &&
                (state.envs.hasOwnProperty(task.x.key)));
        globals = {
            'QM': false
        };
        if (flag === true) {
            ply(state.envs[task.x.key]).by(function (key, val) {
             // This function needs documentation.
                globals[key] = false;
                return;
            });
        }
        return globals;
    };

    read = function (x) {
     // This function needs documentation.
        var y = ajax('GET', mothership + '/box/' + x.box + '?key=' + x.key);
        y.onready = function (evt) {
         // This function deserializes the string returned as the `val` of
         // `y` into a temporary variable and then copies its property values
         // back onto `y`.
            shallow_copy(avar(y.val), y);
            return evt.exit();
        };
        return y;
    };

    reduce = function (f) {
     // This function needs to be recursive, but ... how best to do it?
        var afunc, x;
        x = f;
        afunc = function (evt) {
         // This function needs documentation.
            var x, y;
            x = this;
            if ((this.hasOwnProperty('isready')) ||
                    (this.hasOwnProperty('areready'))) {
             // This arm needs documentation.
                y = reduce.apply(this, this.val).using(f);
            } else {
                y = reduce(this.val).using(f);
            }
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = function (y_evt) {
             // This function needs documentation.
                if (y.val.length <= 1) {
                    x.val = y.val[0];
                    y_evt.exit();
                    return evt.exit();
                }
                x.val = y.val;
                y_evt.exit();
                return evt.stay('Re-reducing ...');
            };
            return;
        };
        afunc.using = function (f) {
         // This function needs documentation.
            var y = avar({val: x});
            y.onready = function (evt) {
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
            };
            y.onready = map(function (each) {
             // This function needs documentation.
                if (each.hasOwnProperty('y')) {
                    return each.y;
                }
                return each.f(each.x[0], each.x[1]);
            });
            return y;
        };
        return afunc;
    };

    remote_call = function (obj, secret) {
     // This function distributes computations to remote execution nodes by
     // constructing a task that represents the computation, writing it to a
     // shared storage, polling for changes to its status, and then reading
     // the new values back into the local variables. My strategy is to use
     // a bunch of temporary avars that only execute locally -- on this part
     // I must be very careful, because remote calls should be able to make
     // remote calls of their own, but execution of a remote call should not
     // require remote calls of its own! A publication is forthcoming, and at
     // that point I'll simply use a self-citation as an explanation :-)
        var f, first, x;
     // Step 1: copy the computation's function and data into fresh instances,
     // define some error handlers, and write the copies to the "filesystem".
     // If special property values have been added to `x`, they will be copied
     // onto `f` and `x` via the "copy constructor" idiom. Note that special
     // properties defined for `f` will be overwritten ...
        f = avar({box: obj.x.box, val: obj.f});
        first = true;
        x = avar({box: obj.x.box, key: obj.x.key, val: obj.x.val});
        f.onerror = x.onerror = function (message) {
         // This function tells the original `x` that something has gone awry.
            if (first === true) {
                first = false;
                obj.x.comm({fail: message, secret: secret});
            }
            return;
        };
        f.onready = x.onready = update_remote;
     // Step 2: Use a `when` statement to represent the remote computation and
     // track its execution status on whatever system is using Quanah.
        when(f, x).areready = function (evt) {
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
            task.onerror = function (message) {
             // This function alerts `f` and `x` that something has gone awry.
                return evt.fail(message);
            };
            task.onready = update_remote;
            task.onready = function (evt) {
             // This function polls for changes in the `status` property using
             // a variation on the `update_local` function as a non-blocking
             // `while` loop -- hooray for disposable avars!
                var temp = read(task);
                temp.onerror = function (message) {
                 // This alerts `task` that something has gone awry.
                    return evt.fail(message);
                };
                temp.onready = function (temp_evt) {
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
                };
                return;
            };
            task.onready = function (task_evt) {
             // This function ends the enclosing `when` statement.
                task_evt.exit();
                return evt.exit();
            };
            return;
        };
     // Step 3: Update the local instances of `f` and `x` by retrieving the
     // remote versions' representations. If possible, these operations will
     // run concurrently.
        f.onready = x.onready = update_local;
     // Step 4: Use a `when` statement to wait for the updates in Step 3 to
     // finish before copying the new values into the original `obj` argument.
        when(f, x).areready = function (evt) {
         // This function copies the new values into the old object. Please
         // note that we cannot simply write `obj.foo = foo` because we would
         // lose the original avar's internal state!
            obj.f = f.val;
            obj.x.val = x.val;
            obj.x.comm({done: [], secret: secret});
            return evt.exit();
        };
        return;
    };

    retrieve = function (f) {
     // This function needs documentation.
        var y = avar();
        y.onready = function (evt) {
         // This function needs documentation.
            var flag, i;
            flag = false;
            i = 0;
            while ((flag === false) && (i < state.shelf.length)) {
                if (f(state.shelf[i]) === true) {
                    y.val = state.shelf.splice(i, 1)[0];
                    flag = true;
                } else {
                    i += 1;
                }
            }
            if (flag === false) {
                return evt.stay('Nothing matched yet ...');
            }
            return evt.exit();
        };
        return y;
    };

    shallow_copy = function (x, y) {
     // This function copies the properties of `x` to `y`, specifying `y` as
     // object literal if it was not provided as an input argument. It does
     // not perform a "deep copy", which means that properties whose values
     // are objects will be "copied by reference" rather than by value. Right
     // now, I see no reason to worry about deep copies or getters / setters.
        if (y === undefined) {
         // At one point, I used a test here that `arguments.length === 1`,
         // but it offended JSLint:
         //     "Do not mutate parameter 'y' when using 'arguments'."
            y = {};
        }
        var key;
        for (key in x) {
            if (x.hasOwnProperty(key)) {
                y[key] = x[key];
            }
        }
        return y;
    };

    state = {
        box: avar().key,
        envs: {},
        shelf: []
    };

    submit = function (obj) {
     // This function needs documentation.
        var arg_box, arg_env, arg_f, arg_x, y;
        if (arguments.length === 1) {
            arg_box = obj.box;
            arg_env = obj.env;
            arg_f = obj.f;
            arg_x = obj.x;
        } else {
            throw new Error('The "training wheels" are not available yet.');
        }
        y = avar();
        when(arg_box, arg_env, arg_f, arg_x, y).areready = function (evt) {
         // This function needs documentation.
            y.box = (arg_box instanceof AVar) ? arg_box.val : arg_box;
            y.val = {
                env: ((arg_env instanceof AVar) ? arg_env.val : arg_env),
                f: ((arg_f instanceof AVar) ? arg_f.val : arg_f),
                x: ((arg_x instanceof AVar) ? arg_x.val : arg_x)
            };
            return evt.exit();
        };
        y.onready = function (evt) {
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
            temp.onerror = function (message) {
             // This function needs documentation.
                delete state.envs[temp.key];
                return evt.fail(message);
            };
            if (obj.hasOwnProperty('env')) {
                if ((obj.env instanceof Object) === false) {
                    return evt.fail('`env` property must be an object.');
                }
             // NOTE: I should probably check that all properties of `env` are
             // arrays, too, and that all such properties with non-zero lengths
             // have only elements which are strings that represent URLs ...
                state.envs[temp.key] = obj.env;
            }
            temp.onready = function (evt) {
             // This function runs remotely on a volunteer's machine because
             // `QM` is always excepted from JSLint scrutiny.
                /*global QM: false */
                var env, f, temp, x;
             // NOTE: Still need to load all scripts specified in `env` ...
                env = QM.avar({val: this.val.env});
                f = this.val.f;
                temp = this;
                x = QM.avar({val: this.val.x});
                env.onerror = x.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                QM.when(env, x).areready = function (evt) {
                 // This function ensures that the task will not execute until
                 // the prerequisite scripts have finished loading.
                    var prereqs = [];
                    QM.ply(env.val).by(function (key, val) {
                     // This function uses a `for` loop because order matters.
                        var libs = QM.avar({val: val.slice()});
                        libs.onerror = function (message) {
                         // This function needs documentation.
                            return evt.fail(message);
                        };
                        libs.onready = function (evt) {
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
                            }).onerror = function (message) {
                             // This function needs documentation.
                                return evt.fail(message);
                            };
                            return;
                        };
                        prereqs.push(libs);
                        return;
                    });
                    QM.when.apply(null, prereqs).onready = function (w_evt) {
                     // This function needs documentation.
                        w_evt.exit();
                        return evt.exit();
                    };
                    return;
                };
                x.onready = f;
                x.onready = function (x_evt) {
                 // This function needs documentation.
                    temp.val = x.val;
                    x_evt.exit();
                    return evt.exit();
                };
                return;
            };
            temp.onready = function (temp_evt) {
             // This function needs documentation.
                y.val = temp.val;
                delete state.envs[temp.key];
                temp_evt.exit();
                return evt.exit();
            };
            return;
        };
        return y;
    };

    update_local = function (evt) {
     // This function is used in the `remote_call` and `volunteer` functions
     // to update the local copy of an avar so that its `val` property matches
     // the one from its remote representation. It is written as a function of
     // `evt` because it is intended to be assigned to `onready`.
        var local, temp;
        local = this;
        temp = read(local);
        temp.onerror = function (message) {
         // This function tells `local` that something has gone awry.
            return evt.fail(message);
        };
        temp.onready = function (temp_evt) {
         // Here, we copy the remote representation into the local one.
            shallow_copy(temp, local);
            temp_evt.exit();
            return evt.exit();
        };
        return;
    };

    update_remote = function (evt) {
     // This function is used in the `remote_call` and `volunteer` functions
     // to update the remote copy of an avar so that its `val` property matches
     // the one from its local representation. It is written as a function of
     // `evt` because it is intended to be assigned to `onready`.
        var temp = write(this);
        temp.onerror = function (message) {
         // This tells the local avar (`this`) that something has gone awry.
            return evt.fail(message);
        };
        temp.onready = function (temp_evt) {
         // This function just releases execution for the local avar (`this`).
            temp_evt.exit();
            return evt.exit();
        };
        return;
    };

    volunteer = function (box) {
     // This function, combined with `remote_call`, provides the remote code
     // execution mechanism in Quanah. When `remote_call` on one machine sends
     // a serialized task to another machine, that other machine runs it with
     // the `volunteer` function. This function outputs the avar representing
     // the task so that the underlying system (not Quanah) can control system
     // resources itself. Examples will be included in the distribution that
     // will accompany the upcoming publication(s).
        if (box === undefined) {
            box = global.QM.box;
        }
        var task = avar({box: box});
        task.onready = function (evt) {
         // This function retrieves the key of a task from the queue so we
         // can retrieve that task's full description. If no tasks are found,
         // we will simply check back later :-)
            var temp = jobs(box);
            temp.onerror = function (message) {
             // This function notifies `task` that something has gone wrong
             // during retrieval and interpretation of its description.
                return evt.fail(message);
            };
            temp.onready = function (temp_evt) {
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
            };
            return;
        };
        task.onready = update_local;
        task.onready = function (evt) {
         // This function changes the `status` property of the local `task`
         // object we just synced from remote; the next step, obviously, is
         // to sync back to remote so that the abstract task will disappear
         // from the "waiting" queue.
            task.status = 'running';
            return evt.exit();
        };
        task.onready = update_remote;
        task.onready = function (evt) {
         // This function executes the abstract task by recreating `f` and `x`
         // and running them in the local environment. Since we know `task` is
         // serializable, we cannot simply add its deserialized form to the
         // local machine's queue (`queue`), because `revive` would just send
         // it back out for remote execution again. Thus, we deliberately close
         // over local variables like `avar` in order to restrict execution to
         // the current environment. The transform defined in `task.val.f` is
         // still able to distribute its own sub-tasks for remote execution.
            var f, first, x;
            f = avar({box: box, key: task.val.f});
            first = true;
            x = avar({box: box, key: task.val.x});
            f.onerror = x.onerror = function (message) {
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
                    temp_f = avar(f);
                    temp_x = avar(x);
                    temp_f = temp_x = update_remote;
                    when(temp_f, temp_x).areready = function (temp_evt) {
                     // This function runs only when the error messages have
                     // finished syncing to remote storage successfully.
                        temp_evt.exit();
                        return evt.exit();
                    };
                }
                return;
            };
            f.onready = x.onready = update_local;
            when(f, x).areready = function (evt) {
             // This function contains the _actual_ execution. (Boring, huh?)
                f.val.call(x, evt);
                return;
            };
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
         //     when(f, x).areready = function (evt) {
         //         if (is_closed(f.val) || is_closed(x.val)) {
         //             return evt.abort('Results will not be returned.');
         //         }
         //         return evt.exit();
         //     };
         //
            f.onready = x.onready = update_remote;
            when(f, x).areready = function (temp_evt) {
             // This function only executes when the task has successfully
             // executed and the transformed values of `f` and `x` are synced
             // back to remote storage. Thus, we are now free to send the
             // signal for successful completion to the invoking machine by
             // updating the `status` property locally and syncing to remote.
                task.status = 'done';
                temp_evt.exit();
                return evt.exit();
            };
            return;
        };
        task.onready = update_remote;
        return task;
    };

    when = Q.when;

    write = function (x) {
     // This function sends an HTTP POST to QMachine. It doesn't worry
     // about the return data because QMachine isn't going to return
     // any data -- the request will either succeed or fail, as
     // indicated by the HTTP status code returned. It returns an avar.
        var url = mothership + '/box/' + x.box + '?key=' + x.key;
        return ajax('POST', url, JSON.stringify(x));
    };

 // Prototype definitions

    Object.defineProperty(avar().constructor.prototype, 'box', {
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
            state.box = x.toString();
            return;
        }
    });

    (function () {
     // Here, we add some static methods to `QM` that make QMachine a little
     // more convenient to use ...
        var template;
        template = {
            avar:           avar,
            capture:        capture,
            lib:            lib,
            load_data:      load_data,
            load_script:    load_script,
            map:            map,
            ply:            ply,
            reduce:         reduce,
            revive:         avar().revive,
            retrieve:       retrieve,
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

    Q.def({
        predef: predef,
        remote_call: remote_call
    });

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // For full documentation, refer to the bottom of "quanah.js".
    /*jslint indent: 4, maxlen: 80 */
    /*global global: false */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
