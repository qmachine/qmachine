//- JavaScript source code

//- tests.js ~~
//
//  I wrote these tests for use with PhantomJS because I am sick of typing them
//  out over and over in the Chrome console. It's close enough to using Node.js
//  that I lied to JSLint about it, hehe.
//
//  NOTE: I need to rewrite this junk so it uses Quanah ...
//
//                                                      ~~ (c) SRW, 28 Nov 2012
//                                                  ~~ last updated 02 Feb 2013

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var Q, exit, mothership, n, queue, register_test, run_test;

 // Definitions

    Q = require('../cache/quanah');

    exit = function (code) {
     // This function needs documentation.
        /*global phantom: false */
        n -= 1;
        if (n === 0) {
            setTimeout(phantom.exit, 0, code);
        }
        return;
    };

    mothership = 'http://localhost:8177';

    queue = [];

    register_test = function (y, f) {
     // This function needs documentation.
        queue.push({f: f, y: y});
        return;
    };

    run_test = function (y, f) {
     // This function needs documentation.
        if (n === undefined) {
            console.log('Running ' + queue.length + ' tests ...');
            n = queue.length;
        }
        var homepage = require('webpage').create();
        homepage.onConsoleMessage = function (message) {
         // This function needs documentation.
            homepage.close();
            console.log(message);
            if (message === y) {
                return exit(0);
            }
            if (message.slice(0, 6) === 'Error:') {
                return exit(1);
            }
            console.log('Incorrect answer!');
            return exit(2);
        };
        homepage.onError = function (message) {
         // This function needs documentation.
            console.error('Error:', JSON.stringify(message, undefined, 4));
            return exit(1);
        };
        homepage.onResourceReceived = function (response) {
         // This function needs documentation.
            return;
        };
        homepage.onResourceRequested = function (request) {
         // This function needs documentation.
            //console.log(request.method, request.url);
            return;
        };
        homepage.open(mothership, function (status) {
         // This function needs documentation.
            if (status !== 'success') {
                console.error('Something went wrong:', status);
                return exit(1);
            }
            console.log('Running test ...');
            homepage.evaluate(f);
            return;
        });
        return;
    };

 // Test definitions

    console.log('NOTE: Remember to launch a worker for "sean"!');

    register_test('Results: 1', function f() {
     // This function tests "Method Q" for the case when all parameters for
     // remote execution are specified explicitly to the constructor.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var x = window.QM.avar({box: 'sean', val: 0});
        x.Q(function (evt) {
         // This function needs documentation.
            this.val += 1;
            return evt.exit();
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 2', function f() {
     // This function tests "Method Q" for the case when the `box` and `val`
     // parameters are assigned after the avar has been constructed.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var x = window.QM.avar();
        x.box = 'sean';
        x.val = 0;
        x.Q(function (evt) {
         // This function needs documentation.
            this.val += 2;
            return evt.exit();
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 3', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the transform `f` is an anonymous JavaScript function.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'sean',
            f: function (x) {
             // This function needs documentation.
                return x + 2;
            },
            x: 1
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 4', function f() {
     // This function tests `QM.submit` for the case when the input arguments
     // are entered individually.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit(2, function (x) {
         // This function needs documentation.
            return x + 2;
        }, 'sean').Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 5', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the transform `f` is a CoffeeScript string.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'sean',
            f: '(x) -> x + 2',
            x: 3
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 6', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the data `x` are represented by an avar.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'sean',
            f: function (x) {
             // This function needs documentation.
                return x + 2;
            },
            x: window.QM.avar({val: 4})
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 7', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object, the transform `f` is a CoffeeScript string, and the data `x`
     // are represented by an avar.
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'sean',
            f: '(x) -> x + 3',
            x: window.QM.avar({val: 4})
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 8', function f() {
     // This function tests `QM.submit` for the case when the input argument is
     // an object and the data `x` are represented by an avar with an explicit
     // `box` value. The expected behavior here is to use "sean", not "booger".
        /*jslint browser: true */
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        window.QM.submit({
            box: 'sean',
            f: function (x) {
             // This function needs documentation.
                return x * 2;
            },
            x: window.QM.avar({box: 'booger', val: 4})
        }).Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 3,6,9,12,15', function f() {
     // This function needs documentation.
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var mapf, x;
        mapf = '(x) -> 3 * x';
        x = [1, 2, 3, 4, 5];
        window.QM.map(x, mapf, 'sean').Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 15', function f() {
     // This function needs documentation.
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var redf, x;
        redf = '(a, b) -> a + b';
        x = [1, 2, 3, 4, 5];
        window.QM.reduce(x, redf, 'sean').Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

    register_test('Results: 45', function f() {
     // This function needs documentation.
        if (window.hasOwnProperty('QM') === false) {
            setTimeout(f, 0);
            return;
        }
        var mapf, redf, x;
        mapf = '(x) -> 3 * x';
        redf = '(a, b) -> a + b';
        x = [1, 2, 3, 4, 5];
        window.QM.mapreduce(x, mapf, redf, 'sean').Q(function (evt) {
         // This function needs documentation.
            console.log('Results:', this.val);
            return evt.exit();
        }).on('error', function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            return;
        });
        return;
    });

 // Invocations

    (function () {

        var i;

        n = queue.length;

        for (i = 0; i < n; i += 1) {
            run_test(queue[i].y, queue[i].f);
        }

        return;

    }());

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
