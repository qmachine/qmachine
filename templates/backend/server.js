//- JavaScript source code

//- server.js ~~
//
//  CORS-enabled HTTP JSON API (for '.' := 'http://qmachine.org'):
//
//  - GET   http://qmachine.org/box/sean?key=asdf
//  - GET   http://qmachine.org/box/sean?status=waiting
//  - POST  http://qmachine.org/box/sean
//
//                                                      ~~ (c) SRW, 17 Apr 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var db, handle_GET, handle_OPTIONS, handle_POST, handle_static, host,
        http, port, server, rewrite, url;

 // Definitions

    db = 'http://127.0.0.1:5984/db';

    handle_GET = function (outer_req, outer_res, params) {
     // This function needs documentation.
     //
     // NOTE: I'm working too hard here. I need to forward CouchDB's status
     // codes when possible so I can send '304' and avoid extra transfers.
     //
        var href, options;
        if (params.hasOwnProperty('key')) {
            href = rewrite + '/box/' + params.box + '/key/' + params.key;
        } else if (params.hasOwnProperty('status')) {
            href = rewrite + '/box/' + params.box + '/status/' + params.status;
        } else {
         // Prepare to return a static file ...
            href = outer_req.url;
        }
        options = url.parse(href);
        options.headers = outer_req.headers;
        http.request(options, function (inner_res) {
         // This function needs documentation.
            inner_res.setEncoding('utf8');
            outer_res.writeHead(inner_res.statusCode, {
                'Content-Type': 'application/json'
            });
            inner_res.on('data', function (chunk) {
             // This function needs documentation.
                outer_res.write(chunk.toString());
                return;
            });
            inner_res.on('end', function () {
             // This function needs documentation.
                outer_res.end();
                return;
            });
            return;
        }).on('error', function (err) {
         // This function needs documentation.
            console.error(err);
            outer_res.write(err.toString() + '\n');
            outer_res.end();
            return;
        }).end();
        return;
    };

    handle_OPTIONS = function (outer_req, outer_res) {
     // This function needs documentation.
        outer_res.writeHead('204', 'No Content', {
            'Access-Control-Allow-Origin':  '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Access-Control-Max-Age':       10, //- seconds
            'Content-Length':               0
        });
        outer_res.end();
        return;
    };

    handle_POST = function (outer_req, outer_res, params) {
     // This function needs documentation.
        var ensure_unique, href, inner_req, options;
        if ((params.hasOwnProperty('box') === false) ||
                (params.hasOwnProperty('key') === false)) {
         // Fail by returning useless data?
        }
        ensure_unique = function (doc_id) {
         // This function queries the database for other documents with the
         // same value for their 'key' property as a "grooming" mechanism for
         // CouchDB. Inside CouchDB, I append timestamps so that only the most
         // recently updated document with a given 'key' is ever used for the
         // "_list" output. This strategy allows me to stream uploaded data
         // directly into CouchDB without using much memory in Node.js because
         // I don't have to use a temporary cache to store the upload while I
         // wait for an existence check to finish; instead, I just stream data
         // directly into CouchDB and then remove the outdated duplicates from
         // "_view" by either deleting the documents or by deleting the 'key'
         // properties on the documents.
            var href, options;
            href = rewrite + '/meta/' + params.box + '/key/' + params.key;
            options = url.parse(encodeURI(href));
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
                    var docs, href, i, n, options, req, special;
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
                        href = db + '/_bulk_docs';
                        options = url.parse(href);
                        options.method = 'POST';
                        options.headers = {'Content-Type': 'application/json'};
                        req = http.request(options, function (res) {
                         // This function needs documentation.
                            res.on('end', function () {
                             // This function needs documentation.
                                outer_res.end();
                                return;
                            });
                            return;
                        });
                        req.on('error', function (err) {
                         // This function needs documentation.
                            console.error(err);
                            return;
                        });
                        req.write(JSON.stringify({docs: docs}));
                        req.end();
                        return;
                    }
                    return;
                });
                return;
            }).on('error', function (err) {
             // This function needs documentation.
                console.error(err);
                return;
            }).end();
            return;
        };
        href = rewrite + '/box/' + params.box + '/key/' + params.key;
        options = url.parse(href);
        options.headers = outer_req.headers;
        options.headers['Content-Type'] = 'application/json';
        options.method = 'POST';
        inner_req = http.request(options, function (inner_res) {
         // This function needs documentation.
            var txt = [];
            outer_res.writeHead(inner_res.statusCode, {
                'Content-Type': 'application/json'
            });
            inner_res.setEncoding('utf8');
            inner_res.on('data', function (chunk) {
             // This function needs documentation.
                txt.push(chunk.toString());
                outer_res.write(chunk.toString());
                return;
            });
            inner_res.on('end', function () {
             // This function needs documentation.
                ensure_unique(JSON.parse(txt.join('')));
                return;
            });
            return;
        }).on('error', function (err) {
         // This function needs documentation.
            console.error(error);
            outer_res.write(err.toString());
            outer_res.end();
            return;
        });
        outer_req.on('data', function (chunk) {
         // This function needs documentation.
            inner_req.write(chunk.toString());
            return;
        });
        outer_req.on('end', function () {
         // This function needs documentation.
            inner_req.end();
            return;
        });
        return;
    };

    handle_static = function (outer_req, outer_res, params) {
     // This function needs documentation.
        var cache_file, fs, headers, static_content;
        cache_file = function (path, callback) {
         // This function needs documentation.
            fs.readFile(path, function (err, data) {
             // This function needs documentation.
                if (err) {
                    callback(err, data);
                    return;
                }
                console.log('Caching ' + path + ' ...');
                static_content[path] = data;
                callback(err, data);
                return;
            });
            return;
        };
        fs = require('fs');
        headers = {
            appcache: {
                'Content-Type': 'text/cache-manifest'
            },
            css: {
                'Content-Type': 'text/css'
            },
            html: {
                'Content-Type': 'text/html'
            },
            ico: {
                'Content-Type': 'image/png'
            },
            js: {
                'Content-Type': 'application/javascript'
            },
            png: {
                'Content-Type': 'image/png'
            }
        };
        static_content = {};
        handle_static = function (outer_req, outer_res, params) {
         // This function needs documentation.
            var extension, file, path;
            path = './public_html' + params.pathname;
            extension = path.split('.').pop();
            if (extension === '/public_html/') {
                path = './public_html/index.html';
                extension = 'html';
            }
            if (static_content.hasOwnProperty(path)) {
                outer_res.writeHead(200, headers[extension]);
                outer_res.write(static_content[path]);
                outer_res.end();
                return;
            }
            cache_file(path, function (err, data) {
             // This function needs documentation.
                if (err) {
                    outer_res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    outer_res.write('{}');
                    outer_res.end();
                    return;
                }
                outer_res.writeHead(200, headers[extension]);
                outer_res.write(data);
                outer_res.end();
                fs.watchFile(path, function (curr, prev) {
                 // This function needs documentation.
                    if (curr.mtime !== prev.mtime) {
                        cache_file(path, function (err, data) {
                         // This function needs documentation.
                            if (err) {
                                fs.unwatchFile(path);
                                delete static_content[path];
                                return;
                            }
                            console.log('(file changed: ' + path + ')');
                            return;
                        });
                        delete static_content[path];
                    }
                    return;
                });
                return;
            });
            return;
        };
        return handle_static(outer_req, outer_res, params);
    };

    host = '127.0.0.1';

    http = require('http');

    port = 8124;

    rewrite = db + '/_design/qmachine/_rewrite';

    server = http.createServer(function (request, response) {
     // This function needs documentation.
        var method, params, parsed;
        response.setHeader('Access-Control-Allow-Origin', '*');
        method = request.method.toUpperCase();
        if ((method === 'GET') || (method === 'POST')) {
            params = {};
            parsed = url.parse(request.url, true);
            if (parsed.pathname.slice(0, 5) === '/box/') {
                params.box = parsed.pathname.split('/')[2];
                if (parsed.query.hasOwnProperty('key')) {
                    params.key = parsed.query.key;
                }
                if (parsed.query.hasOwnProperty('status')) {
                    params.status = parsed.query.status;
                }
                if (method === 'GET') {
                    handle_GET(request, response, params);
                } else {
                    handle_POST(request, response, params);
                }
                return;
            }
            if (method === 'GET') {
                params.pathname = parsed.pathname;
                handle_static(request, response, params);
                return;
            }
        }
        handle_OPTIONS(request, response);
        return;
    });

    url = require('url');

 // Launch

    server.listen(port, host);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
