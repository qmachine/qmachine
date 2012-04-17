//- JavaScript source code

//- box.js ~~
//
//  The idea here is to return the very first 'row' CouchDB finds ...
//
//                                                      ~~ (c) SRW, 14 Apr 2012

function (head, req) {
    'use strict';

    var latest, previous, row;

    while (row = getRow()) {
        if (row !== null) {
            previous = row;
            if (row.value.hasOwnProperty('last_updated')) {
                if (latest === undefined) {
                    latest = row;
                }
                if (row.value.last_updated > latest.value.last_updated) {
                    latest = row;
                }
            }
        }
    }

    if (latest !== undefined) {
        delete latest.value.last_updated;
        return JSON.stringify(latest.value);
    }

    if (previous !== undefined) {
        return JSON.stringify([previous.value]);
    }

    return (req.query.key.length === 3) ? '{}' : '[]';

}

//- vim:set syntax=javascript:
