//- JavaScript source code

//- defs-mongo.js ~~
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 23 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var mongo, url;

 // Definitions

    mongo = require('mongodb');

    url = require('url');

 // Out-of-scope definitions

    exports.api = function (connection_string) {
     // This function needs documentation.
        var db, get_box_key, get_box_status, post_box_key;
        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            db.collection('avars', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var pattern;
                pattern = {
                    box: params[0],
                    key: params[1]
                };
                collection.findOne(pattern, function (err, item) {
                 // This function needs documentation.
                    /*jslint nomen: true */
                    if (err !== null) {
                        return callback(err, undefined);
                    }
                    if (item === null) {
                        item = {};
                    }
                    delete item._id;
                    return callback(null, item);
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
                pattern = {
                    box:    params[0],
                    status: params[1]
                };
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
                var spec, temp;
                spec = {
                    box: params[0],
                    key: params[1]
                };
                temp = [];
                request.on('data', function (chunk) {
                 // This function needs documentation.
                    temp.push(chunk.toString());
                    return;
                });
                request.on('end', function () {
                 // This function needs documentation.
                    var body, options;
                    body = JSON.parse(temp.join(''));
                    if ((body.box !== spec.box) || (body.key !== spec.key)) {
                        return callback('Evil post_box_key denied', undefined);
                    }
                    options = {
                        safe: true,
                        upsert: true
                    };
                    collection.update(spec, body, options, callback);
                    return;
                });
                return;
            });
            return;
        };
        (function () {
         // This function initializes MongoDB for use as a QM API server.
            var conn, host, port, server, storage;
            conn = url.parse(connection_string);
            host = conn.hostname;
         // NOTE: For some reason, the MongoDB driver freaks out if `port` is
         // a string, but that's what `url.parse` returns. Therefore, we need
         // to convert it to a number explicitly. Sorry, MongoDB, but I'm not
         // actually nostalgic for my nights of C++ type anguish ...
            port = parseInt(conn.port, 10);
            server = new mongo.Server(host, port, {
                auto_reconnect: true
            });
            storage = new mongo.Db('qm', server, {
                safe: true,
                strict: true
            });
            storage.open(function (err, db_handle) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                db = db_handle;
                db.createCollection('avars', function (err, collection) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                        return;
                    }
                    var handler, remaining;
                    handler = function (err, res) {
                     // This function needs documentation.
                        if (err !== null) {
                            throw err;
                        }
                        remaining -= 1;
                        if (remaining === 0) {
                            console.log('API: MongoDB storage is ready.');
                        }
                        return;
                    };
                    remaining = 2;
                    collection.createIndex({
                        box: 1,
                        key: 1
                    }, {
                        dropDups: true,
                        safe: true,
                        unique: true
                    }, handler);
                    collection.createIndex({
                        box: 1,
                        key: 1,
                        status: 1
                    }, {
                        safe: true,
                        sparse: true
                    }, handler);
                    return;
                });
                return;
            });
            return;
        }());
        return {
            get_box_key:    get_box_key,
            get_box_status: get_box_status,
            post_box_key:   post_box_key
        };
    };

    exports.www = function (connection_string) {
     // This function needs documentation.
        var db, get_static_content, ready, set_static_content;
        get_static_content = function (request, response, params, callback) {
         // This function needs documentation.
            db.collection('public_html', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                collection.findOne({name: params[0]}, function (err, item) {
                 // This function needs documentation.
                    if ((err !== null) || (item === null)) {
                        return callback(err, item);
                    }
                    return callback(null, item.file.buffer);
                });
                return;
            });
            return;
        };
        ready = false;
        set_static_content = function (name, file, callback) {
         // This function needs documentation.
            if (ready === false) {
                process.nextTick(function () {
                 // This function needs documentation.
                    set_static_content(name, file, callback);
                    return;
                });
                return;
            }
            db.collection('public_html', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    return callback(err, undefined);
                }
                var options, spec, temp;
                options = {
                    safe: true,
                    upsert: true
                };
                spec = {
                    name: '/' + name
                };
                temp = {
                    name: '/' + name,
                    file: file
                };
                collection.update(spec, temp, options, callback);
                return;
            });
            return;
        };
        (function () {
         // This function initializes MongoDB for use as a QM web server.
            var conn, host, port, server, storage;
            conn = url.parse(connection_string);
            host = conn.hostname;
         // NOTE: For some reason, the MongoDB driver freaks out if `port` is
         // a string, but that's what `url.parse` returns. Therefore, we need
         // to convert it to a number explicitly. Sorry, MongoDB, but I'm not
         // actually nostalgic for my nights of C++ type anguish ...
            port = parseInt(conn.port, 10);
            server = new mongo.Server(host, port, {
                auto_reconnect: true
            });
            storage = new mongo.Db('qm', server, {
                safe: true,
                strict: true
            });
            storage.open(function (err, db_handle) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                db = db_handle;
                db.collection('public_html', function (err, collection) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                        return;
                    }
                    var handler, remaining;
                    handler = function (err, res) {
                     // This function needs documentation.
                        if (err !== null) {
                            throw err;
                        }
                        remaining -= 1;
                        if (remaining === 0) {
                            ready = true;
                            console.log('WWW: MongoDB storage is ready.');
                        }
                        return;
                    };
                    remaining = 1;
                    collection.ensureIndex({
                        name: 1
                    }, {
                        dropDups: true,
                        unique: true
                    }, handler);
                    return;
                });
                return;
            });
            return;
        }());
        return {
            get_static_content: get_static_content,
            set_static_content: set_static_content
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
