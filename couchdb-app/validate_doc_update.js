//- JavaScript source code

//- validate_doc_update.js ~~
//
//  I have removed JSLINT to slim things down a bit :-)
//
//                                                      ~~ (c) SRW, 23 Sep 2011

function (newDoc, savedDoc, userCtx) {
    "use strict";

    var content;

    switch (newDoc.type) {

    case "QuanahFxn":

        if ((savedDoc !== null) && savedDoc.hasOwnProperty("content")) {
            if (newDoc.content !== savedDoc.content) {
                throw {
                    forbidden: "Shared code is immutable."
                };
            }
        } else {
            content = newDoc.content;
            if (content.length === 0) {
                throw {
                    forbidden: "Submitted code has length zero."
                };
            }
        }

    default:

     // (placeholder)

    }

}

//- vim:set syntax=javascript:
