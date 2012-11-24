//- JavaScript source code

//- defs-redis.js ~~
//                                                      ~~ (c) SRW, 23 Nov 2012

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
        var get_box_key, get_box_status, post_box_key;
        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            // ...
            return;
        };
        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            // ...
            return;
        };
        post_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            // ...
            return;
        };
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
        return {
            get_static_content: get_static_content,
            set_static_content: set_static_content
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
