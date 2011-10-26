//- JavaScript source code

//- queue.js ~~
//                                                      ~~ (c) SRW, 21 Oct 2011

function (doc, req) {
    'use strict';

    return ((doc.hasOwnProperty('val'))                         &&
            (doc.val !== null)                                  &&
            (doc.val !== undefined)                             &&
            (doc.val.hasOwnProperty('f'))                       &&
            (doc.val.hasOwnProperty('x'))                       &&
            (doc.val.hasOwnProperty('y'))                       &&
            (doc.val.hasOwnProperty('status'))                  &&
            (doc.val.hasOwnProperty('token'))                   &&
            (req.hasOwnProperty('query'))                       &&
            (req.query.hasOwnProperty('status') ?
                (doc.val.status === req.query.status) : true)   &&
            (req.query.hasOwnProperty('token') ?
                (doc.val.token === req.query.token) : true));

 // The next part is an attempt to construct a generalized query mechanism for
 // arbitrary terms -- it doesn't work yet ...
 //
 //                                                     ~~ (c) SRW, 26 Oct 2011

 /*
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
        var key, query;
        query = (req.hasOwnProperty('query')) ? req.query : {};
        for (key in query) {
            if (query.hasOwnProperty(key) && doc.hasOwnProperty(key)) {
                if (query[key] !== doc[key]) {
                    return false;
                }
            }
        }
        return true;
    };

    return isTask(doc) && matchesQuery(doc, req);
 */
}

//- vim:set syntax=javascript:
