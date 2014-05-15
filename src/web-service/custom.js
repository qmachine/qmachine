//- JavaScript source code

//- custom.js ~~
//                                                      ~~ (c) SRW, 09 Dec 2013
//                                                  ~~ last updated 14 May 2014

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        cf_connecting_ip, 'cf-connecting-ip', cf_ipcountry, 'cf-ipcountry',
        cf_ray, 'cf-ray', cf_visitor, 'cf-visitor', connection, content_length,
        'content-length', dnt, env, from, hasOwnProperty, headers, host, ip,
        log, method, origin, parse, referer, remoteAddress, replace, split,
        timestamp, url, via, warning, x_att_deviceid, 'x-att-deviceid',
        x_forwarded_for, 'x-forwarded-for', x_forwarded_port,
        'x-forwarded-port', x_forwarded_proto, 'x-forwarded-proto',
        x_request_start, 'x-request-start', x_wap_profile, 'x-wap-profile'
    */

 // Module definitions

    exports.log = function (request) {
     // This is a custom logging function that executes once for every request
     // if logging is enabled. This function is optional, however, because
     // QMachine provides a default logging function. I have used a convention
     // in which hyphens are converted into underscores in order to prevent
     // inconveniences with certain tools that attempt to auto-detect schemas
     // from JSON. Also, I have commented out various headers that I don't
     // personally find useful. Ironically, the "Do Not Track" header (DNT) is
     // logged alongside the tracking data because I don't understand the legal
     // stuff yet, but I will delete all personal data from entries that opted
     // out once I figure out which data are considered "personal".
        var headers, y;
        headers = request.headers;
        y = {
            host: headers.host,
            method: request.method,
            timestamp: new Date(),
            url: request.url
        };
        if (headers.hasOwnProperty('cf-connecting-ip')) {
         // See http://goo.gl/81sHn8.
            y.cf_connecting_ip = headers['cf-connecting-ip'];
        }
        if (headers.hasOwnProperty('cf-ipcountry')) {
         // See http://goo.gl/QpDIBe.
            y.cf_ipcountry = headers['cf-ipcountry'];
        }
     /*
        if (headers.hasOwnProperty('cf-ray')) {
         // See http://goo.gl/wMfrD8.
            y.cf_ray = headers['cf-ray'];
        }
        if (headers.hasOwnProperty('cf-visitor')) {
         // See http://goo.gl/N7W6wJ.
            y.cf_visitor = JSON.parse(headers['cf-visitor']);
        }
     */
        if (headers.hasOwnProperty('content-length')) {
            y.content_length = parseInt(headers['content-length'], 10);
        }
        if (headers.hasOwnProperty('dnt')) {
         // See http://goo.gl/Rrxu4L.
            y.dnt = parseInt(headers.dnt, 10);
        }
        if (headers.hasOwnProperty('from')) {
         // See http://goo.gl/RNi5So.
            y.from = headers.from;
        }
        if (headers.hasOwnProperty('origin')) {
         // See http://goo.gl/BZldtx.
            y.origin = headers.origin;
        }
        if (headers.hasOwnProperty('referer')) {
         // See http://goo.gl/BCW8Vf.
            y.referer = headers.referer;
        }
        if (headers.hasOwnProperty('via')) {
         // See http://goo.gl/RNi5So.
            y.via = headers.via;
        }
        if (headers.hasOwnProperty('warning')) {
         // See http://goo.gl/RNi5So.
            y.warning = headers.warning;
        }
        if (headers.hasOwnProperty('x-forwarded-for')) {
         // See http://goo.gl/ZtqLv1.
            y.ip = headers['x-forwarded-for'].split(',')[0];
        } else {
            y.ip = request.connection.remoteAddress;
        }
        if (headers.hasOwnProperty('x-att-deviceid')) {
         // See http://goo.gl/IRuyx.
            y.x_att_deviceid = headers['x-att-deviceid'];
        }
     /*
        if (headers.hasOwnProperty('x-forwarded-port')) {
         // See http://goo.gl/B8Ks7h.
            y.x_forwarded_port = headers['x-forwarded-port'];
        }
        if (headers.hasOwnProperty('x-forwarded-proto')) {
         // See http://goo.gl/B8Ks7h.
            y.x_forwarded_proto = headers['x-forwarded-proto'];
        }
        if (headers.hasOwnProperty('x-request-start')) {
         // See http://goo.gl/B8Ks7h.
            y.x_request_start = parseInt(headers['x-request-start'], 10);
        }
     */
        if (headers.hasOwnProperty('x-wap-profile')) {
         // See http://goo.gl/vDg0CV.
            y.x_wap_profile = headers['x-wap-profile'];
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
