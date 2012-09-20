//- JavaScript source code

//- db.js ~~
//                                                      ~~ (c) SRW, 20 Sep 2012

(function () {
    'use strict';

 // Pragmas

    /*global exports: false */

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        'Content-Type', '_id', 'as-array', body, box, data, hasOwnProperty,
        headers, id, jobs, key, lists, map, parse, shows, status, stringify,
        timestamp, updates, uuid, value, views
    */

 // Out-of-scope definitions

    exports.lists = {
        'as-array': function () {
         // This function needs documentation.
            /*global getRow: false, send: false */
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
            if (doc === null) {
             // If a document with the requested docid doesn't exist, return a
             // plain old JSON object to avoid giving [evil] robots any useful
             // information via 404s.
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: '{}'
                };
            }
            var key, y;
            y = {};
            for (key in doc) {
                if ((doc.hasOwnProperty(key)) && (key[0] !== '_')) {
                    y[key] = doc[key];
                }
            }
            return {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(y)
            };
        }
    };

    exports.updates = {
        timestamp: function (doc, req) {
         //
         // NOTE: Do not out-clever yourself here! You _can_ add the CORS
         // headers in this function, but if you're already doing it inside an
         // external webserver like Nginx or Node.js, it will cause CORS _not_
         // to work.
         //
         // NOTE: The following works even though the keys don't match, but it
         // seems undesirable and should probably be fixed:
         //
         //     POST /box/foo?key=bar {"box":"foo","key":"baz","val":"quux"}
         //
            /*jslint nomen: true */
            var key, newDoc, response;
            newDoc = JSON.parse(req.body);
            if (doc === null) {
                if ((newDoc.hasOwnProperty('box')) &&
                        (newDoc.hasOwnProperty('key'))) {
                    newDoc._id = newDoc.box + '&' + newDoc.key;
                } else if (req.hasOwnProperty('id')) {
                    newDoc._id = req.id;
                } else {
                    newDoc._id = req.uuid;
                }
                return [newDoc, {
                    headers: {
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
            response = {
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: doc._id
            };
            return [doc, response];
        }
    };

    exports.views = {
        jobs: {
            map: function (doc) {
             // This function needs documentation.
                /*global emit: false */
                var flag;
                flag = ((doc.hasOwnProperty('box'))     &&
                        (doc.hasOwnProperty('key'))     &&
                        (doc.hasOwnProperty('status'))  &&
                        (doc.hasOwnProperty('val')));
                if (flag === true) {
                    emit([doc.box, doc.status], doc.key);
                }
                return;
            }
        }
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
