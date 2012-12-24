//- JavaScript source code

//- defs-couch.js ~~
//
//  NOTE: I need to experiment with `require('https').globalAgent.maxSockets`!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 23 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

 // Declarations

    var cluster, http, https, stringify, url;

 // Definitions

    cluster = require('cluster');

    http = require('http');

    https = require('https');

    stringify = function (obj, keys) {
     // This function only exists to serialize the design document cleanly. It
     // doesn't demand the level of sophistication that the browser client's
     // `serialize` method does because we know that this function will run in
     // Node.js and that all functions will be serializable :-)
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

    url = require('url');

 // Out-of-scope definitions

    module.exports = function (options) {
     // This function needs documentation.

        var app_url, collect_garbage, conn, create_database, exp_date,
            get_box_key, get_box_status, protocol, post_box_key,
            upload_design_doc;

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
                    req2 = protocol.request(opts2, function (res2) {
                     // This function needs documentation.
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

        create_database = function (callback) {
         // This function needs documentation.
            var options, req;
            options = Object.create(conn);
            options.method = 'PUT';
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
                if ((res.statusCode !== 201) && (res.statusCode !== 202)) {
                 // Ordinarily, we want a 201, but batch mode returns an
                 // "HTTP 202: Accepted" response, and Cloudant's BigCouch
                 // seems to use batch mode sometimes. All other status codes
                 // indicate an error.
                    return callback(res.statusCode);
                }
                return callback(null);
            });
            req.on('error', callback);
            req.end(JSON.stringify(obj));
            return;
        };

        upload_design_doc = function (callback) {
         // This function needs documentation.
            var opts, req;
            opts = url.parse(options.couch + '/_design/app');
            opts.method = 'GET';
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
                    new_dd = require('./couch-design-doc');
                    $old_dd = temp.join('');
                    if (response.statusCode === 200) {
                        old_dd = JSON.parse($old_dd);
                        new_dd = require('./couch-design-doc');
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

        if (cluster.isMaster) {
            create_database(function (err, response) {
             // This function needs documentation.
                if (err !== null) {
                    console.error('Error:', err);
                }
                upload_design_doc(function (err, response) {
                 // This function needs documentation.
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

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
