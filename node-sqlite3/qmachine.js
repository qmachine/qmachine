//- JavaScript source code

//- qmachine.js ~~
//
//  This program implements Qmachine with Node.js and SQLite 3.
//
//                                                      ~~ (c) SRW, 22 Feb 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, db, parseArgs, token, when;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    db = avar();

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

    token = function () {
     // This function needs documentation.
        var args, secret;
        args = parseArgs();
        secret = null;
        if ((args.hasOwnProperty('token')) &&
                ((typeof args.token === 'string') && (args.token.length > 0))) {
            secret = args.token;
        } else {
            secret = Q.uuid();
        }
        token = function () {
         // This function needs documentation.
            return secret;
        };
        return token();
    };

    when = Q.when;

 // There are some race conditions that must be solved when setting up the
 // SQLite database itself, but luckily Quanah makes short work of them :-)

    db.onerror = function (message) {
     // This function needs documentation.
        console.error('ERROR:', message);
        return;
    };

    db.onready = function (evt) {
     // This function needs documentation.
        db.val = new (require('sqlite3').Database)('main.db', function () {
         // This callback function needs documentation.
            var database = db.val;
            database.serialize(function () {
             // This callback function needs documentation.
                var query;
                query = [
                    'CREATE TABLE IF NOT EXISTS qmachine ' +
                        '(_id TEXT, val TEXT, status TEXT, token TEXT)',
                    'CREATE UNIQUE INDEX IF NOT EXISTS ' +
                        'uuid ON qmachine (_id)'
                ];
                database.run(query[0], function (err) {
                 // This callback function needs documentation.
                    if (err) {
                        return evt.fail(err);
                    }
                    return;
                });
                database.run(query[1], function (err) {
                 // This callback function needs documentation.
                    if (err) {
                        return evt.fail(err);
                    }
                    return evt.exit();
                });
            });
            return;
        });
        return;
    };

    db.onready = function (evt) {
     // This function needs documentation.
        var db, queue, read, write;
        db = this.val;
        queue = function () {
         // This function needs documentation.
            var y = avar({val: []});
            y.onready = function (evt) {
             // This function needs documentation.
                var query;
                query = [
                    'SELECT _id',
                    'FROM qmachine',
                    'WHERE status = "waiting" AND token = "' + token() + '"'
                ];
                db.all(query.join(' '), function (err, rows) {
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
        read = function (key) {
         // This function needs documentation.
            var y = avar();
            y.onready = function (evt) {
             // This function needs documentation.
                var query;
                query = [
                    'SELECT DISTINCT _id, val',
                    'FROM qmachine',
                    'WHERE _id = "' + key + '"'
                ];
                db.all(query.join(' '), function (err, rows) {
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
        write = function (key, $val) {
         // This function needs documentation.
            var y = avar();
            y.onready = function (evt) {
             // This function needs documentation.
                var query, stmt, temp;
                query = 'INSERT OR REPLACE INTO qmachine VALUES (?, ?, ?, ?)';
                stmt = db.prepare(query);
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
        Q.init({
            queue:  queue,
            read:   read,
            write:  write
        });
        return evt.exit();
    };

 // Initializations

    if (parseArgs().volunteer === true) {
        (function f() {
         // This function needs documentation.
            var task = Q.volunteer();
            task.onerror = function (message) {
             // This function needs documentation.
                if (message !== 'Nothing to do ...') {
                    console.error('ERROR:', message);
                }
                setTimeout(f, 1000);
                return;
            };
            task.onready = function (evt) {
             // This function needs documentation.
                console.log(task.val.status, '-->', task.key);
                setTimeout(f, 20);
                return evt.exit();
            };
            return;
        }());
    }

 // Demonstrations

    if (parseArgs().demo === true) {
        (function f() {
         // This function needs documentation.
            var before, after;
            (Math.random()).Q(function (evt) {
             // This function needs documentation.
                before = JSON.stringify(this.val);
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                this.val *= 2;
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                after = JSON.stringify(this.val);
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                console.log(this.key + ':', before, '-->', after);
                return evt.exit();
            }).onerror = function (message) {
             // This function needs documentation.
                console.error('ERROR:', message);
                return;
            };
            setTimeout(f, 1000);
            return;
        }());
    }

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
