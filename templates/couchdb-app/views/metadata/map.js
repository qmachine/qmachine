//- JavaScript source code

//- map.js ~~
//                                                      ~~ (c) SRW, 03 Apr 2012

function (doc) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */
    /*global emit: false */

 // Prerequisites

    if (doc.hasOwnProperty('key') === false) {
        return;
    }

    if (doc.hasOwnProperty('token') === false) {
        return;
    }

 // Declarations

    var y;

 // Definitions

    y = {
        id: doc._id,
        rev: doc._rev
    };

 // Invocations

    if (doc.hasOwnProperty('_attachments')) {
        y.attachments = doc._attachments;
    }

    if (doc.hasOwnProperty('_conflicts')) {
        y.conflicts = doc._conflicts;
    }

    if (doc.hasOwnProperty('_deleted')) {
        y.deleted = doc._deleted;
    }

    if (doc.hasOwnProperty('_deleted_conflicts')) {
        y.deleted_conflicts = doc._deleted_conflicts;
    }

    if (doc.hasOwnProperty('_revisions')) {
        y.revisions = doc._revisions;
    }

    if (doc.hasOwnProperty('_revs_info')) {
        y.revs_info = doc._revs_info;
    }

    emit(doc.key, {token: doc.token, val: JSON.stringify(y)});

 // That's all, folks!

    return;

}

//- vim:set syntax=javascript:
