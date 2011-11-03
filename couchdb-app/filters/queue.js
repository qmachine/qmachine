//- JavaScript source code

//- queue.js ~~
//
//  This file contains a generalized solution to querying JSON documents'
//  properties according to known values. Additionally, using the "_changes"
//  API leaves an easy way room to add authentication on a per-request basis,
//  if ever such measures should be needed for access control :-)
//
//                                                      ~~ (c) SRW, 31 Oct 2011

function (doc, req) {
    'use strict';

    var flag, key, q, v;

    if (doc.hasOwnProperty('val')) {
        v = ((doc.val !== null) && (doc.val !== undefined)) ? doc.val : {};
        flag = ((v.hasOwnProperty('f')) && (v.hasOwnProperty('x')) &&
                (v.hasOwnProperty('y')) && (v.hasOwnProperty('status')));
        if (flag !== true) {
            return false;
        }
    } else {
        return false;
    }

    q = (req.hasOwnProperty('query')) ? req.query : {};

    for (key in q) {
        if (q.hasOwnProperty(key) && v.hasOwnProperty(key)) {
         // NOTE: This ignores keys that don't exist on the document so
         // that CouchDB's special filter keywords won't interfere. Then,
         // you can still specify "limit=10" or "since=100", for example,
         // to subset results without blacklisting keywords explicitly :-)
            if (q[key] !== v[key]) {
                return false;
            }
        }
    }

    return true;
}

//- vim:set syntax=javascript:
