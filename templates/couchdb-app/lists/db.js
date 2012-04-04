//- JavaScript source code

//- db.js ~~
//                                                      ~~ (c) SRW, 03 Apr 2012

function (head, req) {
    'use strict';

    if (req.query.hasOwnProperty('key') === false) {
        return '{}';
    }

    if (req.query.hasOwnProperty('token') === false) {
        return '{}';
    }

    var data, row;

    data = [];

    while (row = getRow()) {

        if ((req.query.key === row.key) &&
                (req.query.token === row.value.token)) {
            data.push(row.value.$avar);
        }

    }

    return (data.length === 0) ? '{}' : data.join('\n');

}

//- vim:set syntax=javascript:
