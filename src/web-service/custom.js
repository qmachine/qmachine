//- JavaScript source code

//- custom.js ~~
//                                                      ~~ (c) SRW, 09 Dec 2013
//                                                  ~~ last updated 09 Dec 2013

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Module definitions

    exports.log = function (request) {
     // This is a custom logging function that executes once for every request
     // if logging is enabled. This function is optional, however, because
     // QMachine provides a default logging function; feel free to delete or
     // adapt it as needed :-)
        var data = {
            host: request.headers.host,
            method: request.method,
            timestamp: new Date(),
            url: request.url
        };
        if (request.headers.hasOwnProperty('cf-ipcountry')) {
         // This header is specific to CloudFlare (www.cloudflare.com), but
         // storing the header with a hyphen inside can cause problems in query
         // languages like Hive. Thus, we use a hyphen convention.
            data.cf_ipcountry = request.headers['cf-ipcountry'];
        }
        if (request.headers.hasOwnProperty('x-forwarded-for')) {
            data.ip = request.headers['x-forwarded-for'].split(',')[0];
        } else {
            data.ip = request.connection.remoteAddress;
        }
        return data;
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
