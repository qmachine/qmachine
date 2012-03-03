//- JavaScript source code

//- map.js ~~
//                                                      ~~ (c) SRW, 02 Mar 2012

function (doc) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */
    /*global emit: false */

 // Prerequisites

 // Declarations

 // Definitions

 // Invocations

    if (doc.hasOwnProperty('status') && doc.hasOwnProperty('token')) {
        emit([doc.token, doc.status], doc._rev);
    }

 // That's all, folks!

    return;

}

//- vim:set syntax=javascript:
