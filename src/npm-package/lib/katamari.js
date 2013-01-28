//- JavaScript source code

//- katamari.js ~~
//
//  This is adapted from a previously unpublished NPM module I wrote.
//
//                                                      ~~ (c) SRW, 11 Dec 2012
//                                                  ~~ last updated 27 Jan 2013

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var Q, avar, fs, ignore_patterns, mime_types, path, roll_up, unroll;

 // Definitions

    Q = require('quanah');

    avar = Q.avar;

    fs = require('fs');

    ignore_patterns = [
        /^[.]/
    ];

    mime_types = {
        '':             'text/plain',
        '.appcache':    'text/cache-manifest',
        '.css':         'text/css',
        '.html':        'text/html; charset=utf-8',
        '.ico':         'image/x-icon',
        '.jpg':         'image/jpeg',
        '.js':          'text/javascript',
        '.json':        'application/json',
        '.manifest':    'text/cache-manifest',
        '.png':         'image/png',
        '.txt':         'text/plain',
        '.xml':         'application/xml'
    };

    path = require('path');

    roll_up = function (public_html, json_file) {
     // This function needs documentation.
        var dirpath, y;
        dirpath = path.normalize(public_html);
        y = avar({val: {}});
        y.Q(function (evt) {
         // This function checks to see that the input argument is actually a
         // directory.
            fs.lstat(dirpath, function (err, stats) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                if (stats.isDirectory() === false) {
                    return evt.fail('"' + dirpath + '" is not a directory.');
                }
                return evt.exit();
            });
            return;
        }).Q(function (evt) {
         // This function reads all files located in the top level of `dirpath`
         // into memory as the properties of an object.
            fs.readdir(dirpath, function (err, files) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                var count, remaining;
                count = function () {
                 // This function needs documentation.
                    remaining -= 1;
                    if (remaining === 0) {
                        return evt.exit();
                    }
                    return;
                };
                remaining = files.length;
                files.forEach(function (name) {
                 // This function needs documentation.
                    var flag, filepath, i, n;
                    flag = (name === json_file);
                    n = ignore_patterns.length;
                    for (i = 0; (flag === false) && (i < n); i += 1) {
                        flag = ignore_patterns[i].test(name);
                    }
                    if (flag === true) {
                        return count();
                    }
                    filepath = path.join(dirpath, name);
                    fs.lstat(filepath, function (err, stats) {
                     // This function needs documentation.
                        if (err !== null) {
                            return evt.fail(err);
                        }
                     /*
                        if (stats.isDirectory()) {
                         // Recurse ...
                            roll_up(filepath).Q(function (evt) {
                             // This function isn't working correctly yet ...
                                var key, temp, x;
                                x = this.val;
                                for (key in x) {
                                    if (x.hasOwnProperty(key)) {
                                        console.log(filepath, '-->', key);
                                        temp = path.resolve(filepath, key);
                                        y.val[temp] = x[key];
                                    }
                                }
                                count();
                                return evt.exit();
                            }).on('error', function (message) {
                             // This function needs documentation.
                                return evt.fail(message);
                            });
                            return;
                        }
                     */
                        if (stats.isFile() === false) {
                            return count();
                        }
                        fs.readFile(filepath, function (err, file) {
                         // This function needs documentation.
                            if (err !== null) {
                                return evt.fail(err);
                            }
                            var temp = {
                                buffer:     file,
                                mime_type:  mime_types[path.extname(name)]
                            };
                            if (temp.mime_type === undefined) {
                                temp.mime_type = 'application/octet-stream';
                            }
                            y.val['/' + name] = temp;
                            if (name === 'index.html') {
                                y.val['/'] = {
                                    buffer:     file,
                                    mime_type:  mime_types['.html']
                                };
                            }
                            return count();
                        });
                        return;
                    });
                    return;
                });
                return;
            });
            return;
        }).Q(function (evt) {
         // This function writes `y.val` as JSON to `json_file` if the second
         // input argument was a string.
            if (typeof json_file !== 'string') {
                console.log('Not a string.');
                return evt.exit();
            }
            var filepath, key, obj;
            filepath = path.normalize(json_file);
            obj = y.val;
            for (key in obj) {
             // This function needs documentation.
                if (obj.hasOwnProperty(key)) {
                    try {
                        obj[key].base64 = obj[key].buffer.toString('base64');
                        delete obj[key].buffer;
                    } catch (err) {
                        console.error(err, key);
                    }
                }
            }
            fs.writeFile(filepath, JSON.stringify(obj), function (err) {
             // This function needs documentation.
                if (err !== null) {
                    return evt.fail(err);
                }
                console.log('Saved to "' + filepath + '".');
                return evt.exit();
            });
            return;
        }).on('error', function (message) {
         // This is a default error handler that can be overwritten.
            console.error('Error:', message);
            return;
        });
        return y;
    };

    unroll = function (filename) {
     // This function needs documentation.
        var key, x, y;
        x = require(filename);
        y = {};
        for (key in x) {
            if (x.hasOwnProperty(key)) {
                y[key] = {
                    buffer:     new Buffer(x[key].base64, 'base64'),
                    mime_type:  x[key].mime_type
                };
            }
        }
        return y;
    };

 // Out-of-scope definitions

    exports.roll_up = roll_up;

    exports.unroll = unroll;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
