//- JavaScript source code

//- defs-postgres.js ~~
//
//  NOTE: SQL is _not_ a particular strength of mine, and I appreciate input!
//
//                                                      ~~ (c) SRW, 28 Sep 2012
//                                                  ~~ last updated 01 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var Q, avar, config, db, fs, get_box_key, get_box_status,
        get_static_content, init, pg, post_box_key;

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
                "WHERE box = '" + box + "' AND key = '" + key + "'";
        db.val.query(sql, function (err, results) {
         // This function needs documentation.
            var row;
            if (err !== null) {
                console.error(err);
                row = {};
            } else if (results.rows.length === 0) {
                row = {};
            } else {
                row = results.rows[0];
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
        var box, status, pgsql;
        box = params[0];
        status = params[1];
        pgsql = 'SELECT key FROM avars ' +
                "WHERE box = '" + box + "' AND status = '" + status + "'";
        db.val.query(pgsql, function (err, results) {
         // This function needs documentation.
            if ((err !== null) || (results === undefined)) {
                results = {rows: []};
            }
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify(results.rows.map(function (row) {
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
        sql = "SELECT file FROM public_html WHERE name = '" + target + "'";
        db.val.query(sql, function (err, results) {
         // This function needs documentation.
            if ((err !== null) || (results === undefined) ||
                    ((results.rows.length === 0))) {
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
            response.write(results.rows[0].file);
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
            if ((db.val instanceof Object) && (db.val.hasOwnProperty('end'))) {
                db.val.end();
            }
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            db.val = new pg.Client(config.postgres);
            db.val.on('connect', function () {
             // This function needs documentation.
                // ...
                return evt.exit();
            });
            db.val.on('error', function (err) {
             // This function needs documentation.
                return evt.fail(err);
            });
            db.val.connect();
            return;
        };
        db.onready = function (evt) {
         // This function assumes you have already preconfigured your Postgres
         // instance so that the appropriate databases already exist. I may or
         // may not automate the safety code for that part in the future ...
            var pgsql;
            pgsql = 'CREATE TABLE IF NOT EXISTS avars (' +
                    '   box TEXT NOT NULL,' +
                    '   key TEXT NOT NULL,' +
                    '   status TEXT,'       +
                    '   val TEXT NOT NULL,' +
                    '   UNIQUE (box, key)'  +
                    ')';
            db.val.query(pgsql, function (err) {
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
            var pgsql;
            pgsql = 'CREATE TABLE IF NOT EXISTS public_html (' +
                    '   name TEXT NOT NULL,'    +
                    '   file BYTEA NOT NULL,'   +
                    '   UNIQUE (name)'          +
                    ')';
            db.val.query(pgsql, function (err) {
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
            var pgsql;
            pgsql = [
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
            db.val.query(pgsql.join('\n'), function (err) {
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
            var pgsql;
            pgsql = [
                'CREATE OR REPLACE FUNCTION upsert_file',
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
            db.val.query(pgsql.join('\n'), function (err) {
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
            var public_html = process.cwd() + '/public_html/';
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
                            var args, callback, pgsql;
                            args = ['/' + name, '\\x' + file.toString('hex')];
                            callback = function (err) {
                             // This function needs documentation.
                                if (err !== null) {
                                    return evt.fail(err);
                                }
                                remaining -= 1;
                                if (remaining === 0) {
                                    return evt.exit();
                                }
                                return;
                            };
                            pgsql = 'SELECT upsert_file($1, $2)';
                            db.val.query(pgsql, args, callback);
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

    pg = require('pg').native;

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        if ((request.headers.hasOwnProperty('content-length') === false) ||
                (request.headers['content-length'] > config.max_fu_size)) {
         // Either the user is using incorrect headers or he/she is uploading
         // a file that is too big. Don't fool with it either way. QMachine is
         // not a free hard drive for people who are too cheap to buy storage,
         // because we didn't buy storage, either ;-)
            response.writeHead(444);
            response.end();
            return;
        }
        var box, key, sql, temp;
        box = params[0];
        key = params[1];
        sql = 'SELECT upsert_avar($1, $2, $3, $4)';
        temp = [];
        request.on('data', function (chunk) {
         // This function needs documentation.
            temp.push(chunk.toString());
            return;
        });
        request.on('end', function () {
         // This function needs documentation.
            var callback, x;
            callback = function (err, results) {
             // This function needs documentation.
                if (err !== null) {
                    response.writeHead(444);
                    response.end();
                    return;
                }
                response.writeHead(201, {'Content-Type': 'text/plain'});
                response.write('Hooray!');
                response.end();
                return;
            };
            x = JSON.parse(temp.join(''));
            x.val = JSON.stringify(x.val);
            db.val.query(sql, [x.box, x.key, x.status, x.val], callback);
            return;
        });
        return;
    };

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
