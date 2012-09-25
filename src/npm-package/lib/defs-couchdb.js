//- JavaScript source code

//- defs-couchdb.js ~~
//                                                      ~~ (c) SRW, 25 Sep 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var config, get_box_key, get_box_status, get_static_content, http, https,
        init, post_box_key, proxy, url;

 // Definitions

    get_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, key, options, target;
        box = params[0];
        key = params[1];
        target = config.couchdb.db + '/_show/data/' + box + '&' + key;
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
        var box, options, status, target;
        box = params[0];
        status = params[1];
        target = config.couchdb.db +
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
        var options, target;
        target = config.couchdb.www + request.url;
        options = url.parse(target);
        options.headers = request.headers;
        delete options.headers.host;
        options.method = 'GET';
        proxy(request, response, options);
        return;
    };

    http = require('http');

    https = require('https');

    init = function (options) {
     // This function needs documentation.
        config = options;
        return;
    };

    post_box_key = function (request, response, params) {
     // This function needs documentation.
        var box, key, options, target;
        box = params[0];
        key = params[1];
        target = config.couchdb.db + '/_update/timestamp/' + box + '&' + key;
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
            outer_res.writeHead(inner_res.statusCode, inner_res.headers);
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

    url = require('url');

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
