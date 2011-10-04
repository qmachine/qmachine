//- JavaScript source code

//- running.js ~~
//
//  This program defines a CouchDB filter function that outputs to
//      .../db/_changes?filter=quanah/running .
//
//                                                      ~~ (c) SRW, 09 Sep 2011

function (doc, req) {
    "use strict";
    return ((doc.type === "QuanahTask") && (doc.content.status === "running"));
}

//- vim:set syntax=javascript:
