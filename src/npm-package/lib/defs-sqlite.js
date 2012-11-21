//- JavaScript source code

//- defs-sqlite.js ~~
//
//  NOTE: SQL is _not_ a particular strength of mine, and I appreciate input!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 21 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var fs, get_box_key, get_box_status, get_static_content, init, mime_types,
        post_box_key, set_static_content, sqlite3;

 // Definitions

    fs = require('fs');

    get_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, db, key, sql;
        box = params[0];
        db = this;
        key = params[1];
        sql = 'SELECT * FROM avars WHERE box = $box AND key = $key';
        db.get(sql, {$box: box, $key: key}, function (err, row) {
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
        var box, db, status, sql;
        box = params[0];
        db = this;
        status = params[1];
        sql = 'SELECT key FROM avars WHERE box = $box AND status = $status';
        db.all(sql, {$box: box, $status: status}, function (err, rows) {
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
        var db, name, sql;
        db = this;
        name = request.url.split('?')[0];
        if (name === '/') {
            name = '/index.html';
        }
        sql = 'SELECT file FROM public_html WHERE name = $name';
        db.get(sql, {$name: name}, function (err, row) {
         // This function needs documentation.
            if ((err !== null) || (row === undefined)) {
                response.writeHead(444);
                response.end();
                return;
            }
            var extension, headers;
            extension = name.split('.').pop();
            headers = {
                'Content-Type': 'application/octet-stream'
            };
            if (mime_types.hasOwnProperty(extension)) {
                headers['Content-Type'] = mime_types[extension];
            }
            response.writeHead(200, headers);
            response.write(row.file);
            response.end();
            return;
        });
        return;
    };

    init = function (path_to_db_file) {
     // This function needs documentation.
        var create_db, create_tables, db, ready;
        create_db = function () {
         // This function needs documentation.
            var db;
            db = new sqlite3.cached.Database(path_to_db_file, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                create_tables();
                return;
            });
            return db;
        };
        create_tables = function () {
         // This function needs documentation.
            var code1, code2;
            code1 = 'CREATE TABLE IF NOT EXISTS avars (' +
                    '   box TEXT NOT NULL,'     +
                    '   key TEXT NOT NULL,'     +
                    '   status TEXT,'           +
                    '   val TEXT NOT NULL,'     +
                    '   PRIMARY KEY (box, key)' +
                    ')';
            code2 = 'CREATE TABLE IF NOT EXISTS public_html (' +
                    '   name TEXT NOT NULL,'    +
                    '   file BLOB NOT NULL,'    +
                    '   PRIMARY KEY (name)'     +
                    ')';
            db.run(code1, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                db.run(code2, function (err) {
                 // This function needs documentation.
                    if (err !== null) {
                        throw err;
                    }
                    ready = true;
                    return;
                });
                return;
            });
            return;
        };
        db = create_db();
        ready = false;
        return {
            get_box_key: function (request, response, params) {
             // This function needs documentation.
                return get_box_key.call(db, request, response, params);
            },
            get_box_status: function (request, response, params) {
             // This function needs documentation.
                return get_box_status.call(db, request, response, params);
            },
            get_static_content: function (request, response, params) {
             // This function needs documentation.
                return get_static_content.call(db, request, response, params);
            },
            post_box_key: function (request, response, params) {
             // This function needs documentation.
                return post_box_key.call(db, request, response, params);
            },
            set_static_content: function f(public_html) {
             // This function needs documentation.
                if (ready === true) {
                    set_static_content.call(db, public_html);
                } else {
                    process.nextTick(function () {
                     // This function needs documentation.
                        f(public_html);
                        return;
                    });
                }
                return;
            }
        };
    };

    mime_types = require('./mime-types');

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, db, key, sql, temp;
        box = params[0];
        db = this;
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
            db.run(sql, {
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

    set_static_content = function (public_html) {
     // This function needs documentation.
        if (typeof public_html !== 'string') {
            public_html = 'public_html/';
        }
        var db = this;
        fs.exists(public_html, function (exists) {
         // This function needs documentation.
            if (exists === false) {
                console.warn('No "' + public_html + '" directory found.');
                return;
            }
            fs.readdir(public_html, function (err, files) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                var remaining = files.length;
                files.forEach(function (name) {
                 // This function needs documentation.
                    fs.readFile(public_html + name, function (err, file) {
                     // This function needs documentation.
                        if (err !== null) {
                            throw err;
                        }
                        var sql;
                        sql = 'INSERT OR REPLACE INTO public_html ' +
                                '(name, file) VALUES (?, ?)';
                        db.run(sql, '/' + name, file, function (err) {
                         // This function needs documentation.
                            if (err !== null) {
                                throw err;
                            }
                            remaining -= 1;
                            if (remaining === 0) {
                                console.log('Static content is ready.');
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

    sqlite3 = require('sqlite3');

 // Out-of-scope definitions

    exports.init = init;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
