//- JavaScript source code

//- qmachine.js ~~
//                                                      ~~ (c) SRW, 10 Apr 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, browser_only, hOP, isBrowser, isFunction, isNodejs,
        mothership, nodejs_only, parseArgs, ply, puts, relaunch, setup,
        token;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    browser_only = function (f) {
     // This function needs documentation.
        return (isBrowser() === true) ? f : function (evt) {
         // This function needs documentation.
            return evt.exit();
        };
    };

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

    nodejs_only = function (f) {
     // This function needs documentation.
        return (isNodejs() === true) ? f : function (evt) {
         // This function needs documentation.
            return evt.exit();
        };
    };

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
                /*jslint regexp: true, unparam: true */
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
                 // This function needs documentation.
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
                        volunteer:  doc.getElementById('volunteer')
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
     // This function redefines itself during its first invocation.
        var tape;
        if (isBrowser() && (global.document.getElementById('tape') !== null)) {
         // This is a special definition that writes to #tape :-)
            tape = global.document.getElementById('tape');
            puts = function () {
             // This function writes to an HTML5 <div> called 'tape' :-)
                var post = global.document.createElement('div');
                post.innerHTML += Array.prototype.join.call(arguments, ' ');
                tape.insertBefore(post, tape.firstChild);
                return;
            };
        } else if (hOP(global, 'system') && isFunction(global.system.print)) {
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
        var base, y;
        if (isBrowser()) {
            base = global.location.protocol + '//' + global.location.hostname;
            y = [];
            if (base === mothership) {
                ply(obj).by(function (key, val) {
                 // This function needs documentation.
                    y.push(key + '=' + val);
                    return;
                });
                global.location.search = y.sort().join('&');
            }
        }
        return;
    };

    setup = avar({
     // This object needs documentation.
        val: {
            remote_queue:   null,
            remote_read:    null,
            remote_write:   null
        }
    });

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

    setup.onready = browser_only(function (evt) {
     // This function defines 'cache' methods for persistent remote storage
     // from a web browser client to http://qmachine.org, which uses CouchDB.
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
                href = mothership + '/jobs/' + token() + '?status=waiting';
                req = request();
                req.onreadystatechange = function () {
                 // This function needs documentation.
                    /*jslint unparam: true */
                    if (req.readyState === 4) {
                        if (req.status !== 200) {
                            return evt.fail(req.responseText);
                        }
                        y.val = JSON.parse(req.responseText);
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
                href = mothership + '/db/' + key + '?token=' + token();
                req = request();
                req.onreadystatechange = function () {
                 // This function needs documentation.
                    if (req.readyState === 4) {
                        if (req.status !== 200) {
                            return evt.fail(req.responseText);
                        }
                        if (req.responseText === 'null') {
                            return evt.fail('Remote missing: ' + href);
                        }
                        y.val = avar(req.responseText).val;
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
        cache.remote_write = function (key, val) {
         // This function writes files to http://qmachine.org with AJAX in a
         // web browser.
            var y = avar({key: key, val: val});
            y.onready = function (evt) {
             // This function needs documentation.
                var href, meta;
                href = mothership + '/db/';
                meta = avar({val: {id: undefined, rev: undefined}});
                meta.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                meta.onready = function (evt) {
                 // This function reads the revision number from CouchDB in
                 // such a way as to avoid 404 errors entirely because I can't
                 // figure out how to keep the error output from cluttering
                 // Chrome's developer console. A more efficient way would be
                 // to send a HEAD request like the Node.js client does, but
                 // efficiency isn't the goal here.
                    var req, url;
                    req = request();
                    url = mothership + '/meta/' + key + '?token=' + token();
                    req.onreadystatechange = function () {
                     // This function needs documentation.
                        if (req.readyState === 4) {
                            if (req.status === 200) {
                                meta.val = JSON.parse(req.responseText);
                                return evt.exit();
                            }
                            return evt.fail(req.responseText);
                        }
                        return;
                    };
                    req.open('GET', url, true);
                    req.send(null);
                    return;
                };
                meta.onready = function (evt) {
                 // This function sends an HTTP POST request.
                    /*jslint nomen: true */
                    var doc, req;
                    doc = {
                        '_id':  meta.val.id,
                        '_rev': meta.val.rev,
                        key:    key,
                        $avar:  JSON.stringify(y),
                        token:  token()
                    };
                    req = request();
                    if ((val !== null) && (val !== undefined) &&
                            (val.hasOwnProperty('status'))) {
                     // This simplifies Qmachine's 'queue' filter in CouchDB.
                        doc.status = val.status;
                    }
                    req.onreadystatechange = function () {
                     // NOTE: I switched it back to non-batch-mode for now.
                     //
                     // Normally, we would listen for a 201 "Created" status,
                     // but this function checks for a 202 "Accepted" status
                     // because we're using batch mode in CouchDB to speed up
                     // writes, which lets CouchDB save documents in memory
                     // and flush to disk in batches rather than requiring an
                     // 'fsync' for every single write operation.
                        if (req.readyState === 4) {
                            if (req.status !== 201) {
                                return evt.fail(req.responseText);
                            }
                            y.val = JSON.parse(req.responseText);
                            return evt.exit();
                        }
                        return;
                    };
                    req.open('POST', href, true);
                    req.setRequestHeader('Content-Type', 'application/json');
                    req.send(JSON.stringify(doc));
                    return;
                };
                meta.onready = function (meta_evt) {
                 // This function needs documentation.
                    meta_evt.exit();
                    return evt.exit();
                };
                return;
            };
            return y;
        };
        return evt.exit();
    });

    setup.onready = nodejs_only(function (evt) {
     // This function defines 'cache' methods for persistent remote storage
     // from a Node.js client to http://qmachine.org, which uses CouchDB.
        /*jslint node: true */
        var cache, http, url;
        cache = this.val;
        http = require('http');
        url = require('url');
        cache.remote_queue = function () {
         // This function gets the queue from http://qmachine.org with Node.js.
            var href, y;
            href = mothership + '/jobs/' + token() + '?status=waiting';
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
                        /*jslint unparam: true */
                        y.val = JSON.parse(txt.join(''));
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
                var href = mothership + '/db/' + key + '?token=' + token();
                http.get(url.parse(href), function (response) {
                 // This function needs documentation.
                    var txt = [];
                    response.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    }).on('end', function () {
                     // This function needs documentation.
                        var temp = txt.join('');
                        if (temp === 'null') {
                            return evt.fail('Remote missing: ' + href);
                        }
                        y.val = avar(temp).val;
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
        cache.remote_write = function (key, val) {
         // This function writes files to http://qmachine.org with Node.js.
            var y = avar({key: key, val: val});
            y.onready = function (evt) {
             // This function needs documentation.
                var href, meta;
                href = mothership + '/db/';
                meta = avar({val: {id: undefined, rev: undefined}});
                meta.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                meta.onready = function (evt) {
                 // This function needs documentation.
                    var href, options;
                    href = mothership + '/meta/' + key + '?token=' + token();
                    options = url.parse(href);
                    http.get(options, function (response) {
                     // This function needs documentation.
                        var txt = [];
                        response.on('data', function (chunk) {
                         // This function needs documentation.
                            txt.push(chunk.toString());
                            return;
                        }).on('end', function () {
                         // This function needs documentation.
                            meta.val = JSON.parse(txt.join(''));
                            return evt.exit();
                        });
                        return;
                    }).on('error', function (err) {
                     // This function needs documentation.
                        return evt.fail(err);
                    });
                    return;
                };
                meta.onready = function (evt) {
                 // This function needs documentation.
                    /*jslint nomen: true */
                    var doc, options, req;
                    doc = {
                        '_id':  meta.val.id,
                        '_rev': meta.val.rev,
                        key:    key,
                        $avar:  JSON.stringify(y),
                        token:  token()
                    };
                    options = url.parse(href);
                    options.method = 'POST';
                    if (hOP(val, 'status')) {
                        doc.status = val.status;
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
                    req.setHeader('Content-Type', 'application/json');
                    req.write(JSON.stringify(doc));
                    req.end();
                    return;
                };
                meta.onready = function (meta_evt) {
                 // This function needs documentation.
                    meta_evt.exit();
                    return evt.exit();
                };
                return;
            };
            return y;
        };
        return evt.exit();
    });

    setup.onready = browser_only(function (evt) {
     // This function configures the browser's interactive session.
        var doc;
        token();
        if (global.hasOwnProperty('document')) {
         // There has GOT to be a better way -- jQuery, perhaps?
            doc = global.document;
            if (doc.getElementById('volunteer') !== null) {
                doc.getElementById('volunteer').onclick = function () {
                 // This function needs documentation.
                    return relaunch({volunteer: this.checked});
                };
            }
        }
        return evt.exit();
    });

    setup.onready = function (evt) {
     // This function needs documentation.
        var cache = this.val;
        Q.init({
         // Currently, I have removed the 'local_*' filesystem wrappers to
         // keep things simple as I prepare some manuscripts for submission
         // to academic journals.
            queue:  cache.remote_queue,
            read:   cache.remote_read,
            write:  cache.remote_write
        });
        return evt.exit();
    };

    setup.onready = function (evt) {
     // This function needs documentation.
        if (isFunction(global.setTimeout) === false) {
            return evt.exit();
        }
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
                        global.setTimeout(f, ms());
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
                        global.setTimeout(f, ms());
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
                x.revive();
                global.setTimeout(f, ms(), x);
                return;
            }(avar()));
        }
        return evt.exit();
    };

    setup.onready = nodejs_only(function (evt) {
     // This function needs documentation.
        /*jslint node: true */
        var args, session;
        args = parseArgs();
        if (args.repl !== true) {
            return ((args.volunteer !== true) ? global.process : evt).exit();
        }
        session = require('repl').start.apply(this, [
         // See documentation at http://nodejs.org/docs/latest/api/repl.html.
            'qmachine> ',
            undefined,
            undefined,
            true,
            true
        ]);
        session.context.quit = global.process.exit;
        return evt.exit();
    });

    setup.onready = browser_only(function (evt) {
     // This function adds user interface elements to the webpage that prompt
     // the user to install the Chrome app if appropriate.
        if ((mothership !== 'http://qmachine.org')              ||
                (global.hasOwnProperty('chrome') === false)     ||
                (global.chrome.app.isInstalled === true)        ||
                (global.hasOwnProperty('document') === false)   ||
                (global.location.protocol !== 'http:')          ||
                (global.location.hostname !== 'qmachine.org')) {
         // These are obviously cases for which a button is inappropriate.
         // Additionally, I need to find out if Google's Chrome Frame will
         // cause this button to appear in Internet Explorer and whether it
         // actually allows you to install the hosted app somehow into IE ...
            return evt.exit();
        }
     // NOTE: I'm having trouble skipping the following code if the app has
     // already been installed. Perhaps it's an issue of hosted vs. packaged?
        var button = global.document.createElement('button');
        button.innerHTML = 'Add to Chrome';
        button.className = 'do_not_print';
        button.onclick = function () {
         // This function needs documentation.
            global.chrome.webstore.install();
            return;
        };
        global.document.body.appendChild(button);
        return evt.exit();
    });

    setup.onready = browser_only(function (evt) {
     // This function needs documentation.
        if (global.hasOwnProperty('console')) {
            puts('Open the console to begin an interactive session :-)');
        }
        return evt.exit();
    });

    setup.onready = browser_only(function (evt) {
     // This function needs documentation.
        var ok;
        if (global.document.getElementById('tape') !== null) {
            ok = global.document.createElement('span');
            ok.innerHTML = ' OK.';
            //ok.style.color = 'green';
            global.document.getElementById('tape').appendChild(ok);
        } else {
            puts('Loading ... OK.');
        }
        return evt.exit();
    });

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
