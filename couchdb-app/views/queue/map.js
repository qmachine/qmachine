//- JavaScript source code

//- map.js ~~
//                                                      ~~ (c) SRW, 13 Mar 2012

function (doc) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */
    /*global emit: false */

 // Prerequisites

 // Declarations

    var flag;

 // Definitions

    flag = ((doc.hasOwnProperty('key'))     &&
            (doc.hasOwnProperty('status'))  &&
            (doc.hasOwnProperty('token')));

 // Invocations

    if (flag === true) {
        emit([doc.token, doc.status], doc.key);
    }

 // That's all, folks!

    return;

}

//- vim:set syntax=javascript:
