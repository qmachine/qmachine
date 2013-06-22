//- JavaScript source code

//- defs-mongo.js ~~
//
//  These definitions are getting a lot more attention now :-)
//
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 22 Jun 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

    /*properties
        _id, api, avar_ttl, body, box_status, collect_garbage, collection,
        connect, ensureIndex, error, exp_date, expireAfterSeconds, find,
        findOne, get_box_key, get_box_status, isWorker, key, length, log,
        mongo, MongoClient, on, post_box_key, push, safe, save, stream, update,
        upsert
    */

 // Declarations

    var cluster, mongo;

 // Definitions

    cluster = require('cluster');

    mongo = require('mongodb').MongoClient;

 // Out-of-scope definitions

    exports.api = function (options) {
     // This function needs documentation, but as far as connection pooling is
     // concerned, my strategy is justified by the post on Stack Overflow at
     // http://stackoverflow.com/a/14464750.

        var collect_garbage, db, get_box_key, get_box_status, post_box_key;

        collect_garbage = function () {
         // This function isn't even needed anymore, because these definitions
         // are now taking advantage of TTL collections :-)
            console.log('(fake garbage collection)');
            return;
        };

        get_box_key = function (params, callback) {
         // This function needs documentation.
            var pattern = {_id: params[0] + '&' + params[1]};
            db.collection('avars').findOne(pattern, function (err, item) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                return callback(null, (item === null) ? undefined : item.body);
            });
            return;
        };

        get_box_status = function (params, callback) {
         // This function needs documentation.
            var items, pattern, stream;
            items = [];
            pattern = {box_status: params[0] + '&' + params[1]};
            stream = db.collection('avars').find(pattern).stream();
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
        };

        post_box_key = function (params, callback) {
         // This function needs documentation.
            var obj, options, spec;
            if (params.length === 4) {
                obj = {
                    _id:        params[0] + '&' + params[1],
                    body:       params[3],
                    box_status: params[0] + '&' + params[2],
                    exp_date:   new Date(),
                    key:        params[1]
                };
            } else {
                obj = {
                    _id:        params[0] + '&' + params[1],
                    body:       params[2],
                    exp_date:   new Date(),
                    key:        params[1]
                };
            }
            options = {safe: true, upsert: true};
            spec = {_id: params[0] + '&' + params[1]};
            db.collection('avars').update(spec, obj, options, callback);
            return;
        };

        mongo.connect(options.mongo, function (err, db_handle) {
         // This function is a LOT simpler than what I had before!
            if (err !== null) {
                throw err;
            }
            db = db_handle;
            if (cluster.isWorker) {
                return;
            }
            db.collection('avars').ensureIndex('exp_date', {
                expireAfterSeconds: options.avar_ttl
            }, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                console.log('API: MongoDB storage is ready.');
                return;
            });
            return;
        });

        return {
            collect_garbage: collect_garbage,
            get_box_key: get_box_key,
            get_box_status: get_box_status,
            post_box_key: post_box_key
        };
    };

    exports.log = function (options) {
     // This function needs documentation.
        var db;
        mongo.connect(options.mongo, function (err, db_handle) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            db = db_handle;
            return;
        });
        return function (obj) {
         // This function needs documentation.
            db.collection('traffic').save(obj, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                }
                return;
            });
            return;
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
