//- JavaScript source code

//- server.js ~~
//                                                      ~~ (c) SRW, 18 May 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var cluster, config, http, url;

 // Definitions

    cluster = require('cluster');

    config = {
        app:    'http://127.0.0.1:5984/db/_design/app',
        host:   'qmachine.org',
        port:   80,
        www:    'http://127.0.0.1:5984/www/_design/app/_rewrite'
    };

    http = require('http');

    url = require('url');

 // Invocations

    http.globalAgent.maxSockets = 100;  //- still experimental ...

    if (cluster.isMaster) {

        (function () {

            var spawn_worker;

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

            require('os').cpus().forEach(spawn_worker);

            cluster.on('death', function (worker) {
             // This function needs documentation.
                console.log('Process ' + worker.pid + ' exited.');
                spawn_worker();
                return;
            });

            return;

        }());

        return;

    }

 // NOTE: I'm still not sure if this should be `http.Server`, as the online
 // documentation shows, or `http.createServer`, which is the "usual" answer.
 // I really need to find out what subtleties are involved here ...

    http.Server(function (outer_req, outer_res) {
     // This function needs documentation.
        var inner_req, options, pat, target;
        if (outer_req.method === 'OPTIONS') {
         // Case 1
            outer_res.writeHead('204', '(no content)', {
                'Access-Control-Allow-Origin':  '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept',
                'Access-Control-Max-Age':       10, //- seconds
                'Content-Length':               0
            });
            outer_res.end();
            return;
        }
        if ((outer_req.method !== 'GET') && (outer_req.method !== 'POST')) {
         // Terminate with extreme prejudice.
            outer_res.writeHead(444);
            outer_res.end();
            return;
        }
        outer_res.setHeader('Access-Control-Allow-Origin', '*');
        pat = /^\/box\/([^\&\/]+)[?](key|status)[=]([^\&]+)$/;
        target = outer_req.url.replace(pat, function (all, box, pkey, pval) {
         // This function needs documentation.
            var y = config.app + '/_';
            if (pkey === 'key') {
                if (outer_req.method === 'GET') {
                    return y + 'show/data/' + box + '&' + pval;
                }
                return y + 'update/timestamp/' + box + '&' + pval;
            }
            return y + 'list/as-array/jobs?key=["' + box + '","' + pval + '"]';
        });
        if (target === outer_req.url) {
            options = url.parse(config.www + outer_req.url);
        } else {
            options = url.parse(encodeURI(target));
        }
        options.headers = outer_req.headers;
        options.headers['Content-Type'] = 'application/json';
        options.method = outer_req.method;
        inner_req = http.request(options, function (inner_res) {
         // This function needs documentation.
            outer_res.writeHead(inner_res.statusCode, inner_res.headers);
            inner_res.pipe(outer_res);
            return;
        });
        outer_req.pipe(inner_req);
        return;
    }).listen(config.port, config.host);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
