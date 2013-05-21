//- JavaScript source code

//- defs-couch.js ~~
//
//  NOTE: I need to experiment with `require('https').globalAgent.maxSockets`!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 20 May 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 3, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

    /*properties
        api, avar_ttl, body, box_status, ceil, collect_garbage, 'Content-Type',
        couch, create, end, error, exp_date, get_box_key, get_box_status,
        headers, _id, isMaster, join, key, keys, length, log, method, now, on,
        parse, post_box_key, protocol, push, request, _rev, statusCode,
        stringify, toString, trim
    */

 // Declarations

    var cluster, create_db, http, https, stringify, upload_ddoc, url;

 // Definitions

    cluster = require('cluster');

    create_db = function (conn, callback) {
     // This function needs documentation.
        var options, protocol, req;
        options = Object.create(conn);
        options.method = 'PUT';
        protocol = (conn.protocol === 'http:') ? http : https;
        req = protocol.request(options, function (response) {
         // This function needs documentation.
            var temp = [];
            response.on('data', function (chunk) {
             // This function needs documentation.
                temp.push(chunk.toString());
                return;
            });
            response.on('end', function () {
             // This function needs documentation.
                return callback(null, temp.join(''));
            });
            return;
        });
        req.on('error', callback);
        req.end();
        return;
    };

    http = require('http');

    https = require('https');

    stringify = function (obj, keys) {
     // This function only exists to serialize the design document cleanly. It
     // doesn't demand the level of sophistication that the browser client's
     // `serialize` method does because we know that this function will run in
     // Node.js and that all functions will be serializable :-)
        /*jslint unparam: true */
        var i, n, temp;
        temp = {};
        n = keys.length;
        for (i = 0; i < n; i += 1) {
            temp[keys[i]] = obj[keys[i]];
        }
        return JSON.stringify(temp, function (key, val) {
         // See the explanation above ;-)
            if ((typeof val === 'function') && (val instanceof Function)) {
                return val.toString();
            }
            return val;
        });
    };

    upload_ddoc = function (file, app_url, callback) {
     // This function needs documentation.
        var opts, protocol, req;
        opts = url.parse(app_url);
        opts.method = 'GET';
        protocol = (opts.protocol === 'http:') ? http : https;
        req = protocol.request(opts, function (response) {
         // This function needs documentation.
            var temp = [];
            response.on('data', function (chunk) {
             // This function needs documentation.
                temp.push(chunk.toString());
                return;
            });
            response.on('end', function () {
             // This function needs documentation.
                var new_dd, $new_dd, old_dd, $old_dd, opts2, req2;
                new_dd = require(file);
                $old_dd = temp.join('');
                if (response.statusCode === 200) {
                    old_dd = JSON.parse($old_dd);
                    new_dd = require(file);
                    new_dd._id = old_dd._id;
                    new_dd._rev = old_dd._rev;
                    $new_dd = stringify(new_dd, Object.keys(old_dd));
                    $old_dd = stringify(old_dd, Object.keys(old_dd));
                    if ($new_dd === $old_dd) {
                        return callback(null, 'Design document unchanged.');
                    }
                } else {
                    $new_dd = stringify(new_dd, Object.keys(new_dd));
                }
                console.log('Uploading a new design document ...');
                opts2 = Object.create(opts);
                opts2.method = 'PUT';
                req2 = protocol.request(opts2, function (response) {
                 // This function needs documentation.
                    var temp = [];
                    response.on('data', function (chunk) {
                     // This function needs documentation.
                        temp.push(chunk.toString());
                        return;
                    });
                    response.on('end', function () {
                     // This function needs documentation.
                        return callback(null, temp.join(''));
                    });
                    return;
                });
                req2.on('error', callback);
                req2.end($new_dd);
                return;
            });
            return;
        });
        req.on('error', callback);
        req.end();
        return;
    };

    url = require('url');

 // Out-of-scope definitions

    exports.api = function (options) {
     // This function needs documentation.

        var app_url, collect_garbage, conn, exp_date, get_box_key,
            get_box_status, protocol, post_box_key;

        app_url = options.couch + '/_design/app/';

        collect_garbage = function () {
         // This function removes old documents from the "db" database, but it
         // does not trigger compaction. The reason is simple -- automatic
         // compaction is a standard feature of CouchDB 1.2 and later. To read
         // more about configuring your couch, see http://goo.gl/V634R.
            var callback, opts, req, target;
            callback = function (err) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                    return;
                }
                console.log('Finished collecting garbage.');
                return;
            };
            target = app_url + '_list/as-array/outdated?startkey=0&endkey=' +
                    Math.ceil(Date.now() / 1000);
            opts = url.parse(target);
            opts.method = 'GET';
            req = protocol.request(opts, function (res) {
             // This function needs documentation.
                var temp = [];
                res.on('data', function (chunk) {
                 // This function needs documentation.
                    temp.push(chunk.toString());
                    return;
                });
                res.on('end', function () {
                 // This function needs documentation.
                    var body, opts2, req2;
                    body = temp.join('');
                    if (body === '[]') {
                        return callback(null);
                    }
                    opts2 = url.parse(options.couch + '/_bulk_docs');
                    opts2.headers = {'Content-Type': 'application/json'};
                    opts2.method = 'POST';
                    req2 = protocol.request(opts2, function () {
                     // This function omits named parameters because it omits
                     // them anyway.
                        return callback(null);
                    });
                    req2.on('error', callback);
                    req2.end('{"docs":' + body + '}');
                    return;
                });
                return;
            });
            req.on('error', callback);
            req.end();
            return;
        };

        conn = url.parse(options.couch);

        exp_date = function () {
         // This function needs documentation.
            return Math.ceil((Date.now() / 1000) + options.avar_ttl);
        };

        get_box_key = function (params, callback) {
         // This function needs documentation.
            var opts, req, target;
            target = app_url + '_show/data/' + params[0] + '&' + params[1];
            opts = url.parse(target);
            opts.method = 'GET';
            req = protocol.request(opts, function (res) {
             // This function needs documentation.
                var temp = [];
                res.on('data', function (chunk) {
                 // This function needs documentation.
                    temp.push(chunk.toString());
                    return;
                });
                res.on('end', function () {
                 // This function needs documentation.
                    return callback(null, temp.join(''));
                });
                return;
            });
            req.on('error', callback);
            req.end();
            return;
        };

        get_box_status = function (params, callback) {
         // This function needs documentation.
            var opts, req, target;
            target = app_url + '_list/as-array/jobs?key=["' +  params[0] +
                    '","' + params[1] + '"]';
            opts = url.parse(target);
            opts.method = 'GET';
            req = protocol.request(opts, function (res) {
             // This function needs documentation.
                var temp = [];
                res.on('data', function (chunk) {
                 // This function needs documentation.
                    temp.push(chunk.toString());
                    return;
                });
                res.on('end', function () {
                 // This function needs documentation.
                    return callback(null, JSON.parse(temp.join('')));
                });
                return;
            });
            req.on('error', callback);
            req.end();
            return;
        };

        protocol = (conn.protocol === 'http:') ? http : https;

        post_box_key = function (params, callback) {
         // This function needs documentation.
            var obj, opts, req;
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
            opts = url.parse(app_url + '_update/upsert/' + obj._id);
            opts.headers = {'Content-Type': 'application/json'};
            opts.method = 'POST';
            req = protocol.request(opts, function (res) {
             // This function needs documentation.
                res.on('data', function () {
                 // This function is empty, but it is necessary due to changes
                 // in the way that the streaming API works in Node.js, as of
                 // version 0.10 and later.
                    return;
                });
                res.on('end', function () {
                 // This function needs documentation.
                    if ((res.statusCode !== 201) && (res.statusCode !== 202)) {
                     // Ordinarily, we want a 201, but batch mode returns an
                     // "HTTP 202: Accepted" response, and Cloudant's BigCouch
                     // seems to use batch mode sometimes. All other status
                     // codes indicate an error.
                        return callback(res.statusCode);
                    }
                    return callback(null);
                });
                return;
            });
            req.on('error', callback);
            req.end(JSON.stringify(obj));
            return;
        };

        if (cluster.isMaster) {
            create_db(conn, function (err, response) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                }
                upload_ddoc('./couch-api-ddoc', app_url, function (err) {
                 // This function also accepts a second argument that contains
                 // the "results" of the query, but because I don't use it, I
                 // have omitted it to avoid irritating JSLint et al.
                    if (err !== null) {
                        console.error('Error:', err);
                    }
                    console.log(response.trim());
                    console.log('API: CouchDB storage is ready.');
                    return;
                });
                return;
            });
        }
        return {
            collect_garbage: collect_garbage,
            get_box_key: get_box_key,
            get_box_status: get_box_status,
            post_box_key: post_box_key
        };
    };

    exports.log = function (options) {
     // This function needs documentation.
        var app_url, conn, protocol;
        app_url = options.couch + '/_design/app/';
        conn = url.parse(options.couch);
        protocol = (conn.protocol === 'http:') ? http : https;
        if (cluster.isMaster) {
            create_db(conn, function (err, response) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                }
                upload_ddoc('./couch-log-ddoc', app_url, function (err) {
                 // This function also accepts a second argument that contains
                 // the "results" of the query, but because I don't use it, I
                 // have omitted it to avoid irritating JSLint et al.
                    if (err !== null) {
                        console.error('Error:', err);
                    }
                    console.log(response.trim());
                    console.log('LOG: CouchDB storage is ready.');
                    return;
                });
                return;
            });
        }
        return function (obj) {
         // This function needs documentation.
            var req;
            conn.headers = {'Content-Type': 'application/json'};
            conn.method = 'POST';
            req = protocol.request(conn, function (res) {
             // This function needs documentation.
                res.on('data', function () {
                 // This function is empty, but it is necessary due to changes
                 // in the way that the streaming API works in Node.js, as of
                 // version 0.10 and later.
                    return;
                });
                res.on('end', function () {
                 // See the explanation given above.
                    return;
                });
                return;
            });
            req.on('error', function (message) {
             // This function needs documentation.
                console.error('Error:', message);
                return;
            });
            req.end(JSON.stringify(obj));
            return;
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
