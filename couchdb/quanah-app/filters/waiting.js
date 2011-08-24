//- JavaScript source code

//- waiting.js ~~
//
//  This program defines a CouchDB filter function that isolates programs that
//  have not run yet by checking for the existence of a "code" property and a
//  "state" property that indicates it is waiting to be processed. I don't know
//  if I will stick with this exact idea in Quanah 2, but I have upgraded it
//  for robustness anyway. Its results are accessible at
//      .../db/_changes?filter=quanah/waiting .
//
//                                                      ~~ (c) SRW, 22 Aug 2011

function (doc, req) {
    "use strict";
    if (doc.hasOwnProperty("code") && doc.hasOwnProperty("state")) {
        if (doc.state === "waiting") {
            return true;
        }
    }
    return false;
}

//- vim:set syntax=javascript:
