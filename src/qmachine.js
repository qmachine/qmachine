//- JavaScript source code

//- qmachine.js ~~
//                                                      ~~ (c) SRW, 16 Apr 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, ajax_request, avar, box, http_GET, http_POST, isBrowser, isNodejs,
        mothership;

 // Definitions

    Q = Object.prototype.Q;

    ajax_request = function () {
     // This function generates a new AJAX request object. I have not yet
     // experimented with Web Sockets, but unless CouchDB supports them,
     // that is an exciting technology that must wait for another day ;-)
        var req;
        if (global.hasOwnProperty('XMLHttpRequest')) {
            req = new global.XMLHttpRequest();
        } else if (global.hasOwnProperty('ActiveXObject')) {
            req = new global.ActiveXObject('Microsoft.XMLHTTP');
        } else {
            throw new Error('This browser does not support AJAX.');
        }
        return req;
    };

    avar = Q.avar;

    box = (function () {
     // This function generates a random hexadecimal string of length 32.
        var y = '';
        while (y.length < 32) {
            y += Math.random().toString(16).slice(2, 34 - y.length);
        }
        return y;
    }());

    http_GET = function (x) {
     // This function needs documentation.
        var y = avar(x);
        y.box = x.box;
        y.onready = function (evt) {
         // This function needs documentation.
            if (isBrowser() === false) {
                return evt.exit();
            }
            var href, req;
            if (x.hasOwnProperty('key')) {
                href = mothership + '/box/' + x.box + '?key=' + x.key;
            } else if (x.hasOwnProperty('status')) {
                href = mothership + '/box/' + x.box + '?status=' + x.status;
            } else {
                return evt.fail('No flags specified for "http_GET".');
            }
            req = ajax_request();
            req.onreadystatechange = function () {
             // This function needs documentation.
                if (req.readyState === 4) {
                    if (req.status !== 200) {
                        return evt.fail(req.responseText);
                    }
                    y.val = req.responseText;
                    return evt.exit();
                }
                return;
            };
            req.open('GET', href, true);
            req.send(null);
            return;
        };
        y.onready = function (evt) {
         // This function needs documentation.
            /*jslint node: true */
            if (isNodejs() === false) {
                return evt.exit();
            }
            var href, module_http, module_url, options, req;
            if (x.hasOwnProperty('key')) {
                href = mothership + '/box/' + x.box + '?key=' + x.key;
            } else if (x.hasOwnProperty('status')) {
                href = mothership + '/box/' + x.box + '?status=' + x.status;
            } else {
                return evt.fail('No flags specified for "http_GET".');
            }
            module_http = require('http');
            module_url = require('url');
            options = module_url.parse(href);
            req = module_http.request(options, function (res) {
             // This function needs documentation.
                var txt = [];
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                 // This function needs documentation.
                    txt.push(chunk.toString());
                    return;
                });
                res.on('end', function () {
                 // This function needs documentation.
                    y.val = txt.join('');
                    return evt.exit();
                });
                return;
            });
            req.on('error', function (err) {
             // This function needs documentation.
                return evt.fail(err);
            });
            req.end();
            return;
        };
        return y;
    };

    http_POST = function (x) {
     // This function needs documentation.
        var y = avar(x);
        y.box = x.box;
        y.onready = function (evt) {
         // This function needs documentation.
            if (isBrowser() === false) {
                return evt.exit();
            }
            var href, req;
            href = mothership + '/box/' + y.box + '?key=' + y.key;
            req = ajax_request();
            req.onreadystatechange = function () {
             // This function needs documentation.
                if (req.readyState === 4) {
                    if (req.status !== 201) {
                        return evt.fail(req.responseText);
                    }
                    y.val = req.responseText;
                    return evt.exit();
                }
                return;
            };
            req.open('POST', href, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(y));
            return;
        };
        y.onready = function (evt) {
         // This function needs documentation.
            /*jslint node: true */
            if (isNodejs() === false) {
                return evt.exit();
            }
            var href, module_http, module_url, options, req;
            href = mothership + '/box/' + y.box + '?key=' + y.key;
            module_http = require('http');
            module_url = require('url');
            options = module_url.parse(href);
            options.method = 'POST';
            req = module_http.request(options, function (res) {
             // This function needs documentation.
                var txt = [];
                res.on('data', function (chunk) {
                 // This function needs documentation.
                    txt.push(chunk.toString());
                    return;
                });
                res.on('end', function () {
                 // This function needs documentation.
                    y.val = txt.join('');
                    return evt.exit();
                });
                return;
            });
            req.on('error', function (err) {
             // This function needs documentation.
                return evt.fail(err);
            });
            req.setHeader('Content-Type', 'application/json');
            req.write(JSON.stringify(y));
            req.end();
            return;
        };
        return y;
    };

    isBrowser = function (f) {
     // This function needs documentation.
        return ((global.hasOwnProperty('location'))             &&
                (global.hasOwnProperty('navigator'))            &&
                (global.hasOwnProperty('phantom') === false)    &&
                (global.hasOwnProperty('system') === false));
    };

    isNodejs = function (f) {
     // This function needs documentation.
        return ((global.hasOwnProperty('process') === true));
    };

    mothership = 'http://qmachine.org';

 // Out-of-scope definitions

    if (avar().constructor.prototype.hasOwnProperty('box') === false) {
        Object.defineProperty(avar().constructor.prototype, 'box', {
            configurable: true,
            enumerable: false,
            get: function () {
             // This function needs documentation.
                return box;
            },
            set: function (x) {
             // This function needs documentation.
                Object.defineProperty(this, 'box', {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: x.toString()
                });
                return;
            }
        });
    }

    if (Q.hasOwnProperty('box') === false) {
        Object.defineProperty(Q, 'box', {
            configurable: false,
            enumerable: true,
            get: function () {
             // This function needs documentation.
                return box;
            },
            set: function (x) {
             // This function needs documentation.
                box = x.toString();
                return;
            }
        });
    }

    Q.init({
        jobs: function (box) {
         // This function needs documentation.
            var x, y;
            x = {box: (box || Q.box), status: 'waiting', val: []};
            y = http_GET(x);
            y.onready = function (evt) {
             // This function needs documentation.
                y.val = JSON.parse(y.val);
                return evt.exit();
            };
            return y;
        },
        read: function (x) {
         // This function needs documentation.
            var y = http_GET(x);
            y.onready = function (evt) {
             // This function needs documentation.
                var key, temp;
                temp = avar(y.val);
                for (key in temp) {
                    if (temp.hasOwnProperty(key)) {
                        y[key] = temp[key];
                    }
                }
                return evt.exit();
            };
            return y;
        },
        write: function (x) {
         // This function needs documentation.
            return http_POST(x);
        }
    });

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
