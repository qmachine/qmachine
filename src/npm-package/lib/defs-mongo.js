//- JavaScript source code

//- defs-mongo.js ~~
//                                                      ~~ (c) SRW, 05 Nov 2012
//                                                  ~~ last updated 11 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var fs, get_box_key, get_box_status, get_static_content, init, mime_types,
        mongo, post_box_key, set_static_content, url;

 // Definitions

    fs = require('fs');

    get_box_key = function (request, response, params) {
     // This function needs documentation.
        var db = this;
        db.collection('avars', function (err, collection) {
         // This function needs documentation.
            if (err !== null) {
                console.error('Error:', err.message);
                return;
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
                    console.error('Error:', err.message);
                    item = {};
                }
                if (item === null) {
                    item = {};
                }
                delete item._id;
                response.write(JSON.stringify(item));
                response.end();
                return;
            });
            response.writeHead(200, {'Content-Type': 'application/json'});
            return;
        });
        return;
    };

    get_box_status = function (request, response, params) {
     // This function needs documentation.
        var db = this;
        db.collection('avars', function (err, collection) {
         // This function needs documentation.
            if (err !== null) {
                console.error('Error:', err.message);
                return;
            }
            var items, pattern, stream;
            items = [];
            pattern = {
                box:    params[0],
                status: params[1]
            };
            stream = collection.find(pattern).stream();
            stream.on('data', function (item) {
             // This function needs documentation.
                items.push(item.key);
                return;
            });
            stream.on('error', function (err) {
             // This function needs documentation.
                console.error('Error:', err.message);
                response.write(JSON.stringify(items));
                response.end();
                return;
            });
            stream.on('close', function () {
             // This function needs documentation.
                response.write(JSON.stringify(items));
                response.end();
                return;
            });
            response.writeHead(200, {'Content-Type': 'application/json'});
            return;
        });
        return;
    };

    get_static_content = function (request, response, params) {
     // This function needs documentation.
        var db, extension, headers, pattern;
        db = this;
        headers = {
            'Content-Type': 'application/octet-stream'
        };
        pattern = {
            name: request.url.split('?')[0]
        };
        if (pattern.name === '/') {
            pattern.name = '/index.html';
        }
        extension = pattern.name.split('.').pop();
        if (mime_types.hasOwnProperty(extension)) {
            headers['Content-Type'] = mime_types[extension];
        }
        db.collection('public_html', function (err, collection) {
         // This function needs documentation.
            if (err !== null) {
                console.error('Error:', err.message);
                response.writeHead(444);
                response.end();
                return;
            }
            collection.findOne(pattern, function (err, item) {
             // This function needs documentation.
                if ((err !== null) || (item === null)) {
                    if (err !== null) {
                        console.error('Error:', err.message);
                    }
                    response.writeHead(444);
                    response.end();
                    return;
                }
                response.writeHead(200, headers);
                response.write(item.file.buffer);
                response.end();
                return;
            });
            return;
        });
        return;
    };

    init = function (connection_string) {
     // This function needs documentation.
        var conn, create_collections, create_db, m, ready;
        conn = url.parse(connection_string);
        create_db = function () {
         // This function needs documentation.
            var db, host, port, server, storage;
            db = {};
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
                db.db = db_handle;
                create_collections();
                return;
            });
            return db;
        };
        create_collections = function () {
         // This function needs documentation.
            var handler, remaining;
            handler = function (err, res) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                remaining -= 1;
                if (remaining === 0) {
                    ready = true;
                }
                return;
            };
            remaining = 3;
            m.db.createCollection('avars', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                collection.createIndex({
                    box: 1,
                    key: 1
                }, {
                  //background: true,
                    dropDups: true,
                    safe: true,
                    unique: true
                }, handler);
                collection.createIndex({
                    box: 1,
                    key: 1,
                    status: 1
                }, {
                  //background: true,
                    safe: true,
                    sparse: true
                }, handler);
                return;
            });
            m.db.collection('public_html', function (err, collection) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                collection.ensureIndex({
                    name: 1
                }, {
                  //background: true,
                    dropDups: true,
                  //sparse: true,
                    unique: true
                }, handler);
                return;
            });
            return;
        };
        m = create_db();
        ready = false;
        return {
            get_box_key: function (request, response, params) {
             // This function needs documentation.
                return get_box_key.call(m.db, request, response, params);
            },
            get_box_status: function (request, response, params) {
             // This function needs documentation.
                return get_box_status.call(m.db, request, response, params);
            },
            get_static_content: function (request, response, params) {
             // This function needs documentation.
                return get_static_content.call(m.db, request, response, params);
            },
            post_box_key: function (request, response, params) {
             // This function needs documentation.
                return post_box_key.call(m.db, request, response, params);
            },
            set_static_content: function f(public_html) {
             // This function needs documentation.
                if (ready === true) {
                    set_static_content.call(m.db, public_html);
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

    mongo = require('mongodb');

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        var db, spec;
        db = this;
        spec = {
            box: params[0],
            key: params[1]
        };
        db.collection('avars', function (err, collection) {
         // This function needs documentation.
            if (err !== null) {
                console.error('Error:', err.message);
                response.writeHead(444);
                response.end();
                return;
            }
            var temp = [];
            request.on('data', function (chunk) {
             // This function needs documentation.
                temp.push(chunk.toString());
                return;
            });
            request.on('end', function () {
             // This function needs documentation.
                var body, options;
                try {
                    body = JSON.parse(temp.join(''));
                    if ((body.box !== spec.box) || (body.key !== spec.key)) {
                        throw new Error('Invalid serialization format');
                    }
                } catch (e) {
                    console.error(e);
                    response.writeHead(444);
                    response.end();
                    return;
                }
                options = {
                    safe: true,
                    upsert: true
                };
                collection.update(spec, body, options, function (err, res) {
                 // This function needs documentation.
                    response.writeHead(201, {'Content-Type': 'text/plain'});
                    response.write('Hooray!');
                    response.end();
                    return;
                });
                return;
            });
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
                        db.collection('public_html', function (err, coll) {
                         // This function needs documentation.
                            if (err !== null) {
                                throw err;
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
                            coll.update(spec, temp, options, function (err) {
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
        });
        return;
    };

    url = require('url');

 // Out-of-scope definitions

    exports.init = init;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
