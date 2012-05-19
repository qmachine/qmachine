//- JavaScript source code

//- data.js ~~
//                                                      ~~ (c) SRW, 16 May 2012

function (doc, req) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (doc === null) {
     // If a document with the requested docid doesn't exist, return a plain
     // old JSON object to avoid giving robots "useful" information via 404s.
        return {
            headers: {
                'Content-Type': 'application/json'
            },
            body: '{}'
        };
    }

 // Declarations

    var key, y;

 // Definitions

    y = {};

 // Invocations

    for (key in doc) {
        if ((doc.hasOwnProperty(key)) && (key[0] !== '_')) {
            y[key] = doc[key];
        }
    }

 // That's all, folks!

    return {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(y)
    };

}

//- vim:set syntax=javascript:
