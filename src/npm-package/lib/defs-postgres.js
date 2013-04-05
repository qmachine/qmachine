//- JavaScript source code

//- defs-postgres.js ~~
//
//  NOTE: SQL is _not_ a particular strength of mine, and I appreciate input!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 05 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 3, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var cluster, pg;

 // Definitions

    cluster = require('cluster');

    pg = require('pg');                 //- or, use `require('pg').native` ...

 // Out-of-scope definitions

    module.exports = function (options) {
     // This function needs documentation.

        var collect_garbage, connection_string, exp_date, get_box_key,
            get_box_status, post_box_key;

        collect_garbage = function () {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    done();
                    return;
                }
                var now, sql;
                now = Math.ceil(Date.now() / 1000);
                sql = 'DELETE FROM avars WHERE (exp_date < $1)';
                client.query(sql, [now], function (err) {
                 // This function n needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                    } else {
                        console.log('Finished collecting garbage.');
                    }
                    done();
                    return;
                });
                return;
            });
            return;
        };

        connection_string = options.postgres;

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil((Date.now() / 1000) + options.avar_ttl);
        };

        get_box_key = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, undefined);
                }
                var x = 'SELECT body FROM avars WHERE box_key = $1';
                client.query(x, [params.join('&')], function (err, results) {
                 // This function needs documentation.
                    done();
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    if (results.rows.length < 1) {
                        return callback(null, undefined);
                    }
                    return callback(null, results.rows[0].body);
                });
                return;
            });
            return;
        };

        get_box_status = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, undefined);
                }
                var x = 'SELECT key FROM avars WHERE box_status = $1';
                client.query(x, [params.join('&')], function (err, results) {
                 // This function needs documentation.
                    done();
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    var y = (results === undefined) ? {rows: []} : results;
                    return callback(null, y.rows.map(function (row) {
                     // This function needs documentation.
                        return row.key;
                    }));
                });
                return;
            });
            return;
        };

        post_box_key = function (params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    return callback(err, undefined);
                }
                var args, sql;
                if (params.length === 4) {
                    args = [
                        params[3],
                        params[0] + '&' + params[1],
                        params[0] + '&' + params[2],
                        exp_date(),
                        params[1]
                    ];
                    sql = 'SELECT upsert_task($1, $2, $3, $4, $5)';
                } else {
                    args = [
                        params[2],
                        params[0] + '&' + params[1],
                        exp_date()
                    ];
                    sql = 'SELECT upsert_avar($1, $2, $3)';
                }
                client.query(sql, args, function (err, results) {
                 // This function needs documentation.
                    done();
                    return callback(err, results);
                });
                return;
            });
            return;
        };

        if (cluster.isMaster) {
            pg.connect(connection_string, function (err, client, done) {
             // This function needs documentation.
                if (err !== null) {
                    done();
                    throw err;
                }
                var lines;
                lines = [
                    'CREATE TABLE IF NOT EXISTS avars (',
                    '   body TEXT NOT NULL,',
                    '   box_key TEXT NOT NULL,',
                    '   box_status TEXT,',
                    '   exp_date INTEGER NOT NULL,',
                    '   key TEXT,',     //- should this also be "NOT NULL"?
                    '   PRIMARY KEY (box_key)',
                    ');',
                    'CREATE OR REPLACE FUNCTION upsert_avar' +
                        '(b2 TEXT, bk2 TEXT, ed2 INTEGER) RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = b2,' +
                        '           box_status = NULL,' +
                        '           exp_date = ed2,' +
                        '           key = NULL',
                    '           WHERE box_key = bk2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars (body, box_key, exp_date)',
                    '               VALUES (b2, bk2, ed2);',
                    '           RETURN;',
                    '       EXCEPTION WHEN unique_violation THEN',
                    '       END;',
                    '   END LOOP;',
                    'END;',
                    '$$',
                    'LANGUAGE plpgsql;',
                    'CREATE OR REPLACE FUNCTION upsert_task' +
                        '(b2 TEXT, bk2 TEXT, bs2 TEXT, ed2 INTEGER, k2 TEXT)' +
                        'RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET body = b2,' +
                        '           box_status = bs2,' +
                        '           exp_date = ed2,' +
                        '           key = k2',
                    '           WHERE box_key = bk2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars ' +
                        '           (body, box_key, box_status, exp_date, key)',
                    '               VALUES (b2, bk2, bs2, ed2, k2);',
                    '           RETURN;',
                    '       EXCEPTION WHEN unique_violation THEN',
                    '       END;',
                    '   END LOOP;',
                    'END;',
                    '$$',
                    'LANGUAGE plpgsql;'
                ];
                client.query(lines.join('\n'), function (err, results) {
                 // This function needs documentation.
                    done();
                    if (err !== null) {
                        throw err;
                    }
                    console.log('API: Postgres storage is ready.');
                    return;
                });
                return;
            });
        }

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
