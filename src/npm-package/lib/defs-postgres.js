//- JavaScript source code

//- defs-postgres.js ~~
//
//  KNOWN ISSUES:
//
//  The following call causes a "tuple concurrently updated" error:
//
//      connection_string = 'postgres://localhost:5432/' + process.env.USER;
//      qm.launch_server({
//          api: {
//              postgres:   connection_string
//          },
//          www: {
//              postgres:   connection_string
//          }
//      });
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 10 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var fs, get_box_key, get_box_status, get_static_content, init, mime_types,
        pg, post_box_key, set_static_content;

 // Definitions

    fs = require('fs');

    get_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, db, key, sql;
        box = params[0];
        db = this;
        key = params[1];
        sql = 'SELECT * FROM avars ' +
                "WHERE box = '" + box + "' AND key = '" + key + "'";
        db.query(sql, function (err, results) {
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
        var box, db, status, pgsql;
        box = params[0];
        db = this;
        status = params[1];
        pgsql = 'SELECT key FROM avars ' +
                "WHERE box = '" + box + "' AND status = '" + status + "'";
        db.query(pgsql, function (err, results) {
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
        var db, sql, target;
        db = this;
        target = request.url.split('?')[0];
        if (target === '/') {
            target = '/index.html';
        }
        sql = 'SELECT file FROM public_html WHERE name = "' + target + '"';
        db.query(sql, function (err, results) {
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
                'Content-Type': 'application/octet-stream'
            };
            if (mime_types.hasOwnProperty(extension)) {
                headers['Content-Type'] = mime_types[extension];
            }
            response.writeHead(200, headers);
            response.write(results.row[0].file);
            response.end();
            return;
        });
        return;
    };

    init = function (connection_string) {
     // This function needs documentation.
        var create_db, create_stored_procedures, create_tables, db, ready;
        create_db = function () {
         // This function needs documentation.
            var db;
            db = new pg.Client(connection_string);
            db.on('connect', create_tables);
            db.on('error', function (err) {
             // This function needs documentation.
                console.error('Error:', err);
                return;
            });
            db.connect();
            return db;
        };
        create_stored_procedures = function () {
         // This function needs documentation.
            var code1, code2;
            code1 = [
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
            code2 = [
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
            db.query(code1.join('\n'), function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                db.query(code2.join('\n'), function (err) {
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
        create_tables = function () {
         // This function needs documentation.
            var code1, code2;
            code1 = 'CREATE TABLE IF NOT EXISTS avars (' +
                    '   box TEXT NOT NULL,'     +
                    '   key TEXT NOT NULL,'     +
                    '   status TEXT,'           +
                    '   val TEXT NOT NULL,'     +
                    '   UNIQUE (box, key)'      +
                    ')';
            code2 = 'CREATE TABLE IF NOT EXISTS public_html (' +
                    '   name TEXT NOT NULL,'    +
                    '   file BYTEA NOT NULL,'   +
                    '   UNIQUE (name)'          +
                    ')';
            db.query(code1, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                db.query(code2, function (err) {
                 // This function needs documentation.
                    if (err !== null) {
                        throw err;
                    }
                    create_stored_procedures();
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

    pg = require('pg');                 //- or, use `require('pg').native` ...

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, db, key, sql, temp;
        box = params[0];
        db = this;
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
            db.query(sql, [x.box, x.key, x.status, x.val], callback);
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
                        var args, pgsql;
                        args = ['/' + name, '\\x' + file.toString('hex')];
                        pgsql = 'SELECT upsert_file($1, $2)';
                        db.query(pgsql, args, function (err) {
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

 // Out-of-scope definitions

    exports.init = init;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
