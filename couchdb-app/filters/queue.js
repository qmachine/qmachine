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

}

//- vim:set syntax=javascript:
