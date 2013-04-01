//- JavaScript source code

//- defs-mongo.js ~~
//
//  If you were to ask me which database definitions are _not_ recommended for
//  production, I would pick this set, because I don't know very much about
//  MongoDB yet. It's a great project and it's easy to use, but I haven't spent
//  with it, and that's why I am least confident in this set of definitions.
//
//  NOTE: I also want to use the new TTL collection feature that was added in
//  MongoDB v2.2 (http://goo.gl/KtiQw) in order to improve the efficiency of
//  the `collect_garbage` method and/or eliminate the need for it altogether.
//
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 01 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

 // Declarations

    var cluster, mongo, url;

 // Definitions

    cluster = require('cluster');

    mongo = require('mongodb').MongoClient;

    url = require('url');

 // Out-of-scope definitions

    module.exports = function (options) {
     // This function needs documentation.

        var collect_garbage, db, exp_date, get_box_key, get_box_status,
            post_box_key;

        collect_garbage = function () {
         // This function needs documentation.
            var pattern = {exp_date: {$lte: Math.ceil(Date.now() / 1000)}};
            db.collection('avars').remove(pattern, function (err) {
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

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil((Date.now() / 1000) + options.avar_ttl);
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
            console.log('API: MongoDB storage is ready.');
            return;
        });

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
