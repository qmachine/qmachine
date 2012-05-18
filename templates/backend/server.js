//- JavaScript source code

//- server.js ~~
//
//  CORS-enabled HTTP JSON API (for '.' := 'http://qmachine.org'):
//
//  - GET   http://qmachine.org/box/sean?key=hello
//  - POST  http://qmachine.org/box/sean?key=hello
//  - GET   http://qmachine.org/box/sean?status=waiting
//
//  Some parts of this program would be terrifically easier to understand if
//  I had used Quanah instead of "native" Node.js idioms (continuation passing
//  style, in particular), but I don't expect to have to edit this program
//  much anyway after a successful, stable deployment :-)
//
//                                                      ~~ (c) SRW, 18 May 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var cluster, config, handle_GET, handle_OPTIONS, handle_POST, http,
        reject, search, spawn_worker, url;

 // Definitions

    cluster = require('cluster');

    config = {
        app:    'http://127.0.0.1:5984/db/_design/qmachine/',
        cpus:   require('os').cpus().length,
        db:     'http://127.0.0.1:5984/db/',
        host:   'qmachine.org',
        log:    null,                   //- coming soon ;-)
        port:   80,
        www:    'http://127.0.0.1:5984/www/_design/qmachine/_rewrite/'
    };

    handle_GET = function (outer_req, outer_res) {
     // This function needs documentation.
        var box_api, href, inner_req, options, params, parsed;
        box_api = /^\/box\/([^\/]*)$/;
        params = {};
        parsed = url.parse(outer_req.url, true);
        if (box_api.test(parsed.pathname)) {
            params.box = parsed.pathname.replace(box_api, '$1');
            if (parsed.query.hasOwnProperty('key')) {
             // Retrieve a single avar's JSON representation from CouchDB.
                params.key = parsed.query.key;
                href = config.app + '_list/box/by_key' +
                        search({key: [params.box, params.key, false]});
            } else if (parsed.query.hasOwnProperty('status')) {
             // Retrieve a JSON array of keys from CouchDB.
                params.status = parsed.query.status;
                href = config.app + '_list/as-array/by_status' +
                        search({key: [params.box, params.status]});
            }
        } else if ((/^\/[^\/]*/).test(parsed.pathname.slice(1)) === false) {
         // Retrieve static resources from a different database on CouchDB.
         // This immediately solves security issues concerning '_all_docs' :-)
            href = url.resolve(config.www, '.' + parsed.pathname);
        }
        if (href === undefined) {
            reject(outer_req, outer_res);
        } else {
            options = url.parse(encodeURI(href));
            options.headers = outer_req.headers;
            options.method = outer_req.method;
            inner_req = http.request(options, function (inner_res) {
             // This function needs documentation.
                outer_res.writeHead(inner_res.statusCode, inner_res.headers);
                inner_res.pipe(outer_res);
                return;
            });
            outer_req.pipe(inner_req);
        }
        return;
    };

    handle_OPTIONS = function (outer_req, outer_res) {
     // This function needs documentation.
        outer_res.writeHead('204', 'No Content', {
            'Access-Control-Allow-Origin':  '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Access-Control-Max-Age':       10, //- seconds
            'Content-Length':               0
        });
        outer_res.end();
        return;
    };

    handle_POST = function (outer_req, outer_res) {
     // This function needs documentation.
        var box_api, href, inner_req, options, params, parsed;
        box_api = /^\/box\/([^\/]*)$/;
        params = {};
        parsed = url.parse(outer_req.url, true);
        if (box_api.test(parsed.pathname)) {
            params.box = parsed.pathname.replace(box_api, '$1');
            if (parsed.query.hasOwnProperty('key')) {
             // Retrieve a single avar's JSON representation from CouchDB.
                params.key = parsed.query.key;
                href = config.app + '_update/timestamp' +
                        search({box: params.box, key: params.key});
            }
        }
        if (href === undefined) {
            reject(outer_req, outer_res);
            return;
        }
        options = url.parse(encodeURI(href));
        options.headers = outer_req.headers;
     // NOTE: Is this next line necessary? (or even advisable?)
        options.headers['Content-Type'] = 'application/json';
        options.method = 'POST';
        inner_req = http.request(options, function (inner_res) {
         // This function needs documentation.
         //
         // NOTES:
         // -   It's ok to "cache" the inner response because it will be the
         //     newly created document's '_id', which is a short string.
         //
            var txt = [];
            outer_res.writeHead(inner_res.statusCode);//, inner_res.headers);
            inner_res.setEncoding('utf8');
            inner_res.on('data', function (chunk) {
             // This function needs documentation.
                txt.push(chunk.toString());
                return;
            });
            inner_res.on('end', function () {
             // This function was previously known as 'ensure_unique' ...
                var doc_id, href, options;
                doc_id = txt.join('');
                href = config.app + '_list/as-array/by_key' +
                        search({key: [params.box, params.key, true]});
                options = url.parse(encodeURI(href));
                options.method = 'GET';
                http.request(options, function (res) {
                 // This function needs documentation.
                    var txt = [];
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    });
                    res.on('end', function () {
                     // This function needs documentation.
                        var docs, i, n, options, special;
                        docs = JSON.parse(txt.join(''));
                        n = docs.length;
                        for (i = 0; i < n; i += 1) {
                            if (docs[i]._id === doc_id) {
                                special = i;
                            } else {
                                docs[i]._deleted = true;
                            }
                        }
                        docs.splice(special, 1);
                        if (docs.length === 0) {
                            outer_res.end();
                        } else {
                            options = url.parse(config.db + '_bulk_docs');
                            options.method = 'POST';
                            options.headers = {
                                'Content-Type': 'application/json'
                            };
                            http.request(options, function (res) {
                             // This function needs documentation.
                                res.on('end', function () {
                                 // This function needs documentation.
                                    outer_res.end();
                                    return;
                                });
                                return;
                            }).end(JSON.stringify({docs: docs}));
                        }
                        return;
                    });
                    return;
                }).end();
                return;
            });
            return;
        });
        outer_req.pipe(inner_req);
        return;
    };

    http = require('http');

    reject = function (request, response) {
     // This function needs documentation.
        response.writeHead(444);
        response.end();
        return;
    };

    search = function (x) {
     // This function needs documentation.
        var key, y;
        y = [];
        for (key in x) {
            if (x.hasOwnProperty(key)) {
                y.push(key + '=' + JSON.stringify(x[key]));
            }
        }
        return '?' + y.join('&');
    };

    spawn_worker = function () {
     // This function needs documentation.
        var worker = cluster.fork();
        worker.on('error', function (err) {
         // This function needs documentation.
            console.error(err);
            return;
        });
        worker.on('message', function (message) {
         // This function needs documentation.
            console.log(worker.pid + ':', message.cmd);
            return;
        });
        return;
    };

    url = require('url');

 // Invocations

    http.globalAgent.maxSockets = 100;  //- still experimental ...

    if (cluster.isMaster) {

        (function () {
         // This function needs documentation.
            var i, n;
            n = config.cpus;
            for (i = 0; i < n; i += 1) {
                spawn_worker();
            }
            return;
        }());

        cluster.on('death', function (worker) {
         // This function needs documentation.
            console.log('Process ' + worker.pid + ' exited.');
            spawn_worker();
            return;
        });

    } else {

     // NOTE: I'm still not sure if this should be 'http.Server', as the
     // documentation shows, or 'http.createServer', which is the "usual"
     // answer. I need to find out what subtleties are at play here ...

        http.Server(function (request, response) {
         // This function needs documentation.
            switch (request.method.toUpperCase()) {
            case 'GET':
                response.setHeader('Access-Control-Allow-Origin', '*');
                handle_GET(request, response);
                break;
            case 'OPTIONS':
                response.setHeader('Access-Control-Allow-Origin', '*');
                handle_OPTIONS(request, response);
                break;
            case 'POST':
                response.setHeader('Access-Control-Allow-Origin', '*');
                handle_POST(request, response);
                break;
            default:
                reject(request, response);
            }
            return;
        }).listen(config.port, config.host);

    }

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
