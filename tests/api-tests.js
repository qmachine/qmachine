//- JavaScript source code

//- api-tests.js ~~
//                                                      ~~ (c) SRW, 10 Jan 2015
//                                                  ~~ last updated 10 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        'Content-Length', 'Content-Type', data, end, error, exit,
        hasOwnProperty, headers, hostname, join, label, log, message, method,
        on, path, port, push, req, request, res, shift, statusCode, write
    */

 // Declarations

    var config, http, make_call, test;

 // Definitions

    config = {
        'hostname': 'localhost',
        'port': 8177
    };

    http = require('http');

    make_call = function (obj, callback) {
     // This function needs documentation.
        if ((obj instanceof Object) === false) {
            throw new TypeError('`make_call` expects an object as input.');
        }
        var handler, options, req;
        handler = function (res) {
         // This function needs documentation.
            if (res.statusCode !== obj.res.statusCode) {
                throw new Error('status code mismatch (' +
                    res.statusCode + ' !== ' + obj.res.statusCode + ')');
            }
            var temp = [];
            res.on('data', function (chunk) {
             // This function needs documentation.
                temp.push(chunk);
                return;
            });
            res.on('end', function () {
             // This function needs documentation.
                var data = temp.join('');
                if (data !== obj.res.data) {
                    throw new Error('data mismatch (' +
                        data + ' !== ' + obj.res.data + ')');
                }
                callback(null);
                return;
            });
            return;
        };
        options = {
            'hostname': config.hostname,
            'method': obj.req.method,
            'path': obj.req.path,
            'port': config.port
        };
        if (obj.req.hasOwnProperty('headers')) {
            options.headers = obj.req.headers;
        }
        req = http.request(options, handler).on('error', callback);
        if (obj.req.hasOwnProperty('data')) {
            req.write(obj.req.data);
        }
        req.end();
        return;
    };

    test = function (sequence) {
     // This function needs documentation.
        var job = sequence.shift();
        if (job === undefined) {
            return;
        }
        make_call(job, function (err) {
         // This function needs documentation.
            if (err !== null) {
                console.error(job.label + ': ' + err.message);
                process.exit(1);
                return;
            }
            test(sequence);
            return;
        });
        return;
    };

 // Out-of-scope definitions

    process.on('exit', function (code) {
     // This function needs documentation.
        if (code === 0) {
            console.log('Success: all basic API tests passed.');
        } else {
            console.error('Exiting due to error ...');
        }
        return;
    });

 // Tests

    test([{
        'label': 'Simple test for `get_avar`',
        'req': {
            'method': 'GET',
            'path': '/box/simpletest?key=get_avar'
        },
        'res': {
            'data': '{}',
            'statusCode': 200
        }
    }]);

    test([{
        'label': 'Simple test for `get_jobs`',
        'req': {
            'method': 'GET',
            'path': '/box/simpletest?status=get_jobs'
        },
        'res': {
            'data': '[]',
            'statusCode': 200
        }
    }]);

    test([{
        'label': 'Simple test for `set_avar`',
        'req': {
            'data': '{"box":"simpletest","key":"set_avar","val":"ooga"}',
            'headers': {
                'Content-Length': 50,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/simpletest?key=set_avar'
        },
        'res': {
            'data': '',
            'statusCode': 201
        }
    }]);

    test([{
        'label': 'Set a regular avar',
        'req': {
            'data': '{"box":"simpletest","key":"regular_avar","val":2}',
            'headers': {
                'Content-Length': 49,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/simpletest?key=regular_avar'
        },
        'res': {
            'data': '',
            'statusCode': 201
        }
    }, {
        'label': 'Test the value of the regular avar that was just set',
        'req': {
            'method': 'GET',
            'path': '/box/simpletest?key=regular_avar'
        },
        'res': {
            'data': '{"box":"simpletest","key":"regular_avar","val":2}',
            'statusCode': 200
        }
    }]);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
