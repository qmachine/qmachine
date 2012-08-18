//- JavaScript source code

//- replicate.js ~~
//                                                      ~~ (c) SRW, 18 Aug 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var begin_sync, cluster, http, tty, url;

 // Definitions

    begin_sync = function (args) {
     // This function was originally written as a means to set up continuous
     // replication as part of the development workflow, but it isn't always
     // part of the current workflow -- I included it here for posterity :-)
        if (cluster.isWorker) {
            return;
        }
        if (args.length === 0) {
            return;
        }
        var get_input;
        get_input = function (text_prompt, echo, callback) {
         // This function needs documentation.
            var y = '';
            process.stdout.write(text_prompt + ' ');
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.setRawMode(true);
            //tty.setRawMode(true);
            process.stdin.on('data', function get_char(c) {
             // This function needs documentation.
                c += '';
                if ((c === '\n') || (c === '\r') || (c === '\u0004')) {
                 // User has finished typing.
                    process.stdin.setRawMode(false);
                    //tty.setRawMode(false);
                    process.stdout.write('\n');
                    process.stdin.pause();
                    process.stdin.removeListener('data', get_char);
                    callback(y);
                } else if (c === '\u0003') {
                 // User canceled with Ctrl-C.
                    process.stdout.write('(canceled)\n');
                    process.exit();
                } else {
                    process.stdout.write((echo === true) ? c : '');
                    y += c;
                }
                return;
            });
            return;
        };
        console.log('Configuring ' + args[0].target + ' ...');
        get_input('Username:', true, function (username) {
         // This function needs documentation.
            get_input('Password:', false, function (password) {
             // This function needs documentation.
                var options, request;
                options = url.parse(args[0].target);
                options.auth = username + ':' + password;
                args[0].target = url.format(options);
                options.path = '/_replicate';
                options.method = 'POST';
                request = http.request(options, function (response) {
                 // This function needs documentation.
                    var txt = [];
                    response.on('data', function (chunk) {
                     // This function needs documentation.
                        txt.push(chunk.toString());
                        return;
                    });
                    response.on('end', function () {
                     // This function needs documentation.
                        console.log(txt.join(''));
                        args.shift();
                        begin_sync(args);
                        return;
                    });
                    return;
                }).on('error', function (err) {
                 // This function needs documentation.
                    console.error(err);
                    return;
                });
                request.setHeader('Content-Type', 'application/json');
                request.write(JSON.stringify(args[0]));
                request.end();
                return;
            });
            return;
        });
        return;
    };

    cluster = require('cluster');

    http = require('http');

    tty = require('tty');

    url = require('url');

 // Prototype definitions

 // Out-of-scope definitions

    exports.begin_sync = begin_sync;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
