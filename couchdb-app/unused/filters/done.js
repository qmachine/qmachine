//- JavaScript source code

//- done.js ~~
//
//  This program defines a CouchDB filter function that outputs to
//      .../db/_changes?filter=quanah/done .
//
//                                                      ~~ (c) SRW, 09 Sep 2011

function (doc, req) {
    "use strict";
    return ((doc.type === "QuanahTask") && (doc.content.status === "done"));
}

//- vim:set syntax=javascript:
