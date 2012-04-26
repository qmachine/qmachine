//- JavaScript source code

//- box.js ~~
//                                                      ~~ (c) SRW, 17 Apr 2012

function (head, req) {
    'use strict';

    var first, latest, previous, row;

    first = true;

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
        return JSON.stringify(previous.value);
    }

    return '{}';

}

//- vim:set syntax=javascript:
