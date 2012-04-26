//- JavaScript source code

//- as-array.js ~~
//                                                      ~~ (c) SRW, 17 Apr 2012

function (head, req) {
    'use strict';

    var first, row;

    first = true;

    send('[');

    while ((row = getRow()) !== null) {
        if (first === true) {
            first = false;
            send(JSON.stringify(row.value));
        } else {
            send(',' + JSON.stringify(row.value));
        }
    }

    send(']');

    return;

}

//- vim:set syntax=javascript:
