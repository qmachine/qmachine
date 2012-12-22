//- JavaScript source code

//- couch-design-doc.js ~~
//                                                      ~~ (c) SRW, 23 Oct 2012
//                                                  ~~ last updated 21 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*global exports: false, emit: false, getRow: false, send: false */

    /*jslint indent: 4, maxlen: 80, nomen: true */

    /*properties
        'Content-Type', _deleted, _id, _rev, 'as-array', body, box_status,
        data, exp_date, hasOwnProperty, headers, jobs, key, lists, map,
        outdated, parse, shows, split, stringify, updates, upsert, value, views
    */

 // Out-of-scope definitions

    exports._id = '_design/app';

    exports.lists = {
        'as-array': function () {
         // This function needs documentation.
            var first, row;
            first = true;
            send('[');
            while ((row = getRow()) !== null) {
                if (first === true) {
                    first = false;
                    send(JSON.stringify(row.value));
                } else {
                    send(',' + JSON.stringify(row.value));
                }
            }
            send(']');
            return;
        }
    };

    exports.shows = {
        data: function (doc) {
         // This function needs documentation.
            var response;
            response = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if ((doc === null) || (doc.hasOwnProperty('body') === false)) {
             // If a document with the requested docid doesn't exist, return a
             // plain old JSON object to avoid giving [evil] robots any useful
             // information via 404s.
                response.body = '{}';
            } else {
                response.body = doc.body;
            }
            return response;
        }
    };

    exports.updates = {
     // NOTE: Do not out-clever yourself here! You _can_ add the CORS
     // headers in this function, but if you're already doing it inside an
     // external webserver like Nginx or Node.js, it will cause CORS _not_
     // to work.
        upsert: function (doc, req) {
         // This function needs documentation.
            var key, newDoc, response;
            newDoc = JSON.parse(req.body);
            response = {
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Hooray!'
            };
            if (doc === null) {
             // We are inserting a new document.
                return [newDoc, response];
            }
         // We are updating the existing document.
            for (key in newDoc) {
                if (newDoc.hasOwnProperty(key)) {
                    doc[key] = newDoc[key];
                }
            }
            return [doc, response];
        }
    };

    exports.views = {
        jobs: {
            map: function (doc) {
             // This function needs documentation.
                var flag;
                flag = ((doc.hasOwnProperty('box_status'))  &&
                        (doc.hasOwnProperty('key')));
                if (flag === true) {
                    emit(doc.box_status.split('&'), doc.key);
                }
                return;
            }
        },
        outdated: {
            map: function (doc) {
             // This function outputs a JSON array that I can modify slightly
             // and POST back to Couch via the Bulk Documents API in order to
             // delete all documents that are past their expiration dates.
                if (doc.hasOwnProperty('exp_date')) {
                    emit(doc.exp_date, {
                        _id: doc._id,
                        _rev: doc._rev,
                        _deleted: true
                    });
                }
                return;
            }
        }
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
