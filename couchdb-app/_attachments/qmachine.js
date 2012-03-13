//- JavaScript source code

//- qmachine.js ~~
//                                                      ~~ (c) SRW, 12 Mar 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, hOP, isBrowser, isFunction, isNodejs, mothership,
        parseArgs, ply, puts, relaunch, setup, token, when;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    hOP = function (obj, name) {
     // This function needs documentation.
        return ((obj !== null)      &&
                (obj !== undefined) &&
                (obj.hasOwnProperty(name)));
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

    isNodejs = function () {
     // This function needs documentation.
        return global.hasOwnProperty('process');
    };

    mothership = 'http://qmachine.org';

    parseArgs = function () {
     // This function needs documentation.
        if (isBrowser()) {
            parseArgs = function () {
             // This function is based on "parseUri" by Steven Levithan
             // (MIT license), but I have modified it here because I only care
             // about parsing the query parameters. It treats 'location.search'
             // value as a set of ampersand-separated Boolean key=value
             // parameters whose keys are valid JS identifiers and whose values
             // are either "true" or "false" (without quotes). The function
             // accepts an object whose own properties will be used to override
             // flags that are already present.
                /*jslint regexp: true */
                var argv, i, m, o, uri;
                argv = {};
                o = {
                 // This object needs documentation.
                    key: [
                        'source', 'protocol', 'authority', 'userInfo',
                        'user', 'password', 'host', 'port', 'relative',
                        'path', 'directory', 'file', 'query', 'anchor'
                    ],
                    parser: new RegExp('^(?:([^:\\/?#]+):)?(?:\\/\\/((?:((' +
                        '[^:@]*)(?::([^:@]*))?)?@)?([^:\\/?#]*)(?::(\\d*))' +
                        '?))?((((?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?' +
                        '(?:#(.*))?)'),
                    q: {
                        name:   'flags',
                        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                    }
                };
                m = o.parser.exec(global.location.href);
                uri = {};
                for (i = 14; i > 0; i -= 1) {
                    uri[o.key[i]] = m[i] || '';
                }
                uri[o.q.name] = {};
                uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                    if ($1) {
                     // These are "explicit coercions" ;-)
                        switch ($2) {
                        case '':
                            uri[o.q.name][$1] = true;
                            break;
                        case 'false':
                            uri[o.q.name][$1] = false;
                            break;
                        case 'true':
                            uri[o.q.name][$1] = true;
                            break;
                        default:
                            uri[o.q.name][$1] = decodeURI($2);
                        }
                    }
                    return;
                });
             // Now, we'll copy the "command-line arguments" onto 'argv'.
                ply(uri.flags).by(function (key, val) {
                 // Does this function need documentation?
                    argv[key] = val;
                    return;
                });
             // Before exiting, we'll ensure that the query parameters match
             // the values shown in the form's options. This part may change
             // soon because there is an open issue about it on GitHub.
                (function () {
                 // This function needs documentation.
                    if (global.hasOwnProperty('document') === false) {
                        return;
                    }
                    var doc, options;
                    doc = global.document;
                    options = {
                        volunteer:  doc.getElementById('volunteer'),
                    };
                    ply(argv).by(function (key, val) {
                     // This function needs documentation.
                        var flag;
                        flag = ((options.hasOwnProperty(key)) &&
                                (options[key] !== null) &&
                                (options[key].checked !== undefined) &&
                                (options[key].checked !== val));
                        if (flag === true) {
                            options[key].checked = val;
                        }
                        return;
                    });
                    return;
                }());
             // Finally, we return our object :-)
                return argv;
            };
        } else if (isNodejs()) {
            parseArgs = function () {
             // This function needs documentation.
                /*jslint regexp: true */
                var i, key, n, temp, val, x, y;
                n = global.process.argv.length;
                x = global.process.argv;
                y = {};
                for (i = 2; i < n; i += 1) {
                    temp = (x[i]).match(/^([^=]+)(|=(.*))$/);
                    if (temp !== null) {
                        key = temp[1];
                        switch (temp[3]) {
                        case 'false':
                            val = false;
                            break;
                        case 'true':
                            val = true;
                            break;
                        case undefined:
                            val = true;
                            break;
                        default:
                            val = temp[3];
                        }
                        y[key] = val;
                    }
                }
                return y;
            };
        } else {
            parseArgs = function () {
             // This function needs documentation.
                var argv = {};
                // ...
                return argv;
            };
        }
        return parseArgs();
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

    puts = function () {
     // This function is my own self-contained output logging utility.
        if (hOP(global, 'system') && isFunction(global.system.print)) {
         // Narwhal-JSC, Narwhal (w/ Rhino engine), and RingoJS
            puts = function () {
             // This function needs documentation.
                global.system.print(Array.prototype.join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'console') && isFunction(global.console.log)) {
         // Node.js and modern web browsers
            puts = function () {
             // This function needs documentation.
                global.console.log(Array.prototype.join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.alert)) {
         // Crusty old web browsers
            puts = function () {
             // This function needs documentation.
                global.alert(Array.prototype.join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'print') && isFunction(global.print)) {
         // JavaScriptCore, Rhino, Spidermonkey (==> 'couchjs' also), D8/V8
            puts = function () {
             // This function needs documentation.
                global.print(Array.prototype.join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.postMessage)) {
         // Web Worker contexts (must be tied to some 'bee.onmessage' handler
         // in the invoking webpage's environment, though ...).
            puts = function () {
             // This function needs documentation.
                global.postMessage(Array.prototype.join.call(arguments, ' '));
                return;
            };
        } else {
         // This is the place where only the naughtiest of implementations
         // will land. Unfortunately, Adobe/Mozilla Tamarin is one of them.
            puts = function () {
             // This is a last resort, trust me.
                /*global print: false */
                if (isFunction(print)) {
                    print(Array.prototype.join.call(arguments, ' '));
                    return;
                }
                throw new Error('The "puts" definition fell through.');
            };
        }
        puts.apply(this, arguments);
        return;
    };

    relaunch = function (obj) {
     // This function reloads the current webpage with new query parameters
     // by stringifying its input object, 'obj'.
        if (isBrowser()) {
            var y = [];
            ply(obj).by(function (key, val) {
             // This function needs documentation.
                y.push(key + '=' + val);
                return;
            });
            global.location.search = y.join('&');
            return;
        }
        return;
    };

    setup = avar();

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
         // NOTE: Mozilla Firefox doesn't respond to this test correctly.
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

 // Invocations

    setup.onerror = function (message) {
     // This function needs documentation.
        if (message instanceof Error) {
            puts('Error:', message.message);
            return;
        }
        if (message !== 'Nothing to do ...') {
            puts('Error:', message);
        }
        return;
    };

    setup.onready = function (evt) {
     // This function needs documentation.
        if ((isBrowser() === false) && (isNodejs() === false)) {
            return evt.fail('Qmachine does not support this platform.');
        }
        this.val = {
         // This object needs documentation.
            local_queue:    null,
            local_read:     null,
            local_write:    null,
            remote_queue:   null,
            remote_read:    null,
            remote_write:   null
        };
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function defines 'cache' methods for persistent local storage in
     // a web browser clients using HTML 5 'localStorage' if possible.
        if ((isBrowser() === false) || (parseArgs().cache !== 'local')) {
            return evt.exit();
        }
        var cache, db;
        cache = this.val;
        db = global.localStorage;       //- NOTE: test for existence first!
        cache.local_queue = function () {
         // This function needs documentation.
            var y = avar({val: []});
            y.onready = function (evt) {
             // This function needs documentation.
                var flag, i, key, n, val;
                n = db.length;
                for (i = 0; i < n; i += 1) {
                    key = val = null;
                    try {
                        key = db.key(i);
                        val = JSON.parse(db.getItem(key));
                    } catch (err) {
                        puts('Caught error:', err);
                        val = err;
                    } finally {
                        flag = ((val !== null)                  &&
                                (val !== undefined)             &&
                                (val.hasOwnProperty('key'))     &&
                                (val.hasOwnProperty('$avar'))   &&
                                (val.hasOwnProperty('status'))  &&
                                (val.status === 'waiting')      &&
                                (val.hasOwnProperty('token'))   &&
                                (val.token === token()));
                        if (flag === true) {
                            y.val.push(key);
                        }
                    }
                }
                return evt.exit();
            };
            return y;
        };
        cache.local_read = function (key) {
         // This function needs documentation.
            var y = avar();
            y.onready = function (evt) {
             // This function needs documentation.
                var $val = db.getItem(key);
                if ($val === null) {
                    return evt.fail('no key "' + key + '" found');
                }
                this.val = JSON.parse($val).$avar;
                return evt.exit();
            };
            return y;
        };
        cache.local_write = function (key, $val) {
         // This function needs documentation.
            var y = avar();
            y.onready = function (evt) {
             // This function needs documentation.
                var doc, temp;
                doc = {
                    key:    key,
                    $avar:  $val,
                    token:  token()
                };
                temp = JSON.parse($val).val;
                if ((temp !== null) && (temp !== undefined) &&
                        (temp.hasOwnProperty('status'))) {
                 // NOTE: The third condition here may be unnecessary.
                    puts('status:', temp.status);
                    doc.status = temp.status;
                }
                db.setItem(key, JSON.stringify(doc));
                return evt.exit();
            };
            return y;
        };
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function defines 'cache' methods for persistent local storage in
     // Node.js clients using SQLite 3.
        if ((isNodejs() === false) || (parseArgs().cache !== 'local')) {
            return evt.exit();
        }
        var cache, db;
        cache = this.val;
        db = avar();
        db.onerror = function (message) {
         // This function needs documentation.
            return evt.fail(message);
        };
        db.onready = function (evt) {
         // This function needs documentation.
            /*jslint node: true */
            db.val = new (require('sqlite3').Database)('Q.db', function () {
             // This callback function needs documentation.
                db.val.serialize(function () {
                 // This callback function needs documentation.
                    var query;
                    query = [
                        'CREATE TABLE IF NOT EXISTS qmachine ' +
                            '(_id TEXT, val TEXT, status TEXT, token TEXT)',
                        'CREATE UNIQUE INDEX IF NOT EXISTS ' +
                            'uuid ON qmachine (_id)'
                    ];
                    db.val.run(query[0], function (err) {
                     // This callback function needs documentation.
                        return (err) ? evt.fail(err) : undefined;
                    });
                    db.val.run(query[1], function (err) {
                     // This callback function needs documentation.
                        return (err) ? evt.fail(err) : evt.exit();
                    });
                    return;
                });
                return;
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            cache.local_queue = function () {
             // This function gets the queue from a local SQLite 3 database in
             // a Node.js client. It depends on the 'sqlite3' module.
                var y = avar({val: []});
                y.onready = function (evt) {
                 // This function needs documentation.
                    var query;
                    query = [
                        'SELECT _id',
                        'FROM qmachine',
                        'WHERE ' +
                            'status = "waiting"' +
                            ' AND ' +
                            'token = "' + token() + '"'
                    ];
                    db.val.all(query.join(' '), function (err, rows) {
                     // This function needs documentation.
                        if (err) {
                            return evt.fail(err);
                        }
                        y.val = rows.map(function (each) {
                         // This function needs documentation.
                            /*jslint nomen: true */
                            return each._id;
                        });
                        return evt.exit();
                    });
                    return;
                };
                return y;
            };
            cache.local_read = function (key) {
             // This function reads files from a local SQLite 3 database in
             // a Node.js client. It depends on the 'sqlite3' module.
                var y = avar({key: key});
                y.onready = function (evt) {
                 // This function needs documentation.
                    var query;
                    query = [
                        'SELECT DISTINCT _id, val',
                        'FROM qmachine',
                        'WHERE ' +
                            '_id = "' + key + '"'
                    ];
                    db.val.all(query.join(' '), function (err, rows) {
                     // This function needs documentation.
                        if (err) {
                            return evt.fail(err);
                        }
                        y.val = rows[0].val;
                        return evt.exit();
                    });
                    return;
                };
                return y;
            };
            cache.local_write = function (key, $val) {
             // This function writes files to a local SQLite 3 database in
             // a Node.js client. It depends on the 'sqlite3' module.
                var y = avar({key: key});
                y.onready = function (evt) {
                 // This function needs documentation.
                    var query, stmt, temp;
                    query = [
                        'INSERT OR REPLACE INTO qmachine',
                        'VALUES (?, ?, ?, ?)'
                    ];
                    stmt = db.val.prepare(query.join(' '));
                    temp = JSON.parse($val).val;
                    if ((temp !== null) && (temp !== undefined) &&
                            (temp.hasOwnProperty('status'))) {
                        stmt.run(key, $val, temp.status, token());
                    } else {
                        stmt.run(key, $val, null, token());
                    }
                    stmt.finalize(function (err) {
                     // This function needs documentation.
                        return (err) ? evt.fail(err) : evt.exit();
                    });
                    return;
                };
                return y;
            };
            return evt.exit();
        };
        db.onready = function (db_evt) {
         // This function needs documentation.
            db_evt.exit();
            return evt.exit();
        };
        return;
    };

    setup.onready = function (evt) {
     // This function defines 'cache' methods for persistent remote storage
     // from a web browser client to http://qmachine.org, which uses CouchDB.
        if (isBrowser() === false) {
            return evt.exit();
        }
        var cache, request;
        cache = this.val;
        request = function () {
         // This function generates a new AJAX request object. I have not yet
         // experimented with Web Sockets, but unless CouchDB supports them,
         // that is an exciting technology that must wait for another day ;-)
            var req;
            if (global.hasOwnProperty('XMLHttpRequest')) {
                req = new global.XMLHttpRequest();
            } else if (global.hasOwnProperty('ActiveXObject')) {
                req = new global.ActiveXObject('Microsoft.XMLHTTP');
            } else {
                throw new Error('This browser does not support AJAX.');
            }
            return req;
        };
        cache.remote_queue = function () {
         // This function gets the queue from http://qmachine.org with AJAX in
         // a web browser.
            var y = avar({val: []});
            y.onready = function (evt) {
             // This function needs documentation.
                var href, req;
                href = mothership + '/queue/' + token();
                req = request();
                req.onreadystatechange = function () {
                 // This function needs documentation.
                    var temp;
                    if (req.readyState === 4) {
                        if (req.status !== 200) {
                            return evt.fail(req.responseText);
                        }
                        temp = JSON.parse(req.responseText).rows;
                        ply(temp).by(function (key, val) {
                         // This function needs documentation.
                            y.val.push(val.id);
                            return;
                        });
                        return evt.exit();
                    }
                    return;
                };
                req.open('GET', href, true);
                req.send(null);
                return;
            };
            return y;
        };
        cache.remote_read = function (key) {
         // This function reads files from http://qmachine.org with AJAX in a
         // web browser.
            var y = avar({key: key});
            y.onready = function (evt) {
             // This function sends an HTTP GET request.
                var href, req;
                href = mothership + '/db/' + key;
                req = request();
                req.onreadystatechange = function () {
                 // This function needs documentation.
                    var temp;
                    if (req.readyState === 4) {
                        if (req.status !== 200) {
                            return evt.fail(req.responseText);
                        }
                        temp = JSON.parse(req.responseText).rows[0];
                        if (temp === undefined) {
                            return evt.fail('Remote missing: ' + href);
                        }
                        y.val = temp.doc.$avar;
                        return evt.exit();
                    }
                    return;
                };
                req.open('GET', href, true);
                req.send(null);
                return;
            };
            return y;
        };
        cache.remote_write = function (key, $val) {
         // This function writes files to http://qmachine.org with AJAX in a
         // web browser.
            var y = avar({key: key});
            y.onready = function (evt) {
             // This function needs documentation.
                var href, rev;
                href = mothership + '/db/';
                rev = avar({val: undefined});
                rev.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                rev.onready = function (evt) {
                 // This function reads the revision number from CouchDB in
                 // such a way as to avoid 404 errors entirely because I can't
                 // figure out how to keep the error output from cluttering
                 // Chrome's developer console. A more efficient way would be
                 // to send a HEAD request like the Node.js client does, but
                 // efficiency isn't the goal here.
                    var req, url;
                    req = request();
                    url = mothership + '/meta/' + key;
                    req.onreadystatechange = function () {
                     // This function needs documentation.
                        var temp;
                        if (req.readyState === 4) {
                            if (req.status === 200) {
                                temp = JSON.parse(req.responseText).rows[0];
                                if (temp !== undefined) {
                                    rev.val = temp.value.rev;
                                }
                                evt.exit();
                            } else {
                                evt.fail(req.responseText);
                            }
                        }
                        return;
                    };
                    req.open('GET', url, true);
                    req.send(null);
                    return;
                };
                rev.onready = function (evt) {
                 // This function sends an HTTP PUT request.
                    /*jslint nomen: true */
                    var doc, req, temp;
                    doc = {
                        '_id':  key,
                        '_rev': rev.val,
                        $avar:  $val,
                        token:  token()
                    };
                    req = request();
                    temp = JSON.parse($val).val;
                    if ((temp !== null) && (temp !== undefined) &&
                            (temp.hasOwnProperty('status'))) {
                     // This simplifies Qmachine's 'queue' filter in CouchDB.
                        doc.status = temp.status;
                    }
                    req.onreadystatechange = function () {
                     // Normally, we would listen for a 201 "Created" status,
                     // but this function checks for a 202 "Accepted" status
                     // because we're using batch mode in CouchDB to speed up
                     // writes, which lets CouchDB save documents in memory
                     // and flush to disk in batches rather than requiring an
                     // 'fsync' for every single write operation.
                        if (req.readyState === 4) {
                            if (req.status !== 202) {
                                return evt.fail(req.responseText);
                            }
                            y.val = JSON.parse(req.responseText);
                            return evt.exit();
                        }
                        return;
                    };
                    req.open('PUT', href + key, true);
                    req.setRequestHeader('Content-type', 'application/json');
                    req.send(JSON.stringify(doc));
                    return;
                };
                rev.onready = function (rev_evt) {
                 // This function needs documentation.
                    rev_evt.exit();
                    return evt.exit();
                };
                return;
            };
            return y;
        };
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function defines 'cache' methods for persistent remote storage
     // from a Node.js client to http://qmachine.org, which uses CouchDB.
        /*jslint node: true */
        if (isNodejs() === false) {
            return evt.exit();
        }
        var cache, http, url;
        cache = this.val;
        http = require('http');
        url = require('url');
        cache.remote_queue = function () {
         // This function gets the queue from http://qmachine.org with Node.js.
            var href, y;
            href = mothership + '/queue/' + token();
            y = avar({val: []});
            y.onready = function (evt) {
             // This function needs documentation.
                http.get(url.parse(href), function (response) {
                 // This function needs documentation.
                    var txt = [];
                    response.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    }).on('end', function () {
                     // This function needs documentation.
                        var data = JSON.parse(txt.join('')).rows;
                        ply(data).by(function (key, val) {
                         // This function needs documentation.
                            y.val.push(val.id);
                            return;
                        });
                        return evt.exit();
                    });
                    return;
                }).on('error', function (err) {
                 // This function needs documentation.
                    return evt.fail(err);
                });
                return;
            };
            return y;
        };
        cache.remote_read = function (key) {
         // This function reads files from http://qmachine.org with Node.js.
            var y = avar();
            y.onready = function (evt) {
             // This function needs documentation.
                var href = mothership + '/db/' + key;
                http.get(url.parse(href), function (response) {
                 // This function needs documentation.
                    var txt = [];
                    response.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    }).on('end', function () {
                     // This function needs documentation.
                        var temp = JSON.parse(txt.join('')).rows[0];
                        if (temp === undefined) {
                            return evt.fail('Remote missing: ' + href);
                        }
                        y.val = temp.doc.$avar;
                        return evt.exit();
                    });
                    return;
                }).on('error', function (err) {
                 // This function needs documentation.
                    return evt.fail(err);
                });
                return;
            };
            return y;
        };
        cache.remote_write = function (key, $val) {
         // This function writes files to http://qmachine.org with Node.js.
            var y = avar({key: key});
            y.onready = function (evt) {
             // This function needs documentation.
                var href, rev;
                href = mothership + '/db/' + key;
                rev = avar({val: undefined});
                rev.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                rev.onready = function (evt) {
                 // This function needs documentation.
                    var options = url.parse(mothership + '/meta/' + key);
                    http.get(options, function (response) {
                     // This function needs documentation.
                        var txt = [];
                        response.on('data', function (chunk) {
                         // This function needs documentation.
                            txt.push(chunk.toString());
                            return;
                        }).on('end', function () {
                         // This function needs documentation.
                            var temp = JSON.parse(txt.join('')).rows[0];
                            if (temp !== undefined) {
                                rev.val = temp.value.rev;
                            }
                            return evt.exit();
                        });
                        return;
                    }).on('error', function (err) {
                     // This function needs documentation.
                        return evt.fail(err);
                    });
                    return;
                };
                rev.onready = function (evt) {
                 // This function needs documentation.
                    /*jslint nomen: true */
                    var doc, options, req, temp;
                    doc = {
                        '_id':  key,
                        '_rev': rev.val,
                        $avar:  $val,
                        token:  token()
                    };
                    options = url.parse(href);
                    options.method = 'PUT';
                    temp = JSON.parse($val).val;
                    if (hOP(temp, 'status')) {
                        doc.status = temp.status;
                    }
                    req = http.request(options, function (response) {
                     // This function needs documentation.
                        var txt = [];
                        response.on('data', function (chunk) {
                         // This function needs documentation.
                            txt.push(chunk.toString());
                            return;
                        }).on('end', function () {
                         // This function needs documentation.
                            y.val = JSON.parse(txt.join(''));
                            return evt.exit();
                        });
                        return;
                    }).on('error', function (err) {
                     // This function needs documentation.
                        return evt.fail(err);
                    });
                    temp = JSON.parse($val).val;
                    if (hOP(temp, 'status')) {
                        doc.status = temp.status;
                    }
                    req.write(JSON.stringify(doc));
                    req.end();
                    return;
                };
                rev.onready = function (temp_evt) {
                 // This function needs documentation.
                    temp_evt.exit();
                    return evt.exit();
                };
                return;
            };
            return y;
        };
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function configures the browser's interactive session.
        if (isBrowser() === false) {
            return evt.exit();
        }
        var doc;
        token();
        if (global.hasOwnProperty('document')) {
         // There has GOT to be a better way -- jQuery, perhaps?
            doc = global.document;
            if (doc.getElementById('volunteer') !== null) {
                doc.getElementById('volunteer').onclick = function () {
                    return relaunch({
                        volunteer: this.checked
                    });
                };
            }
        }
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function needs documentation.
        var cache, flag;
        cache = this.val;
        flag = (parseArgs().cache === 'local');
        if (flag && isBrowser()) {
            puts('NOTE: The local cache methods are not stable yet.');
        }
        Q.init({
         // This object needs documentation.
            queue:  ((flag) ? cache.local_queue : cache.remote_queue),
            read:   ((flag) ? cache.local_read  : cache.remote_read),
            write:  ((flag) ? cache.local_write : cache.remote_write)
        });
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function needs documentation.
        var count, ms;
        count = 1;
        ms = function () {
         // This function throttles the polling frequency dynamically as a
         // function of response time. It's still experimental, though, so
         // I hard-coded it to the original constant for now ;-)
            return 1000;
        };
        if (parseArgs().volunteer === true) {
            puts('Thanks for volunteering!');
            (function f() {
             // This function "daemonizes" a 'volunteer' process :-)
                var first, task;
                first = true;
                task = Q.volunteer();
                task.onerror = function (message) {
                 // This function needs documentation.
                    if (first) {
                        first = false;
                        count += 1;
                        setTimeout(f, ms());
                        if (message instanceof Error) {
                            puts('Error:', message.message);
                        } else if (message !== 'Nothing to do ...') {
                            puts('Error:', message);
                        } else {
                            puts('(pulse: ' + count + ')');
                        }
                    }
                    return;
                };
                task.onready = function (evt) {
                 // This function needs documentation.
                    if (first) {
                        first = false;
                        count += 1;
                        setTimeout(f, ms());
                        puts(task.val.status + ':', task.key);
                    }
                    return evt.exit();
                };
                return;
            }());
        } else {
            puts('Thanks for testing -- I really appreciate your input!');
            (function f(x) {
             // This function needs documentation.
                //puts('(pulse: ' + count + ')');
                count += 1;
                x.comm();
                setTimeout(f, ms(), x);
                return;
            }(avar()));
        }
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function needs documentation.
        /*jslint node: true */
        if ((isNodejs() === false) || (parseArgs().repl !== true)) {
            return evt.exit();
        }
        require('repl').start.apply(this, [
         // See documentation at http://nodejs.org/docs/latest/api/repl.html.
            'qmachine> ',
            undefined,
            undefined,
            true,
            true
        ]);
        return evt.exit();
    };

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (outer_scope) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : outer_scope;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
