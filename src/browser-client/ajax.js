//- JavaScript source code

//- ajax.js ~~
//
//  This is an AJAX communications layer for QMachine's API (version 1), as
//  designed for cross-document messaging.
//
//                                                      ~~ (c) SRW, 24 Apr 2013
//                                                  ~~ last updated 24 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 3, quotmark: single, strict: true */

    /*jslint browser: true, devel: true, indent: 4, maxlen: 80 */

    /*properties
        ActiveXObject, avar, box, comm, constructor, exemptions, exit, fail,
        hasOwnProperty, host, length, location, log, key, method, navigator,
        now, onLine, onreadystatechange, open, parse, protocol, prototype, Q,
        readyState, recent, responseText, revive, send, setTimeout, status,
        stay, stringify, time, val, withCredentials, XDomainRequest,
        XMLHttpRequest
    */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var ajax, AVar, avar, copy, global, is_Function, is_online, jobs,
        mothership, origin, read, recent, revive, state, write;

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
                    if (request.status >= 500) {
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

    AVar = Object.prototype.Q.avar().constructor;

    avar = Object.prototype.Q.avar;

    global = window;

    is_Function = function (f) {
     // This function returns `true` if and only if input argument `f` is a
     // function. The second condition is necessary to avoid a false positive
     // in a pre-ES5 environment when `f` is a regular expression.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    is_online = function () {
     // This function returns a boolean. It is not currently necessary, but I
     // have future plans that will require this function, so I have already
     // generalized QM in preparation.
        return (mothership === 'LOCAL_NODE') || global.navigator.onLine;
    };

    jobs = function (box) {
     // This function retrieves a list of tasks that need to be executed.
        var y = ajax('GET', mothership + '/box/' + box + '?status=waiting');
        return y.Q(function (evt) {
         // This function needs documentation.
            y.val = JSON.parse(y.val);
            return evt.exit();
        });
    };

    mothership = 'QM_API_URL';

    origin = function () {
     // This function needs documentation.
        return global.location.protocol + '//' + global.location.host;
    };

    read = function (x) {
     // This function needs documentation.
        var y = ajax('GET', mothership + '/box/' + x.box + '?key=' + x.key);
        return y.Q(function (evt) {
         // This function deserializes the string returned as the `val` of
         // `y` into a temporary variable and then copies its property values
         // back onto `y`.
            /*
                copy(deserialize(y.val), y);
            */
            console.log(y.val);
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
            revive(dt + 1);
        }
        return flag;
    };

    revive = function (ms) {
     // This function restarting Quanah's event loop asynchronously using the
     // browser's own event loop if possible. It accepts an optional argument
     // specifying the number of milliseconds to wait before restarting.
        var dt = parseInt(ms, 10);
        if (is_Function(global.setTimeout)) {
            global.setTimeout(AVar.prototype.revive, isNaN(dt) ? 0 : dt);
        } else {
            AVar.prototype.revive();
        }
        return;
    };

    state = {
        box: avar().key,
        exemptions: {},
        recent: {}
    };

    write = function (x) {
     // This function sends an HTTP POST to QMachine. It doesn't worry
     // about the return data because QMachine isn't going to return
     // any data -- the request will either succeed or fail, as
     // indicated by the HTTP status code returned. It returns an avar.
        var url = mothership + '/box/' + x.box + '?key=' + x.key;
        return ajax('POST', url, JSON.stringify(x));
    };

 // Prototype definitions

 // Out-of-scope definitions

 // Invocations

    (function () {

     // (placeholder)

        return;

    }());

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
