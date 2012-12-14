//- JavaScript source code

//- defs-redis.js ~~
//
//  The first step here was just to get things running with plain old arrays in
//  JavaScript, and I accomplished that. The next step is to jettison anything
//  that hinders performance, since it's downright sinful to choose a platform
//  like Node.js + Redis and then squander cycles needlessly ...
//
//                                                      ~~ (c) SRW, 23 Nov 2012
//                                                  ~~ last updated 14 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var redis, url;

 // Definitions

    redis = require('redis');

    url = require('url');

 // Out-of-scope definitions

    exports.api = function (connection_string) {
     // This function needs documentation.
        var conn, db, get_box_key, get_box_status, post_box_key;
        conn = url.parse(connection_string);
        db = redis.createClient(conn.port, conn.hostname, {
         // For more information, see http://git.io/PRZ7Bw .
            detect_buffers: false,
            enable_offline_queue: true,
            no_ready_check: true,
            parser: 'hiredis',
            return_buffers: false,
            socket_nodelay: true
        });
        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            db.hget(params[0] + '&' + params[1], 'body', callback);
            return;
        };
        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            db.smembers(params[0] + '&' + params[1], callback);
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
                var body, box, key, obj;
                body = temp.join('');
                box = params[0];
                key = params[1];
                try {
                    obj = JSON.parse(body);
                } catch (err) {
                    return callback(err, undefined);
                }
                if ((obj.box !== box) || (obj.key !== key)) {
                    return callback('Evil `post_box_key` denied', undefined);
                }
                db.hget(box + '&' + key, 'status', function (err, res) {
                 // This function needs documentation.
                    if (err !== null) {
                        return callback(err, res);
                    }
                    var multi, set1, set2, updated;
                    multi = db.multi();
                    updated = {body: body};
                    if (res !== null) {
                        set1 = box + '&' + res;
                        multi.srem(set1, key);
                    }
                    if (obj.hasOwnProperty('status')) {
                        updated.status = obj.status;
                        set2 = box + '&' + updated.status;
                        multi.sadd(set2, key);
                    }
                    multi.hmset(box + '&' + key, updated);
                    multi.expire(box + '&' + key, 86400);
                    multi.exec(callback);
                    return;
                });
                return;
            });
            return;
        };
        db.auth(conn.auth.split(':')[1]);
        db.on('end', function () {
         // This function needs documentation.
            console.log('Redis client closed.');
            return;
        });
        db.on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        process.on('exit', function () {
         // This function needs documentation.
            db.quit();
            console.log('(Redis client released)');
            return;
        });
        console.log('API: Redis storage is ready.');
        return {
            get_box_key:    get_box_key,
            get_box_status: get_box_status,
            post_box_key:   post_box_key
        };
    };

    exports.www = function (connection_string) {
     // This function needs documentation.
        var conn, db, get_static_content, set_static_content;
        conn = url.parse(connection_string);
        db = redis.createClient(conn.port, conn.hostname, {
         // For more information, see http://git.io/PRZ7Bw .
            detect_buffers: false,
            enable_offline_queue: true,
            no_ready_check: true,
            parser: 'hiredis',
            return_buffers: true,
            socket_nodelay: true
        });
        get_static_content = function (request, response, params, callback) {
         // This function needs documentation.
            db.get(params[0], callback);
            return;
        };
        set_static_content = function (name, file, callback) {
         // This function needs documentation.
            db.set(['/' + name, file], callback);
            return;
        };
        db.auth(conn.auth.split(':')[1]);
        db.on('end', function () {
         // This function needs documentation.
            console.log('Redis client closed.');
            return;
        });
        db.on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        process.on('exit', function () {
         // This function needs documentation.
            db.quit();
            console.log('(Redis client released)');
            return;
        });
        console.log('WWW: Redis storage is ready.');
        return {
            get_static_content: get_static_content,
            set_static_content: set_static_content
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
