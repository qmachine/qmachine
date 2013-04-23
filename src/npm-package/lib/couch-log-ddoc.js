//- JavaScript source code

//- couch-log-ddoc.js ~~
//                                                      ~~ (c) SRW, 31 Mar 2013
//                                                  ~~ last updated 23 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*global exports: false, getRow: false, send: false, sum: false */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint couch: true, indent: 4, maxlen: 80, nomen: true */

    /*properties
        'as-array', box_frequency, hasOwnProperty, _id, identity, ip,
        ip_frequency, ips, lists, map, method, reduce, replace, shows, slice,
        split, stringify, timestamp, updates, url, value, views
    */

 // Out-of-scope definitions

    exports._id = '_design/app';

    exports.lists = {
        'as-array': function () {
         // This function can be useful for dumping the entire contents of the
         // database for export into another database:
         //
         //     $ curl -o couch-dump.json \
         //         localhost:5984/traffic/_design/app/_list/as-array/identity
         //
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

    exports.shows = {};

    exports.updates = {};

    exports.views = {

        box_frequency: {
            map: function (doc) {
             // This function needs documentation.
                var pattern;
                if (doc.hasOwnProperty('url')) {
                    pattern = /^\/box\/([\w\-]+)\?/;
                    doc.url.replace(pattern, function (match, box) {
                     // This function needs documentation.
                        emit(box, 1);
                        return;
                    });
                    return;
                }
                return;
            },
            reduce: function (keys, values) {
             // This function needs documentation.
                return sum(values);
            }
        },

        identity: {
            map: function (doc) {
             // This function needs documentation.
                if (doc._id.slice(0, 8) !== '_design/') {
                    emit(null, {
                        ip:         doc.ip,
                        method:     doc.method,
                        timestamp:  doc.timestamp,
                        url:        doc.url
                    });
                }
                return;
            }
        },

        ip_frequency: {
            map: function (doc) {
             // This function needs documentation.
                if (doc.hasOwnProperty('ip')) {
                    emit(doc.ip.split(', ')[0], 1);
                }
                return;
            },
            reduce: function (keys, values) {
             // This function needs documentation.
                return sum(values);
            }
        }

    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
