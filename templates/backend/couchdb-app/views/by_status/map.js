//- JavaScript source code

//- map.js ~~
//                                                      ~~ (c) SRW, 03 Apr 2012

function (doc) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */
    /*global emit: false */

 // Prerequisites

 // Declarations

    var flag;

 // Definitions

    flag = ((doc.hasOwnProperty('box'))     &&
            (doc.hasOwnProperty('key'))     &&
            (doc.hasOwnProperty('status'))  &&
            (doc.hasOwnProperty('val')));

 // Invocations

    if (flag === true) {
        emit([doc.box, doc.status], doc.key);
    }

 // That's all, folks!

    return;

}

//- vim:set syntax=javascript:
