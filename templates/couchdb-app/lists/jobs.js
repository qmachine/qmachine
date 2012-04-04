//- JavaScript source code

//- jobs.js ~~
//
//  http://127.0.0.1:5984/experimental/_design/qmachine/_rewrite/queue/sean
//
//                                                      ~~ (c) SRW, 03 Apr 2012

function (head, req) {
    'use strict';

    if (req.query.hasOwnProperty('token') === false) {
        return '[]';
    }

    var avar_keys, row;

    avar_keys = [];

    if (req.query.hasOwnProperty('status')) {

        while (row = getRow()) {

            if ((req.query.token === row.key) &&
                    (req.query.status === row.value.status)) {
                avar_keys.push(row.value.key);
            }

        }

    } else {

        while (row = getRow()) {

            if (req.query.token === row.key) {
                avar_keys.push(row.value.key);
            }

        }

    }

    return JSON.stringify(avar_keys);

}

//- vim:set syntax=javascript:
