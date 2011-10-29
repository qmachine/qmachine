//- JavaScript source code

//- queue.js ~~
//                                                      ~~ (c) SRW, 28 Oct 2011

function (doc, req) {
    'use strict';

    var isTask, matchesQuery;

    isTask = function (doc) {
        return ((doc.hasOwnProperty('val'))         &&
                (doc.val !== null)                  &&
                (doc.val !== undefined)             &&
                (doc.val.hasOwnProperty('f'))       &&
                (doc.val.hasOwnProperty('x'))       &&
                (doc.val.hasOwnProperty('y'))       &&
                (doc.val.hasOwnProperty('status'))) ;
    };

    matchesQuery = function (doc, req) {
        var key, q, v;
        q = (req.hasOwnProperty('query')) ? req.query : {};
        v = doc.val;
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
    };

    return isTask(doc) && matchesQuery(doc, req);

}

//- vim:set syntax=javascript:
