//- JavaScript source code

//- meta.js ~~
//                                                      ~~ (c) SRW, 03 Apr 2012

function (head, req) {
    'use strict';

    if (req.query.hasOwnProperty('key') === false) {
        return '{}';
    }

    if (req.query.hasOwnProperty('token') === false) {
        return '{}';
    }

    var metadata, row;

    metadata = [];

    while (row = getRow()) {

        if ((req.query.key === row.key) &&
                (req.query.token === row.value.token)) {
            metadata.push(row.value.val);
        }

    }

    return (metadata.length === 0) ? '{}' : metadata.join('\n');

}

//- vim:set syntax=javascript:
