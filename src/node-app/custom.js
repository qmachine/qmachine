//- JavaScript source code

//- custom.js ~~
//                                                      ~~ (c) SRW, 09 Dec 2013
//                                                  ~~ last updated 28 Dec 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        connection, content_length, 'content-length', dnt, env, hasOwnProperty,
        headers, host, ip, log, method, parse, remoteAddress, replace, split,
        timestamp, url, 'x-forwarded-for'
    */

 // Module definitions

    exports.log = function (request) {
     // This is a custom logging function that executes once for every request
     // if logging is enabled. This function is optional, however, because
     // QMachine provides a default logging function. I have used a convention
     // in which hyphens are converted into underscores in order to prevent
     // inconveniences with certain tools that attempt to auto-detect schemas
     // from JSON. Ironically, the "Do Not Track" header (DNT) is logged
     // alongside the tracking data because I don't understand the legal stuff
     // yet, but I will delete all personal data from entries that opted out
     // once I figure out which data are considered "personal".
        var headers, y;
        headers = request.headers;
        y = {
            host: headers.host,
            method: request.method,
            timestamp: new Date(),
            url: request.url
        };
        if (headers.hasOwnProperty('content-length')) {
            y.content_length = parseInt(headers['content-length'], 10);
        }
        if (headers.hasOwnProperty('dnt')) {
         // See http://goo.gl/Rrxu4L.
            y.dnt = parseInt(headers.dnt, 10);
        }
        if (headers.hasOwnProperty('x-forwarded-for')) {
         // See http://goo.gl/ZtqLv1.
            y.ip = headers['x-forwarded-for'].split(',')[0];
        } else {
            y.ip = request.connection.remoteAddress;
        }
        return y;
    };

    exports.parse = function (x) {
     // This function needs documentation.
        return JSON.parse(x, function (key, val) {
         // This function needs documentation.
            /*jslint unparam: true */
            if (typeof val === 'string') {
                return val.replace(/[$][{]([A-Z0-9_]+)[}]/g, function ($0, $1) {
                 // This function needs documentation.
                    return process.env[$1];
                });
            }
            return val;
        });
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
