//- JavaScript source code

//- defs-redis.js ~~
//
//  The first step here was just to get things running with plain old arrays in
//  JavaScript, and I accomplished that. The next step is to jettison anything
//  that hinders performance, since it's downright sinful to choose a platform
//  like Node.js + Redis and then squander cycles needlessly ...
//
//                                                      ~~ (c) SRW, 23 Nov 2012
//                                                  ~~ last updated 18 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var cluster, redis, url;

 // Definitions

    cluster = require('cluster');

    redis = require('redis');

    url = require('url');

 // Out-of-scope definitions

    module.exports = function (options) {
     // This function needs documentation.
        var collect_garbage, conn, db, exp_date, get_box_key, get_box_status,
            post_box_key;

        collect_garbage = function () {
         // This function needs documentation.
            var remaining, seek_and_destroy;
            seek_and_destroy = function (queue) {
             // This function needs documentation.
                var box = queue.replace(/^\$\:([\w\-]+)[&][\w\-]+/, '$1');
                db.smembers(queue, function (err, response) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                        return;
                    }
                    var callback, keys, n;
                    callback = function () {
                     // This function needs documentation.
                        n -= 1;
                        if (n === 0) {
                            remaining -= 1;
                            if (remaining === 0) {
                                console.log('Finished collecting garbage.');
                            }
                        }
                        return;
                    };
                    n = response.length;
                    response.forEach(function (key) {
                     // This function needs documentation.
                        db.exists(box + '&' + key, function (err, response) {
                         // This function needs documentation.
                            if (err !== null) {
                                console.error('Error:', err);
                            }
                            if (response === 0) {
                                db.srem(queue, key, function (err, res) {
                                 // This function needs documentation.
                                    if (err !== null) {
                                        console.error('Error:', err);
                                    }
                                    return callback();
                                });
                            } else {
                                callback();
                            }
                            return;
                        });
                        return;
                    });
                    if (n === 0) {
                        callback();
                    }
                    return;
                });
                return;
            };
            db.keys('$:*', function (err, queues) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                remaining = queues.length;
                queues.forEach(seek_and_destroy);
                if (remaining === 0) {
                    console.log('Finished collecting garbage.');
                }
                return;
            });
            return;
        };

        conn = url.parse(options.redis);

        db = redis.createClient(conn.port, conn.hostname, {
         // For more information, see http://git.io/PRZ7Bw .
            detect_buffers: false,
            enable_offline_queue: true,
            no_ready_check: true,
            parser: 'hiredis',
            return_buffers: false,
            socket_nodelay: true
        });

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil(options.avar_ttl);
        };

        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            db.hget(params[0] + '&' + params[1], 'body', callback);
            return;
        };

        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            db.smembers('$:' + params[0] + '&' + params[1], callback);
            return;
        };

        post_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            var body, box, key, status;
            if (params.length === 4) {
                body = params[3];
                status = params[2];
            } else {
                body = params[2];
            }
            box = params[0];
            key = params[1];
            db.hget(box + '&' + key, 'status', function (err, res) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, res);
                }
                var multi, set1, set2, updated;
                multi = db.multi();
                updated = {body: body};
                if (res !== null) {
                    set1 = '$:' + box + '&' + res;
                    multi.srem(set1, key);
                }
                if (status !== undefined) {
                    updated.status = status;
                    set2 = '$:' + box + '&' + updated.status;
                    multi.sadd(set2, key);
                }
                multi.hmset(box + '&' + key, updated);
                multi.expire(box + '&' + key, exp_date());
                multi.exec(callback);
                return;
            });
            return;
        };

        db.auth(conn.auth.split(':')[1]);

        db.on('connect', function () {
         // This function needs documentation.
            if (cluster.isMaster) {
                console.log('API: Redis storage is ready.');
            }
            return;
        });

        db.on('end', function () {
         // This function needs documentation.
            console.log('(Redis client closed)');
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
