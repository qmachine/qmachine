//- JavaScript source code

//- defs-couch.js ~~
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 18 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var get_box_key, get_box_status, get_static_content, http, https, init,
        post_box_key, proxy, set_static_content, url;

 // Definitions

    get_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, db, key, options, target;
        box = params[0];
        db = this;
        key = params[1];
        target = db + '/_show/data/' + box + '&' + key;
        options = url.parse(target);
        options.headers = request.headers;
        delete options.headers.host;
        options.headers['Content-Type'] = 'application/json';
        options.method = 'GET';
        proxy(request, response, options);
        return;
    };

    get_box_status = function (request, response, params) {
     // This function needs documentation.
        var box, db, options, status, target;
        box = params[0];
        db = this;
        status = params[1];
        target = db +
                '/_list/as-array/jobs?key=["' + box + '","' + status + '"]';
        options = url.parse(target);
        options.headers = request.headers;
        delete options.headers.host;
        options.headers['Content-Type'] = 'application/json';
        options.method = 'GET';
        proxy(request, response, options);
        return;
    };

    get_static_content = function (request, response, params) {
     // This function needs documentation.
        var db, options, target;
        db = this;
        target = db + request.url;
        options = url.parse(target);
        options.headers = request.headers;
        delete options.headers.host;
        options.method = 'GET';
        proxy(request, response, options);
        return;
    };

    http = require('http');

    https = require('https');

    init = function (url) {
     // This function needs documentation.
        return {
            get_box_key: function (request, response, params) {
             // This function needs documentation.
                return get_box_key.call(url, request, response, params);
            },
            get_box_status: function (request, response, params) {
             // This function needs documentation.
                return get_box_status.call(url, request, response, params);
            },
            get_static_content: function (request, response, params) {
             // This function needs documentation.
                return get_static_content.call(url, request, response, params);
            },
            post_box_key: function (request, response, params) {
             // This function needs documentation.
                return post_box_key.call(url, request, response, params);
            },
            set_static_content: function (public_html) {
             // This function needs documentation.
                return set_static_content.call(url, public_html);
            }
        };
    };

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, db, key, options, target;
        box = params[0];
        db = this;
        key = params[1];
        target = db + '/_update/timestamp/' + box + '&' + key;
        options = url.parse(target);
        options.headers = request.headers;
        delete options.headers.host;
        options.headers['Content-Type'] = 'application/json';
        options.method = 'POST';
        proxy(request, response, options);
        return;
    };

    proxy = function (outer_req, outer_res, options) {
     // This function needs documentation.
        var inner_req, protocol;
        protocol = (options.protocol === 'http:') ? http : https;
        inner_req = protocol.request(options, function (inner_res) {
         // This function needs documentation.
            if ((options.method === 'POST') &&
                    (inner_res.statusCode === 202)) {
             // Batch mode returns an "HTTP 202: Accepted" response sometimes,
             // and Cloudant's BigCouch seems to be using batch mode sometimes.
             // Since the browser client expects a 201 and has no way to know
             // whether QM is using CouchDB or not, the best way to isolate and
             // handle the issue is to tweak the CouchDB definitions.
                outer_res.writeHead(201, inner_res.headers);
            } else {
                outer_res.writeHead(inner_res.statusCode, inner_res.headers);
            }
            inner_res.pipe(outer_res);
            return;
        });
        inner_req.on('error', function (err) {
         // This function needs documentation.
            outer_res.writeHead(444);
            outer_res.end();
            err.request = {
                ip:     outer_req.connection.remoteAddress,
                time:   new Date(),
                method: outer_req.method,
                url:    outer_req.url
            };
            console.error(JSON.stringify(err, undefined, 4));
            return;
        });
        outer_req.pipe(inner_req);
        return;
    };

    set_static_content = function (public_html) {
     // This function needs documentation.
        if (typeof public_html !== 'string') {
            public_html = 'public_html/';
        }
        var db = this;
        console.warn('Use "couchapp" or "kanso" to upload static content.');
        return;
    };

    url = require('url');

 // Out-of-scope definitions

    exports.init = init;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
