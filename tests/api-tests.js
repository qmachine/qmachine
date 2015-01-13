//- JavaScript source code

//- api-tests.js ~~
//
//  This file is a self-contained Node.js program that verifies the correctness
//  of a particular implementation of QMachine's HTTP API. This program does
//  not test the performance of the implementation under load.
//
//                                                      ~~ (c) SRW, 10 Jan 2015
//                                                  ~~ last updated 12 Jan 2015

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        box, 'Content-Length', 'Content-Type', data, end, error, exit,
        hasOwnProperty, headers, hostname, join, key, label, length, log,
        message, method, on, path, port, push, req, request, res, shift,
        status, statusCode, stringify, val, write
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
     // This function sends a single HTTP API call to the specified endpoint.
        var handler, options, req;
        handler = function (res) {
         // This function checks that the response matches what was expected.
            if (res.statusCode !== obj.res.statusCode) {
                return callback(new Error('status code mismatch (' +
                        res.statusCode + ' !== ' + obj.res.statusCode + ')'));
            }
            var temp = [];
            res.on('data', function (chunk) {
             // This function accumulates the response data as it comes in.
                temp.push(chunk);
                return;
            });
            res.on('end', function () {
             // This function checks that the response data matches what was
             // expected.
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
     // This function accepts arrays of objects that describe individual API
     // calls to be made. These calls will be made sequentially in FIFO order
     // by calling this function recursively from a callback function.
        var job = sequence.shift();
        if (job === undefined) {
            return;
        }
        make_call(job, function (err) {
         // This function is a callback function that will run `test` again
         // recursively.
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
     // This function always runs last, just before the program terminates.
        if (code === 0) {
            console.log('Success: all basic API tests passed.');
        } else {
            console.error('Exiting due to error ...');
        }
        return;
    });

 // Tests

    test([{
        'label': 'Simple test for the `get_avar` route',
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
        'label': 'Simple test for the `get_list` route',
        'req': {
            'method': 'GET',
            'path': '/box/simpletest?status=get_list'
        },
        'res': {
            'data': '[]',
            'statusCode': 200
        }
    }]);

    test([{
        'label': 'Simple test for the `set_avar` route',
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

    test([{
        'label': 'GET requests must specify a non-empty "box"',
        'req': {
            'method': 'GET',
            'path': '/box/?key=hello'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'GET requests must specify a "key" or a "status"',
        'req': {
            'method': 'GET',
            'path': '/box/justabox?'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'GET requests cannot specify both a "key" and a "status"',
        'req': {
            'method': 'GET',
            'path': '/box/toomanyparameters?key=hello&status=world'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'GET requests cannot specify both a "status" and a "key"',
        'req': {
            'method': 'GET',
            'path': '/box/sretemarapynamoot?status=hello&key=world'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'POST requests must specify a "key" in URL',
        'req': {
            'data': '{"box":"justabox","key":"abc123","val":2}',
            'headers': {
                'Content-Length': 41,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/justabox?'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `set_avar` route, the body must not be empty',
        'req': {
            'method': 'POST',
            'path': '/box/emptybody?key=abc123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `set_avar` route, "key" in body must match URL param',
        'req': {
            'data': '{"box":"justabox","key":"csharp","val":2}',
            'headers': {
                'Content-Length': 41,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/mismatchedkeys?key=abc123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `get_avar` route, "box" supports the expected characters',
        'req': {
            'method': 'GET',
            'path': '/box/ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    'abcdefghijklmnopqrstuvwxyz0123456789_-?key=deadbeef'
        },
        'res': {
            'data': '{}',
            'statusCode': 200
        }
    }]);

    test([{
        'label': 'In `get_list` route, "box" supports the expected characters',
        'req': {
            'method': 'GET',
            'path': '/box/ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    'abcdefghijklmnopqrstuvwxyz0123456789_-?status=waiting'
        },
        'res': {
            'data': '[]',
            'statusCode': 200
        }
    }]);

    test([{
        'label': 'In `set_avar` route, "box" supports the expected characters',
        'req': {
            'data': '{"box":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrst' +
                    'uvwxyz0123456789_-","key":"abc123","val":2}',
            'headers': {
                'Content-Length': 97,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    'abcdefghijklmnopqrstuvwxyz0123456789_-?key=abc123'
        },
        'res': {
            'data': '',
            'statusCode': 201
        }
    }]);

    test([{
        'label': 'In `set_avar` route, "box" cannot be zero-length for avar',
        'req': {
            'data': '{"box":"","key":"regular_avar","val":2}',
            'headers': {
                'Content-Length': 39,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/?key=regular_avar'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': '`set_avar` route must specify a non-empty "box" for task',
        'req': {
            'data': '{"box":"","key":"task_avar","status":"waiting","val":2}',
            'headers': {
                'Content-Length': 55,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/?key=task_avar'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
     // NOTE: This test may not actually be important ...
        'label': 'In `get_avar` route, "box" cannot contain a `.` character',
        'req': {
            'method': 'GET',
            'path': '/box/mongo.badness?key=deadbeef'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
     // NOTE: This test may not actually be important ...
        'label': 'In `get_list` route, "box" cannot contain a `.` character',
        'req': {
            'method': 'GET',
            'path': '/box/mongo.badness?status=waiting'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
     // NOTE: This test may not actually be important ...
        'label': 'In `set_avar` route, "box" cannot contain a `.` character',
        'req': {
            'data': '{"box":"mongo.badness","key":"abc123","val":2}',
            'headers': {
                'Content-Length': 46,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/mongo.badness?key=abc123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `get_avar` route, "box" cannot contain a `&` character',
        'req': {
            'method': 'GET',
            'path': '/box/param&badness?key=deadbeef'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `get_list` route, "box" cannot contain a `&` character',
        'req': {
            'method': 'GET',
            'path': '/box/param&badness?status=waiting'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `set_avar` route, "box" cannot contain a `&` character',
        'req': {
            'data': '{"box":"param&badness","key":"abc123","val":2}',
            'headers': {
                'Content-Length': 46,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/param&badness?key=abc123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `get_avar` route, "key" supports the expected characters',
        'req': {
            'method': 'GET',
            'path': '/box/deadbeef?key=ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    'abcdefghijklmnopqrstuvwxyz0123456789_-'
        },
        'res': {
            'data': '{}',
            'statusCode': 200
        }
    }]);

    test([{
        'label': 'In `set_avar` route, "key" supports the expected characters',
        'req': {
            'data': '{"box":"abc123","key":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef' +
                    'ghijklmnopqrstuvwxyz0123456789_-","val":2}',
            'headers': {
                'Content-Length': 97,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/abc123?key=ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    'abcdefghijklmnopqrstuvwxyz0123456789_-'
        },
        'res': {
            'data': '',
            'statusCode': 201
        }
    }]);

    test([{
     // NOTE: This test may not actually be important ...
        'label': 'In `get_avar` route, "key" cannot contain a `.` character',
        'req': {
            'method': 'GET',
            'path': '/box/parambadness?key=abc.123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
     // NOTE: This test may not actually be important ...
        'label': 'In `set_avar` route, "key" cannot contain a `.` character',
        'req': {
            'data': '{"box":"parambadness","key":"abc.123","val":2}',
            'headers': {
                'Content-Length': 46,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/param&badness?key=abc.123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

 /*
    test([{
     // This test doesn't work because URLs are parsed such that "key" and
     // "waiting" will be treated as different query parameters anyway :-)
        'label': 'In `get_avar` route, "key" cannot contain a `&` character',
        'req': {
            'method': 'GET',
            'path': '/box/parambadness?key=abc&123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);
 */

    test([{
     // This request should fail for at least two reasons. First, the URL will
     // be parsed with two query parameters, "key" and "123"; thus, the value
     // of "key" will be "abc", which won't match the value given in the body
     // of the request. The second reason the request should fail is because
     // the internal key contains `&`, which shouldn't be allowed.
        'label': 'In `set_avar` route, "key" cannot contain a `&` character',
        'req': {
            'data': '{"box":"parambadness","key":"abc&123","val":2}',
            'headers': {
                'Content-Length': 46,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/param&badness?key=abc&123'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    test([{
        'label': 'In `get_list` route, "status" supports the expected ' +
                'characters',
        'req': {
            'method': 'GET',
            'path': '/box/waiting?status=ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                    'abcdefghijklmnopqrstuvwxyz0123456789_-'
        },
        'res': {
            'data': '[]',
            'statusCode': 200
        }
    }]);

    test([{
        'label': 'In `set_avar` route, "status" of body supports the ' +
                'expected characters',
        'req': {
            'data': '{"box":"lala","key":"lele","status":"ABCDEFGHIJKLMNOPQR' +
                    'STUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-","val":2}',
            'headers': {
                'Content-Length': 111,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/lala?key=lele'
        },
        'res': {
            'data': '',
            'statusCode': 201
        }
    }]);

    test([{
     // NOTE: This test may not actually be important ...
        'label': 'In `get_list` route, "status" cannot contain a `.` character',
        'req': {
            'method': 'GET',
            'path': '/box/parambadness?status=still.waiting'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

 /*
    test([{
     // This test doesn't work because URLs are parsed such that "status" and
     // "waiting" will be treated as different query parameters anyway :-)
        'label': 'In `get_list` route, "status" cannot contain a `&` character',
        'req': {
            'method': 'GET',
            'path': '/box/parambadness?status=still&waiting'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);
 */

    test([{
        'label': 'In `set_avar` route, "status" of body cannot contain a ' +
                '`&` character',
        'req': {
            'data': '{"box":"lala","key":"lele","status":"pb&j","val":2}',
            'headers': {
                'Content-Length': 51,
                'Content-Type': 'application/json'
            },
            'method': 'POST',
            'path': '/box/lala?key=lele'
        },
        'res': {
            'data': '',
            'statusCode': 444
        }
    }]);

    (function () {

        var i, n, temp, x1, x2;

        n = 1024 * 1024; // to create a body > 1 MB in length

        temp = '';

        for (i = 0; i < n; i += 1) {
            temp += 'x';
        }

        x1 = JSON.stringify({
            'box': 'biguglyupload',
            'key': 'regular_avar',
            'val': temp
        });

        x2 = JSON.stringify({
            'box': 'biguglyupload',
            'key': 'task_avar',
            'status': 'not-a-real-task',
            'val': temp
        });

        test([{
            'label': 'In `set_avar` route, upload size is limited for avar',
            'req': {
                'data': x1,
                'headers': {
                    'Content-Length': x1.length,
                    'Content-Type': 'application/json'
                },
                'method': 'POST',
                'path': '/box/biguglyupload?key=regular_avar'
            },
            'res': {
                'data': '',
                'statusCode': 444
            }
        }, {
            'label': 'In `set_avar` route, upload size is limited for task',
            'req': {
                'data': x2,
                'headers': {
                    'Content-Length': x2.length,
                    'Content-Type': 'application/json'
                },
                'method': 'POST',
                'path': '/box/biguglyupload?key=task_avar'
            },
            'res': {
                'data': '',
                'statusCode': 444
            }
        }]);

        return;

    }());

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
