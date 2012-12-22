//- JavaScript source code

//- defs-sqlite.js ~~
//
//  NOTE: SQL is _not_ a particular strength of mine, and I appreciate input!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 18 Dec 2012

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

    module.exports = function (options) {
     // This function needs documentation.

        var collect_garbage, db, exp_date, get_box_key, get_box_status,
            post_box_key;

        collect_garbage = function () {
         // This function needs documentation.
            var lines, values;
            lines = 'DELETE FROM avars WHERE (exp_date < $now)';
            values = {
                $now: Math.ceil(Date.now() / 1000)
            };
            db.run(lines, values, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                console.log('Finished collecting garbage.');
                return;
            });
            return;
        };

        db = new sqlite.cached.Database(options.sqlite, function (err) {
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
                '   body TEXT NOT NULL,',
                '   box_key TEXT NOT NULL,',
                '   box_status TEXT,',
                '   exp_date INTEGER NOT NULL,',
                '   key TEXT,',
                '   PRIMARY KEY (box_key)',
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

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil((Date.now() / 1000) + options.avar_ttl);
        };

        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            var box_key, sql;
            box_key = params[0] + '&' + params[1];
            sql = 'SELECT body FROM avars WHERE box_key = $box_key';
            db.get(sql, {$box_key: box_key}, function (err, row) {
             // This function needs documentation.
                if (err !== null) {
                    if (err.errno === 5) {
                        process.nextTick(function () {
                         // This function needs documentation.
                            get_box_key(request, response, params, callback);
                            return;
                        });
                        return;
                    }
                    return callback(err, row);
                }
                return callback(null, (row === undefined) ? row : row.body);
            });
            return;
        };

        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            var box_status, sql;
            box_status = params[0] + '&' + params[1];
            sql = 'SELECT key FROM avars WHERE box_status = $box_status';
            db.all(sql, {$box_status: box_status}, function (err, rows) {
             // This function needs documentation.
                if (err !== null) {
                    if (err.errno === 5) {
                        process.nextTick(function () {
                         // This function needs documentation.
                            get_box_status(request, response, params, callback);
                            return;
                        });
                        return;
                    }
                    return callback(err, rows);
                }
                if (rows === undefined) {
                    return callback(null, rows);
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
            var lines, values;
            if (params.length === 4) {
                lines = [
                    'INSERT OR REPLACE INTO avars ' +
                            '(body, box_key, box_status, exp_date, key)',
                    '   VALUES ($body, ' +
                            '   $box_key,' +
                            '   $box_status,' +
                            '   $exp_date,' +
                            '   $key)'
                ];
                values = {
                    $body:          params[3],
                    $box_key:       params[0] + '&' + params[1],
                    $box_status:    params[0] + '&' + params[2],
                    $exp_date:      exp_date(),
                    $key:           params[1]
                };
            } else {
                lines = [
                    'INSERT OR REPLACE INTO avars ' +
                            '(body, box_key, exp_date)',
                    '   VALUES ($body, $box_key, $exp_date)'
                ];
                values = {
                    $body:          params[2],
                    $box_key:       params[0] + '&' + params[1],
                    $exp_date:      exp_date()
                };
            }
            db.run(lines.join('\n'), values, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    if (err.errno === 5) {
                        process.nextTick(function () {
                         // This function needs documentation.
                            post_box_key(request, response, params, callback);
                            return;
                        });
                        return;
                    }
                    return callback(err);
                }
                return callback(null);
            });
            return;
        };

        return {
            collect_garbage: collect_garbage,
            get_box_key: get_box_key,
            get_box_status: get_box_status,
            post_box_key: post_box_key
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
