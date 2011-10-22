//- JavaScript source code

//- waiting.js ~~
//                                                      ~~ (c) SRW, 21 Oct 2011

function (doc, req) {
    'use strict';

    var v, y;

    if (doc.hasOwnProperty('val')) {

        v = doc.val;

        y = v.hasOwnProperty('f')       &&
            v.hasOwnProperty('x')       &&
            v.hasOwnProperty('y')       &&
            v.hasOwnProperty('status')  &&
            v.hasOwnProperty('token');

        if (req.hasOwnProperty('query')) {
            if (req.query.hasOwnProperty('token')) {
                if (y && (req.query.token === v.token)) {
                    return true;
                }
            }
        }

    }

    return false;

}

//- vim:set syntax=javascript:
