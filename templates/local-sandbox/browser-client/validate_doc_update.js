//- JavaScript source code

//- validate_doc_update.js ~~
//
//  This definition rejects all updates to all documents in the database.
//
//                                                      ~~ (c) SRW, 24 Apr 2012

function (newDoc, oldDoc, userCtx) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, nomen: true */

 // That's all? ;-)

    throw {forbidden: 'This is a read-only database.'};

}

//- vim:set syntax=javascript:
