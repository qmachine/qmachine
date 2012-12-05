//- JavaScript source code

//- tests.js ~~
//
//  I wrote these tests for use with PhantomJS because I am sick of typing them
//  out over and over in the Chrome console. It's close enough to using Node.js
//  that I lied to JSLint about it, hehe.
//
//                                                      ~~ (c) SRW, 28 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var mothership, run_test;

 // Definitions

    mothership = 'http://localhost:8177';

    run_test = function (y, f) {
     // This function needs documentation.
        var homepage = require('webpage').create();
        homepage.onConsoleMessage = function (message) {
         // This function needs documentation.
            console.log(message);
            if (message === y) {
                homepage.close();
                setTimeout(phantom.exit, 0);
            }
            if (message.slice(6) === 'Error:') {
                setTimeout(phantom.exit, 0, 1);
            }
            return;
        };
        homepage.onError = function (message) {
         // This function needs documentation.
            console.error('Error:', message);
            setTimeout(phantom.exit, 0, 1);
            return;
        };
        homepage.onResourceReceived = function (response) {
         // This function needs documentation.
            return;
        };
        homepage.onResourceRequested = function (request) {
         // This function needs documentation.
            console.log(request.method, request.url);
            return;
        };
        homepage.open(mothership, function (status) {
         // This function needs documentation.
            if (status !== 'success') {
                console.error('Something went wrong:', status);
                return phantom.exit(1);
            }
            console.log('Running test ...');
            homepage.evaluate(f);
            return;
        });
        return;
    };

 // Invocations

    run_test('Results: 4', function () {
     // This function needs documentation.
        var x = window.QM.avar({box: 'sean', val: 2});
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

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
