//- JavaScript source code

//- defs-sqlite.js ~~
//
//  NOTE: SQL is _not_ a particular strength of mine, and I appreciate input!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 22 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var cluster, sqlite;

 // Definitions

    cluster = require('cluster');

    sqlite = require('sqlite3');

 // Out-of-scope definitions

    exports.api = function (connection_string) {
     // This function needs documentation.
        if ((connection_string === ':memory:') && (cluster.isMaster)) {
            console.warn('\n' + [
                'WARNING: In-memory SQLite databases do not provide',
                'shared persistent storage because each worker will',
                'create and use its own individual database. Thus,',
                'the API server may behave erratically if you are',
                'using multiple workers.'
            ].join(' ').replace(/([\w\-\:\,\.\s]{65,79})\s/g, "$1\n") + '\n');
        }
        var db, get_box_key, get_box_status, post_box_key;
        db = new sqlite.cached.Database(connection_string, function (err) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            if (cluster.isWorker) {
                return;
            }
            var lines;
            lines = [
                'CREATE TABLE IF NOT EXISTS avars (',
                '   box TEXT NOT NULL,',
                '   key TEXT NOT NULL,',
                '   status TEXT,',
                '   val TEXT NOT NULL,',
                '   PRIMARY KEY (box, key)',
                ')'
            ];
            db.run(lines.join('\n'), function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                console.log('API: SQLite storage is ready.');
                return;
            });
            return;
        });
        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            var box, key, sql;
            box = params[0];
            key = params[1];
            sql = 'SELECT * FROM avars WHERE box = $box AND key = $key';
            db.get(sql, {$box: box, $key: key}, function (err, row) {
             // This function needs documentation.
                if ((err !== null) || (row === undefined)) {
                    return callback(err, row);
                }
                if (row.status === null) {
                    delete row.status;
                }
                if (row.val !== undefined) {
                    row.val = JSON.parse(row.val);
                }
                return callback(null, row);
            });
            return;
        };
        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            var box, sql, status;
            box = params[0];
            sql = 'SELECT key FROM avars WHERE box = $box AND status = $status';
            status = params[1];
            db.all(sql, {$box: box, $status: status}, function (err, rows) {
             // This function needs documentation.
                if ((err !== null) || (rows === undefined)) {
                    return callback(err, rows);
                }
                return callback(null, rows.map(function (row) {
                 // This function needs documentation.
                    return row.key;
                }));
            });
            return;
        };
        post_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            var temp = [];
            request.on('data', function (chunk) {
             // This function needs documentation.
                temp.push(chunk.toString());
                return;
            });
            request.on('end', function () {
             // This function needs documentation.
                var body, box, key, lines, values;
                body = JSON.parse(temp.join(''));
                box = params[0];
                key = params[1];
                lines = [
                    'INSERT OR REPLACE INTO avars (box, key, status, val)',
                    '   VALUES ($box, $key, $status, $val)'
                ];
                values = {
                    $box:       body.box,
                    $key:       body.key,
                    $status:    body.status,
                    $val:       JSON.stringify(body.val)
                };
                if ((body.box !== box) || (body.key !== key)) {
                    return callback('Evil `post_box_key` denied', undefined);
                }
                db.run(lines.join('\n'), values, callback);
                return;
            });
            return;
        };
        return {
            get_box_key:    get_box_key,
            get_box_status: get_box_status,
            post_box_key:   post_box_key
        };
    };

    exports.www = function (connection_string) {
     // This function needs documentation.
        var db, get_static_content, set_static_content;
        db = new sqlite.cached.Database(connection_string, function (err) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            if ((cluster.isWorker) && (connection_string !== ':memory:')) {
                return;
            }
            var lines;
            lines = [
                'CREATE TABLE IF NOT EXISTS public_html (',
                '   name TEXT NOT NULL,',
                '   file BLOB NOT NULL,',
                '   PRIMARY KEY (name)',
                ')'
            ];
            db.run(lines.join('\n'), function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                console.log('WWW: SQLite storage is ready.');
                return;
            });
            return;
        });
        get_static_content = function (request, response, params, callback) {
         // This function needs documentation.
            var name, sql;
            name = params[0];
            sql = 'SELECT file FROM public_html WHERE name = $name';
            db.get(sql, {$name: name}, function (err, row) {
             // This function needs documentation.
                if ((err !== null) || (row === undefined)) {
                    return callback(err, row);
                }
                return callback(null, row.file);
            });
            return;
        };
        set_static_content = function (name, file, callback) {
         // This function needs documentation.
            if ((cluster.isWorker) && (connection_string !== ':memory:')) {
                return;
            }
            var lines;
            lines = [
                'INSERT OR REPLACE INTO public_html (name, file)',
                '   VALUES (?, ?)'
            ];
            db.run(lines.join('\n'), '/' + name, file, callback);
            return;
        };
        return {
            get_static_content: get_static_content,
            set_static_content: set_static_content
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
