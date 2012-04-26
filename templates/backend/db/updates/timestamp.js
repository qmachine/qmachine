//- JavaScript source code

//- timestamp.js ~~
//                                                      ~~ (c) SRW, 16 Apr 2012

function (doc, req) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

 // Declarations

    var newDoc, response;

 // Definitions

    newDoc = JSON.parse(req.body);

    newDoc._id = req.uuid;

    response = newDoc._id;

    newDoc.last_updated = (new Date()).valueOf();

 // That's all, folks!

    return [newDoc, response];

}

//- vim:set syntax=javascript:
