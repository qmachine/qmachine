//- JavaScript source code

//- defs-mongo.js ~~
//
//  If you were to ask me which database definitions are _not_ recommended for
//  production, I would pick this set, because I don't know very much about
//  MongoDB yet. It's a great project and it's easy to use, but I haven't spent
//  with it, and that's why I am least confident in this set of definitions.
//
//  NOTE: I have noticed that the connection string format my code expects is
//  different from the conventional format. I probably won't fix it until 2013.
//
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 22 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

 // Declarations

    var cluster, mongo, url;

 // Definitions

    cluster = require('cluster');

    mongo = require('mongodb');

    url = require('url');

 // Out-of-scope definitions

    module.exports = function (options) {
     // This function needs documentation.

        var collect_garbage, db, exp_date, get_box_key, get_box_status,
            post_box_key;

        collect_garbage = function () {
         // This function needs documentation.
            db.collection('avars', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                var pattern = {exp_date: {$lte: Math.ceil(Date.now() / 1000)}};
                collection.remove(pattern, function (err, doc) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                        return;
                    }
                    console.log('Finished collecting garbage.');
                    return;
                });
                return;
            });
            return;
        };

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil((Date.now() / 1000) + options.avar_ttl);
        };

        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            db.collection('avars', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var pattern = {_id: params[0] + '&' + params[1]};
                collection.findOne(pattern, function (err, item) {
                 // This function needs documentation.
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    return callback(null, (item === null) ? item : item.body);
                });
                return;
            });
            return;
        };

        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            db.collection('avars', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var items, pattern, stream;
                items = [];
                pattern = {box_status: params[0] + '&' + params[1]};
                stream = collection.find(pattern).stream();
                stream.on('close', function () {
                 // This function needs documentation.
                    return callback(null, items);
                });
                stream.on('data', function (item) {
                 // This function needs documentation.
                    items.push(item.key);
                    return;
                });
                stream.on('error', callback);
                return;
            });
            return;
        };

        post_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            db.collection('avars', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var obj, options, spec;
                if (params.length === 4) {
                    obj = {
                        _id:        params[0] + '&' + params[1],
                        body:       params[3],
                        box_status: params[0] + '&' + params[2],
                        exp_date:   exp_date(),
                        key:        params[1]
                    };
                } else {
                    obj = {
                        _id:        params[0] + '&' + params[1],
                        body:       params[2],
                        exp_date:   exp_date(),
                        key:        params[1]
                    };
                }
                options = {safe: true, upsert: true};
                spec = {_id: params[0] + '&' + params[1]};
                collection.update(spec, obj, options, callback);
                return;
            });
            return;
        };

        (function () {
         // This function initializes MongoDB for use as a QM API server.
            var conn, server, storage;
            conn = url.parse(options.mongo);
         // NOTE: For some reason, the MongoDB driver freaks out if `conn.port`
         // is a string, but that's what `url.parse` returns. Therefore, we
         // need to convert it to a number explicitly. Sorry, MongoDB, but I'm
         // not actually nostalgic for my nights of C++ type anguish, and this
         // supports my argument that Mongo is for C++ jocks who dabble in JS.
            server = new mongo.Server(conn.hostname, parseInt(conn.port, 10), {
                auto_reconnect: true
            });
            storage = new mongo.Db('qm', server, {
                native_parser: true,
                safe: true,
                strict: true
            });
            storage.open(function (err, db_client) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                db = db_client;
                if (cluster.isWorker) {
                    return;
                }
                db.createCollection('avars', function (err, collection) {
                 // This function needs documentation.
                    if (err !== null) {
                        throw err;
                    }
                    console.log('API: MongoDB storage is ready.');
                    return;
                });
                return;
            });
            return;
        }());

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
