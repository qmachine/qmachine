//- JavaScript source code

//- syntax-check.js ~~
//
//  During the build process, it is possible to download external JS files that
//  are incomplete due to hosting errors. This script uses Node.js to compile
//  (but not execute) JS files as a basic check for completeness of the files
//  that have been downloaded.
//
//                                                      ~~ (c) SRW, 10 Nov 2014
//                                                  ~~ last updated 10 Nov 2014

(function () {
    'use strict';

 // Pragmas

    /*global */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties argv, createScript, readFile */

 // Prerequisites

 // Declarations

    var check, fs, vm;

 // Definitions

    check = function (filename) {
     // This function needs documentation.
        fs.readFile(filename, function (err, data) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
         // Let `vm.createScript` throw an exception if there's a syntax error.
            vm.createScript(data, filename);
            return;
        });

        return;
    };

    fs = require('fs');

    vm = require('vm');

 // Invocations

    check(process.argv[2]);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
