//- JavaScript source code

//- defs-couch.js ~~
//
//  NOTE: I need to experiment with `require('https').globalAgent.maxSockets`!
//
//                                                      ~~ (c) SRW, 25 Sep 2012
//                                                  ~~ last updated 23 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var cluster, http, https, proxy, url;

 // Definitions

    cluster = require('cluster');

    http = require('http');

    https = require('https');

    proxy = function (outer_req, outer_res, options, callback) {
     // This function needs documentation.
        var inner_req, protocol;
        protocol = (options.protocol === 'http:') ? http : https;
        inner_req = protocol.request(options, function (inner_res) {
         // This function needs documentation.
            if ((options.method === 'POST') && (inner_res.statusCode === 202)) {
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
        inner_req.on('error', callback);
        outer_req.pipe(inner_req);
        return;
    };

    url = require('url');

 // Out-of-scope definitions

    exports.api = function (connection_string) {
     // This function needs documentation.
        var get_box_key, get_box_status, post_box_key;
        get_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            var box, key, options, target;
            box = params[0];
            key = params[1];
            target = connection_string + '/_show/data/' + box + '&' + key;
            options = url.parse(target);
            options.headers = request.headers;
            delete options.headers.host;
            options.headers['Content-Type'] = 'application/json';
            options.method = 'GET';
            return proxy(request, response, options, callback);
        };
        get_box_status = function (request, response, params, callback) {
         // This function needs documentation.
            var box, options, status, target;
            box = params[0];
            status = params[1];
            target = connection_string +
                '/_list/as-array/jobs?key=["' + box + '","' + status + '"]';
            options = url.parse(target);
            options.headers = request.headers;
            delete options.headers.host;
            options.headers['Content-Type'] = 'application/json';
            options.method = 'GET';
            return proxy(request, response, options, callback);
        };
        post_box_key = function (request, response, params, callback) {
         // This function needs documentation.
            var box, key, options, target;
            box = params[0];
            key = params[1];
            target = connection_string +
                '/_update/timestamp/' + box + '&' + key;
            options = url.parse(target);
            options.headers = request.headers;
            delete options.headers.host;
            options.headers['Content-Type'] = 'application/json';
            options.method = 'POST';
            return proxy(request, response, options, callback);
        };
        if (cluster.isMaster) {
            console.log('API: CouchDB storage is *assumed* to be ready.');
        }
        return {
            get_box_key:    get_box_key,
            get_box_status: get_box_status,
            post_box_key:   post_box_key
        };
    };

    exports.www = function (connection_string) {
     // This function needs documentation.
        var get_static_content, set_static_content;
        get_static_content = function (request, response, params, callback) {
         // This function needs documentation.
            var options, target;
            target = connection_string + request.url;
            options = url.parse(target);
            options.headers = request.headers;
            delete options.headers.host;
            options.method = 'GET';
            return proxy(request, response, options, callback);
        };
        set_static_content = function (name, file, callback) {
         // This function needs documentation.
            return callback(null, undefined);
        };
        if (cluster.isMaster) {
            console.log('WWW: CouchDB storage is *assumed* to be ready.');
        }
        return {
            get_static_content: get_static_content,
            set_static_content: set_static_content
        };
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
