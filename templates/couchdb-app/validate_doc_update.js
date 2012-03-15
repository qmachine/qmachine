//- JavaScript source code

//- validate_doc_update.js ~~
//                                                      ~~ (c) SRW, 06 Feb 2012

function (newDoc, oldDoc, userCtx) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, nomen: true */

 // This rule rejects updates for any document whose ID isn't a hexadecimal
 // UUID of length 32.

    if ((/^[0-9a-f]{32}$/).test(newDoc._id) === false) {
        throw {
            forbidden: 'Invalid document id (' + newDoc._id + ').'
        };
    }

 // It would also be nice to capture a timestamp, but because that involves an
 // 'update' function, we'll save that for another day.

 // That's all, folks!

    return;

}

//- vim:set syntax=javascript:
