//- JavaScript source code

//- timestamp.js ~~
//
//  NOTE: Do I need to omit an "X-Couch-Update-NewRev" header using Nginx?
//      --> http://wiki.apache.org/couchdb/Document_Update_Handlers ...
//
//                                                      ~~ (c) SRW, 16 May 2012

function (doc, req) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

 // Declarations

    var key, newDoc, response;

 // Definitions

    newDoc = JSON.parse(req.body);

    if (doc === null) {
        if (newDoc.hasOwnProperty('box') && newDoc.hasOwnProperty('key')) {
            newDoc._id = newDoc.box + '&' + newDoc.key;
        } else if (req.hasOwnProperty('id')) {
            newDoc._id = req.id;
        } else {
            newDoc._id = req.uuid;
        }
        return [newDoc, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/plain'
            },
            body: newDoc._id
        }];
    }

    for (key in newDoc) {
        if (newDoc.hasOwnProperty(key)) {
            doc[key] = newDoc[key];
        }
    }

    //doc.last_updated = (new Date()).valueOf();

    response = {
        headers: {
            'Content-Type': 'text/plain'
        },
        body: doc._id
    };

 // That's all, folks!

    return [doc, response];

}

//- vim:set syntax=javascript:
