//- JavaScript source code

//- replicate.js ~~
//
//  The predecessor was tested successfully on the following platforms:
//
//  - Mac OS X 10.7 + Node.js 0.6.18 + CouchDB 1.2.0
//  - Centos 6 + Node.js 0.6.17 + CouchDB 1.2.0
//
//  The cloud source is running CouchDB 1.1.1 on an unknown operating system.
//
//  I haven't tested it under Node.js 0.8 yet.
//
//                                                      ~~ (c) SRW, 30 Jun 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var qm;

 // Definitions

    qm = require('lib/qm');

 // Demonstrations

    qm.begin_sync([
        {
          //continuous: true,
            doc_ids:    ['_design/app'],
            source:     'https://qmachine.iriscouch.com:6984/db',
            target:     'http://localhost:5984/db'
        },
        {
          //continuous: true,
            doc_ids:    ['_design/app'],
            source:     'https://qmachine.iriscouch.com:6984/www',
            target:     'http://localhost:5984/www'
        }
    ]);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
