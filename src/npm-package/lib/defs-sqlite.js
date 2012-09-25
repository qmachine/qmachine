//- JavaScript source code

//- defs-sqlite.js ~~
//
//  NOTE: SQL is _not_ a particular strength of mine, and I appreciate input!
//
//                                                      ~~ (c) SRW, 25 Sep 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var Q, avar, config, db, fs, get_box_key, get_box_status,
        get_static_content, init, post_box_key, sqlite3;

 // Definitions

    Q = require('quanah');

    avar = Q.avar;

    fs = require('fs');

    get_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, key, sql;
        box = params[0];
        key = params[1];
        sql = 'SELECT * FROM avars ' +
                'WHERE box = "' + box + '" AND key = "' + key + '"';
        db.val.get(sql, function (err, row) {
         // This function needs documentation.
            if ((err !== null) || (row === undefined)) {
                row = {};
            }
            response.writeHead(200, {'Content-Type': 'application/json'});
            if (row.status === null) {
                delete row.status;
            }
            if (row.val !== undefined) {
                row.val = JSON.parse(row.val);
            }
            response.write(JSON.stringify(row));
            response.end();
            return;
        });
        return;
    };

    get_box_status = function (request, response, params) {
     // This function needs documentation.
        var box, status, sql;
        box = params[0];
        status = params[1];
        // ...
        sql = 'SELECT key FROM avars ' +
                'WHERE box = "' + box + '" AND status = "' + status + '"';
        db.val.all(sql, function (err, rows) {
         // This function needs documentation.
            if ((err !== null) || (rows === undefined)) {
                rows = [];
            }
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify(rows.map(function (row) {
             // This function needs documentation.
                return row.key;
            })));
            response.end();
            return;
        });
        return;
    };

    get_static_content = function (request, response, params) {
     // This function needs documentation.
        var sql, target;
        target = request.url.split('?')[0];
        if (target === '/') {
            target = '/index.html';
        }
        sql = 'SELECT file FROM public_html WHERE name = "' + target + '"';
        db.val.get(sql, function (err, row) {
         // This function needs documentation.
            if ((err !== null) || (row === undefined)) {
                response.writeHead(444);
                response.end();
                return;
            }
            var extension, headers;
            extension = target.split('.').pop();
            headers = {
             // ...
            };
            switch (extension) {
            case 'appcache':
                headers['Content-Type'] = 'text/cache-manifest';
                break;
            case 'css':
                headers['Content-Type'] = 'text/css';
                break;
            case 'html':
                headers['Content-Type'] = 'text/html';
                break;
            case 'ico':
                headers['Content-Type'] = 'image/x-icon';
                break;
            case 'jpg':
                headers['Content-Type'] = 'image/jpeg';
                break;
            case 'js':
             // NOTE: Should I use 'application/javascript' instead?
                headers['Content-Type'] = 'text/javascript';
                break;
            case 'json':
                headers['Content-Type'] = 'application/json';
                break;
            case 'manifest':
                headers['Content-Type'] = 'text/cache-manifest';
                break;
            case 'png':
                headers['Content-Type'] = 'image/png';
                break;
            case 'txt':
                headers['Content-Type'] = 'text/plain';
                break;
            default:
                headers['Content-Type'] = 'application/octet-stream';
            }
            response.writeHead(200, headers);
            response.write(row.file);
            response.end();
            return;
        });
        return;
    };

    init = function (options) {
     // This function needs documentation.
        config = options;
        db = Q.avar();
        db.onerror = function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            db.val = new sqlite3.cached.Database('main.db', function (err) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                return evt.exit();
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            var code;
            code = 'CREATE TABLE IF NOT EXISTS avars ' +
                    '(box TEXT, key TEXT, status TEXT, val TEXT)';
            db.val.run(code, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                return evt.exit();
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            var code;
            code = 'CREATE TABLE IF NOT EXISTS public_html ' +
                    '(name TEXT, file BLOB)';
            db.val.run(code, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                return evt.exit();
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            var code;
            code = 'CREATE UNIQUE INDEX IF NOT EXISTS x ON avars (box, key)';
            this.val.run(code, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                return evt.exit();
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            var code;
            code = 'CREATE UNIQUE INDEX IF NOT EXISTS y ON public_html (name)';
            this.val.run(code, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                return evt.exit();
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            var public_html = 'public_html/';
            fs.exists(public_html, function (exists) {
             // This function needs documentation.
                if (exists === false) {
                    return evt.exit();
                }
                fs.readdir(public_html, function (err, files) {
                 // This function needs documentation.
                    if (err !== null) {
                        return evt.fail(err);
                    }
                    var remaining = files.length;
                    files.forEach(function (name) {
                     // This function needs documentation.
                        fs.readFile(public_html + name, function (err, file) {
                         // This function needs documentation.
                            if (err !== null) {
                                return evt.fail(err);
                            }
                            var sql;
                            sql = 'INSERT OR REPLACE INTO public_html ' +
                                    '(name, file) VALUES (?, ?)';
                            db.val.run(sql, '/' + name, file, function (err) {
                             // This function needs documentation.
                                if (err !== null) {
                                    return evt.fail(err);
                                }
                                remaining -= 1;
                                if (remaining === 0) {
                                    return evt.exit();
                                }
                                return;
                            });
                            return;
                        });
                        return;
                    });
                    return;
                });
                return;
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            console.log('Database is ready.');
            return evt.exit();
        };
        return;
    };

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, key, sql, temp;
        box = params[0];
        key = params[1];
        sql = 'INSERT OR REPLACE INTO avars VALUES ($box, $key, $status, $val)';
        temp = [];
        request.on('data', function (chunk) {
         // This function needs documentation.
            temp.push(chunk.toString());
            return;
        });
        request.on('end', function () {
         // This function needs documentation.
            var body = JSON.parse(temp.join(''));
            db.val.run(sql, {
                $box:       body.box,
                $key:       body.key,
                $status:    body.status,
                $val:       JSON.stringify(body.val)
            });
            response.writeHead(201, {'Content-Type': 'text/plain'});
            response.write('Hooray!');
            response.end();
            return;
        });
        return;
    };

    sqlite3 = require('sqlite3');

 // Out-of-scope definitions

    exports.get_box_key = get_box_key;

    exports.get_box_status = get_box_status;

    exports.get_static_content = get_static_content;

    exports.init = init;

    exports.post_box_key = post_box_key;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
