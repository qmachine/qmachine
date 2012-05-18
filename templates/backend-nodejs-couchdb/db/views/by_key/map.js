//- JavaScript source code

//- map.js ~~
//                                                      ~~ (c) SRW, 14 Apr 2012

function (doc) {
    'use strict';

    var data, flag, meta;

    data = {};

    flag = ((doc.hasOwnProperty('box')) &&
            (doc.hasOwnProperty('key')) &&
            (doc.hasOwnProperty('val')));

    if (flag === false) {
        return;
    }

    meta = {
        '_id':  doc._id,
        '_rev': doc._rev
    };

    if (doc.hasOwnProperty('_attachments')) {
        meta.attachments = doc._attachments;
    }

    if (doc.hasOwnProperty('_conflicts')) {
        meta.conflicts = doc._conflicts;
    }

    if (doc.hasOwnProperty('_deleted')) {
        meta.deleted = doc._deleted;
    }

    if (doc.hasOwnProperty('_deleted_conflicts')) {
        meta.deleted_conflicts = doc._deleted_conflicts;
    }

    if (doc.hasOwnProperty('_revisions')) {
        meta.revisions = doc._revisions;
    }

    if (doc.hasOwnProperty('_revs_info')) {
        meta.revs_info = doc._revs_info;
    }

    for (key in doc) {
        if (doc.hasOwnProperty(key) && (meta.hasOwnProperty(key) === false)) {
            data[key] = doc[key];
        }
    }

    emit([doc.box, doc.key, true],  meta);
    emit([doc.box, doc.key, false], data);

    return;

}

//- vim:set syntax=javascript:
