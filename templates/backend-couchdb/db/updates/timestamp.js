//- JavaScript source code

//- timestamp.js ~~
//
//  NOTE: Do I need to omit an "X-Couch-Update-NewRev" header using Nginx?
//      --> http://wiki.apache.org/couchdb/Document_Update_Handlers ...
//
//  NOTE: Do not out-clever yourself here! You _can_ add the CORS headers in
//  this function, but if you're already doing it inside the Node.js proxy,
//  it will cause CORS _not_ to work.
//
//  NOTE: The following works even though the keys don't match, but it seems
//  undesirable and should probably be fixed:
//      POST /box/foo?key=bar {"box":"foo","key":"baz","val":"quux"}
//
//                                                      ~~ (c) SRW, 25 May 2012

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
//                'Access-Control-Allow-Origin': '*',
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
