//- JavaScript source code

//- defs-postgres.js ~~
//
//  NOTE: SQL is _not_ a particular strength of mine, and I appreciate input!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 23 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var cluster, pg;

 // Definitions

    cluster = require('cluster');

    pg = require('pg').native;

 // Out-of-scope definitions

    exports.api = function (connection_string) {
     // This function needs documentation.
        var get_box_key, get_box_status, post_box_key;
        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var x = 'SELECT * FROM avars WHERE box = $1 AND key = $2';
                client.query(x, params, function (err, results) {
                 // This function needs documentation.
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    var row = (results.rows.length < 1) ? {} : results.rows[0];
                    if (row.status === null) {
                        delete row.status;
                    }
                    if (row.val !== undefined) {
                        row.val = JSON.parse(row.val);
                    }
                    return callback(null, row);
                });
                return;
            });
            return;
        };
        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var x = 'SELECT key FROM avars WHERE box = $1 AND status = $2';
                client.query(x, params, function (err, results) {
                 // This function needs documentation.
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
        post_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            var temp;
            temp = [];
            request.on('data', function (chunk) {
             // This function needs documentation.
                temp.push(chunk.toString());
                return;
            });
            request.on('end', function () {
             // This function needs documentation.
                var body = JSON.parse(temp.join(''));
                body.val = JSON.stringify(body.val);
                pg.connect(connection_string, function (err, client) {
                 // This function needs documentation.
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    var args, sql;
                    args = [body.box, body.key, body.status, body.val];
                    sql = 'SELECT upsert_avar($1, $2, $3, $4)';
                    if ((body.box !== params[0]) || (body.key !== params[1])) {
                        return callback('Evil post_box_key denied', undefined);
                    }
                    client.query(sql, args, callback);
                    return;
                });
                return;
            });
            request.on('error', callback);
            return;
        };
        if (cluster.isMaster) {
            pg.connect(connection_string, function (err, client) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                var lines;
                lines = [
                    'CREATE TABLE IF NOT EXISTS avars (',
                    '   box TEXT NOT NULL,',
                    '   key TEXT NOT NULL,',
                    '   status TEXT,',
                    '   val TEXT NOT NULL,',
                    '   UNIQUE (box, key)',
                    ');',
                    'CREATE OR REPLACE FUNCTION upsert_avar' +
                        '(b2 TEXT, k2 TEXT, s2 TEXT, v2 TEXT) RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE avars',
                    '           SET status = s2, val = v2',
                    '           WHERE box = b2 AND key = k2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO avars (box, key, status, val)',
                    '               VALUES (b2, k2, s2, v2);',
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
            get_box_key:    get_box_key,
            get_box_status: get_box_status,
            post_box_key:   post_box_key
        };
    };

    exports.www = function (connection_string) {
     // This function needs documentation.
        var get_static_content, set_static_content;
        get_static_content = function (request, response, params, callback) {
         // This function needs documentation.
            pg.connect(connection_string, function (err, client) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var sql = 'SELECT file FROM public_html WHERE name = $1';
                client.query(sql, params, function (err, results) {
                 // This function needs documentation.
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    if ((results === undefined) || (results.rows.length < 1)) {
                        return callback('Resource not found.', undefined);
                    }
                    return callback(null, results.rows[0].file);
                });
                return;
            });
            return;
        };
        set_static_content = function (name, file, callback) {
         // This function needs documentation.
            if (cluster.isWorker) {
                return;
            }
            pg.connect(connection_string, function (err, client) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var args = ['/' + name, '\\x' + file.toString('hex')];
                client.query('SELECT upsert_file($1, $2)', args, callback);
                return;
            });
            return;
        };
        if (cluster.isMaster) {
            pg.connect(connection_string, function (err, client) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                var lines;
                lines = [
                    'CREATE TABLE IF NOT EXISTS public_html (',
                    '   name TEXT NOT NULL,',
                    '   file BYTEA NOT NULL,',
                    '   UNIQUE (name)',
                    ');',
                    'CREATE OR REPLACE FUNCTION upsert_file' +
                        '(n2 TEXT, f2 BYTEA) RETURNS VOID AS',
                    '$$',
                    'BEGIN',
                    '   LOOP',
                    '       UPDATE public_html SET file = f2 WHERE name = n2;',
                    '       IF found THEN',
                    '           RETURN;',
                    '       END IF;',
                    '       BEGIN',
                    '           INSERT INTO public_html (name, file)',
                    '               VALUES (n2, f2);',
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
                    if (err !== null) {
                        throw err;
                    }
                    console.log('WWW: Postgres storage is ready.');
                    return;
                });
                return;
            });
        }
        return {
            get_static_content: get_static_content,
            set_static_content: set_static_content
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
