//- JavaScript source code

//- couch-log-ddoc.js ~~
//                                                      ~~ (c) SRW, 31 Mar 2013
//                                                  ~~ last updated 10 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*global exports: false, sum: false */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint couch: true, indent: 4, maxlen: 80, nomen: true */

    /*properties
        box_frequency, hasOwnProperty, _id, ip, ip_frequency, ips, lists, map,
        reduce, replace, shows, split, updates, url, views
    */

 // Out-of-scope definitions

    exports._id = '_design/app';

    exports.lists = {};

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
