//- JavaScript source code

//- done.js ~~
//
//  This program defines a CouchDB filter function for selecting the programs
//  that have finished running. It can be accessed at
//      .../db/_changes?filter=quanah/done .
//
//                                                      ~~ (c) SRW, 23 Aug 2011

function (doc, req) {
    "use strict";
    if (doc.hasOwnProperty("code") && doc.hasOwnProperty("state")) {
        if (doc.state === "done") {
            return true;
        }
    }
    return false;
}

//- vim:set syntax=javascript:
