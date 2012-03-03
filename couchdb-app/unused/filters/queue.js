//- JavaScript source code

//- queue.js ~~
//
//  This file contains a generalized solution for querying a CouchDB database
//  for documents whose properties match known values. By writing this as a
//  filter function that targets the "_changes" API, I have constructed a
//  solution which filters on a per-request basis; this is more expensive for
//  the server computationally, but it preserves our ability to add in access
//  control mechanisms later if we should ever decide that we need them :-)
//
//                                                      ~~ (c) SRW, 24 Jan 2012

function (doc, req) {
    'use strict';

    var q = (req.hasOwnProperty('query')) ? req.query : {};

    return ((doc.hasOwnProperty('status'))      &&
            (doc.hasOwnProperty('token'))       &&
            (q.hasOwnProperty('token'))         &&
            (q.token === doc.token)             &&
            (q.hasOwnProperty('status') ? (q.status === doc.status) : true));

}

//- vim:set syntax=javascript:
