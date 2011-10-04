//- JavaScript source code

//- waiting.js ~~
//
//  This program defines a CouchDB filter function that outputs to
//      .../db/_changes?filter=quanah/waiting .
//
//                                                      ~~ (c) SRW, 03 Oct 2011

function (doc, req) {
    'use strict';
    if (doc.hasOwnProperty('val') && doc.val.hasOwnProperty('status')) {
        return (doc.val.status === 'waiting');
    } else {
        return false;
    }
}

//- vim:set syntax=javascript:
