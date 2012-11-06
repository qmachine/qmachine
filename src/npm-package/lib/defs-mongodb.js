//- JavaScript source code

//- defs-mongodb.js ~~
//                                                      ~~ (c) SRW, 05 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var Q, avar, config, db, fs, get_box_key, get_box_status,
        get_static_content, init, mongo, post_box_key;

 // Definitions

    Q = require('quanah');

    avar = Q.avar;

    fs = require('fs');

    get_box_key = function (request, response, params) {
     // This function needs documentation.
        db.val.collection('avars', function (err, collection) {
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
        db.val.collection('avars', function (err, collection) {
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
        var extension, headers, pattern;
        headers = {
         // ...
        };
        pattern = {
            name: request.url.split('?')[0]
        };
        if (pattern.name === '/') {
            pattern.name = '/index.html';
        }
        switch (pattern.name.split('.').pop()) {
        case 'appcache':
            headers['Content-Type'] = 'text/cache-manifest';
            break;
        case 'css':
            headers['Content-Type'] = 'text/css';
            break;
        case 'html':
            headers['Content-Type'] = 'text/html';
            break;
        case 'ico':
            headers['Content-Type'] = 'image/x-icon';
            break;
        case 'jpg':
            headers['Content-Type'] = 'image/jpeg';
            break;
        case 'js':
         // NOTE: Should I use 'application/javascript' instead?
            headers['Content-Type'] = 'text/javascript';
            break;
        case 'json':
            headers['Content-Type'] = 'application/json';
            break;
        case 'manifest':
            headers['Content-Type'] = 'text/cache-manifest';
            break;
        case 'png':
            headers['Content-Type'] = 'image/png';
            break;
        case 'txt':
            headers['Content-Type'] = 'text/plain';
            break;
        case 'xml':
            headers['Content-Type'] = 'application/xml';
            break;
        default:
            headers['Content-Type'] = 'application/octet-stream';
        }
        db.val.collection('public_html', function (err, collection) {
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

    init = function (options) {
     // This function needs documentation.
        config = options;
        db = Q.avar();
        db.onerror = function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            var server, storage;
            server = new mongo.Server(options.mongo.host, options.mongo.port, {
                auto_reconnect: true
            });
            storage = new mongo.Db('qm', server, {
                safe: true,
                strict: true
            });
            storage.open(function (err, db_handle) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                var handler, remaining;
                handler = function (err, res) {
                 // This function needs documentation.
                    if (err !== null) {
                        console.error('Error:', err);
                    }
                    remaining -= 1;
                    if (remaining === 0) {
                        console.log('Continuing ...');
                        return evt.exit();
                    }
                    return;
                };
                remaining = 3;
                db.val = db_handle;
                //db.val.createCollection('avars', options, handler);
                //db.val.createCollection('public_html', options, handler);
                db.val.createCollection('avars', function (err, collection) {
                 // This function needs documentation.
                    if (err !== null) {
                        return evt.fail(err);
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
                db.val.collection('public_html', function (err, collection) {
                 // This function needs documentation.
                    if (err !== null) {
                        return evt.fail(err);
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
            });
            return;
        };
        db.onready = function (evt) {
         // This function needs documentation.
            var public_html = process.cwd() + '/public_html/';
            fs.exists(public_html, function (exists) {
             // This function needs documentation.
                if (exists === false) {
                    return evt.exit();
                }
                fs.readdir(public_html, function (err, files) {
                 // This function needs documentation.
                    if (err !== null) {
                        return evt.fail(err);
                    }
                    var remaining = files.length;
                    files.forEach(function (name) {
                     // This function needs documentation.
                        fs.readFile(public_html + name, function (err, file) {
                         // This function needs documentation.
                            if (err !== null) {
                                return evt.fail(err);
                            }
                            db.val.collection('public_html', function (e, c) {
                             // This function needs documentation.
                                if (e !== null) {
                                    return evt.fail(e);
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
                                c.update(spec, temp, options, function (err) {
                                 // This function needs documentation.
                                    if (err !== null) {
                                        return evt.fail(err);
                                    }
                                    remaining -= 1;
                                    if (remaining === 0) {
                                        return evt.exit();
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
        db.onready = function (evt) {
         // This function needs documentation.
            console.log('Database is ready.');
            return evt.exit();
        };
        return;
    };

    mongo = require('mongodb');

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        if ((request.headers.hasOwnProperty('content-length') === false) ||
                (request.headers['content-length'] > config.max_fu_size)) {
         // Either the user is using incorrect headers or he/she is uploading
         // a file that is too big. Don't fool with it either way. QMachine is
         // not a free hard drive for people who are too cheap to buy storage,
         // because we didn't buy storage, either ;-)
            response.writeHead(444);
            response.end();
            return;
        }
        var spec;
        spec = {
            box: params[0],
            key: params[1]
        };
        db.val.collection('avars', function (err, collection) {
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

 // Out-of-scope definitions

    exports.get_box_key = get_box_key;

    exports.get_box_status = get_box_status;

    exports.get_static_content = get_static_content;

    exports.init = init;

    exports.post_box_key = post_box_key;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
