//- JavaScript source code

//- quanah.js ~~
//
//  Browser features that are required:
//  -   XMLHttpRequest object
//  -   [Web] Worker object (although I'll be able to remove this part soon)
//  -   getters and setters (ES5 recommended!)
//
//  TO-DO:
//  -   argument parsing
//  -   error message "bubbling" from remote machines
//
//                                                      ~~ (c) SRW, 11 Oct 2011

chassis(function (q, global) {
    'use strict';

 // Prerequisites

    if (typeof Object.prototype.Q === 'function') {
     // Avoid unnecessary work if Method Q already exists.
        return;
    }

    q.lib('fs');

 // Private declarations

    var argv, bookmarks, countdown, isFunction, key2meta, read, sync, token,
        uuid, write;

 // Private definitions

    argv = {
        developer:  true,
        volunteer:  true
    };

    bookmarks = {
        doc: function (id) {
            return 'http://' + global.location.host + '/db/' + id;
        },
        queue: function (key) {
            return 'http://' + global.location.host + '/_view/tasks?key="' +
                key + '"';
        },
        uuids: function (n) {
            return 'http://' + global.location.host + '/_uuids?count=' + n;
        }
    };

    token = null;                       //- TODO: retrieve this using parseURI

    countdown = function (n, callback) {
        var t = n;
        return function () {
            t -= 1;
            if (t === 0) {
                callback.apply(this, arguments);
            }
        };
    };

    isFunction = function (f) {
        return ((typeof f === 'function') && (f instanceof Function));
    };

    key2meta = {};                      //- a cache for CouchDB metadata

    read = function (url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            var response;
            if (request.readyState === 4) {
                response = JSON.parse(request.responseText);
                callback(request, response);
            }
        };
        request.open('GET', url, true);
        request.send(null);
    };

    sync = q.fs$sync;

    uuid = function () {
     // This function generates hexadecimal UUIDs of length 32.
        var x = '';
        while (x.length < 32) {
            x += Math.random().toString(16).slice(2, (32 + 2 - x.length));
        }
        return x;
    };

    write = function (url, data, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            var response;
            if (request.readyState === 4) {
                response = JSON.parse(request.responseText);
                callback(request, response);
            }
        };
        request.open('PUT', url, true);
        request.setRequestHeader('Content-type', 'application/json');
        request.send(JSON.stringify(data));
    };

 // Private constructors

 // Global definitions

    Object.prototype.Q = function (func) {  //  y = x.Q(f);
        var count, f, task, x, y;
        count = countdown(3, function () {
            task.onready = function (val, exit) {
                val.f = f.key;
                val.x = x.key;
                val.y = y.key;
                val.status = 'waiting';
                exit.success(val);
            };
            sync(task);
        });
        f = sync({val: func});
        x = sync((this instanceof (f.constructor)) ? this : {val: this});
        y = sync({val: null});
        task = sync({
            val: {
                f:      f.key,
                x:      x.key,
                y:      y.key,
                status: 'initializing'
            }
        });
        f.onready = x.onready = y.onready = function (val, exit) {
            count();
            exit.success(val);
        };
        y.onready = function (val, exit) {
            var check, timer;
            check = function () {
                read(bookmarks.doc(task.key), function (request, response) {
                    if (request.status === 200) {
                        switch (response.val.status) {
                        case 'done':
                         // Exit with current value so the "sync" can occur.
                            global.clearInterval(timer);
                            read(bookmarks.doc(y.key), function (req, res) {
                                if (req.status === 200) {
                                    exit.success(res.val);
                                } else {
                                    exit.failure(res.val);
                                }
                            });
                            break;
                        case 'failed':
                            global.clearInterval(timer);
                            read(bookmarks.doc(y.key), function (req, res) {
                                exit.failure(res.val);
                            });
                            break;
                        default:
                         // (placeholder)
                        }
                    }
                });
            };
            timer = global.setInterval(check, 1000); //- check every 1000 ms
        };
        return y;
    };

 // Invocations

    if (argv.developer === true) {
        (function developer() {
            if (global.hasOwnProperty('console')) {
                console.log('--- Developer Mode enabled ---');
            }
        }());
    }

    if (argv.volunteer === true) {
        (function volunteer() {
            var bee;
            if (global.hasOwnProperty('console')) {
                console.log('--- Volunteer Mode enabled ---');
            }
            if (global.hasOwnProperty('window')) {
             // This part runs in a web browser.
                bee = new Worker('quanah.js');
                bee.onmessage = function (evt) {
                    console.log(evt.data);
                };
                bee.onerror = function (evt) {
                    console.error(evt);
                };
            } else {
             // This part runs in a Web Worker.
                read(bookmarks.queue('waiting'), function (request, response) {
                    var f, n, obj, queue, task, x, y;
                    if (request.status === 200) {
                        queue = response;
                        n = queue.rows.length;
                        if (n === 0) {
                            global.postMessage('Nothing to do ...');
                        } else {
                            obj = queue.rows[0];
                            f = sync({key: obj.value.f});
                            x = sync({key: obj.value.x});
                            y = sync({key: obj.value.y});
                            task = sync({key: obj.id});
                            task.onready = function (val, exit) {
                                val.status = 'running';
                                exit.success(val);
                            };
                            sync(task);
                            task.onready = function (tval, exit) {
                                var count, func;
                                count = countdown(3, function () {
                                 // Yes, I know this is begging for a malicious
                                 // code injection -- that's precisely why I've
                                 // suggested using JSLINT as a preprocessor.
                                    try {
                                        y.val = (eval(f.val))(x.val);
                                        task.val.status = 'done';
                                    } catch (err) {
                                        exit.failure(err);
                                    } finally {
                                        sync(y);
                                        sync(task);
                                        exit.success(tval);
                                    }
                                });
                                func = function (val, exit) {
                                    exit.success(val);
                                    count();
                                };
                                f.onready = x.onready = y.onready = func;
                            };
                        }
                    } else {
                        throw new Error('Badness?');
                    }
                });
            }
        }());
    }

});

//- vim:set syntax=javascript:
