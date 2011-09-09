//- JavaScript source code

//- waiting.js ~~
//
//  This program defines a CouchDB filter function that outputs to
//      .../db/_changes?filter=quanah/waiting .
//
//                                                      ~~ (c) SRW, 09 Sep 2011

function (doc, req) {
    "use strict";
    return ((doc.type === "QuanahJob") && (doc.stage === "waiting"));
}

//- vim:set syntax=javascript:
