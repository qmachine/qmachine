//- JavaScript source code

//- validate_doc_update.js ~~
//
//  This definition rejects all updates to all documents in the database. It
//  is particularly useful as part of a design document placed in a "staging"
//  database in the cloud to prevent mean people from running up my bill.
//
//                                                      ~~ (c) SRW, 17 May 2012

function (newDoc, oldDoc, userCtx) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // That's all? ;-)

    throw {forbidden: 'This is a read-only database.'};

}

//- vim:set syntax=javascript:
