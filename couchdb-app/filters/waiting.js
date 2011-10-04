//- JavaScript source code

//- waiting.js ~~
//
//  This program defines a CouchDB filter function that outputs to
//      .../db/_changes?filter=quanah/waiting .
//
//                                                      ~~ (c) SRW, 03 Oct 2011

function (doc, req) {
    'use strict';
    return (doc.val.status === 'waiting');
}

//- vim:set syntax=javascript:
