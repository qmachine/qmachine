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
//                                                  ~~ last updated 26 Jan 2013

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var exit, mothership, n, run_test;

 // Definitions

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

    n = 8;

    run_test = function (y, f) {
     // This function needs documentation.
        var homepage = require('webpage').create();
        homepage.onConsoleMessage = function (message) {
         // This function needs documentation.
            console.log(message);
            if (message === y) {
                homepage.close();
                exit(0);
            }
            if (message.slice(6) === 'Error:') {
                exit(1);
            }
            return;
        };
        homepage.onError = function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            exit(1);
            return;
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

 // Invocations

    console.log('NOTE: Remember to launch a worker for "sean"!');

    run_test('Results: 1', function f() {
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

    run_test('Results: 2', function f() {
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

    run_test('Results: 3', function f() {
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

    run_test('Results: 4', function f() {
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

    run_test('Results: 5', function f() {
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

    run_test('Results: 6', function f() {
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
            x: QM.avar({val: 4})
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

    run_test('Results: 7', function f() {
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
            x: QM.avar({val: 4})
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

    run_test('Results: 8', function f() {
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
            x: QM.avar({box: 'booger', val: 4})
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

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
