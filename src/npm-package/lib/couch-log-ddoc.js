//- JavaScript source code

//- couch-log-ddoc.js ~~
//                                                      ~~ (c) SRW, 31 Mar 2013
//                                                  ~~ last updated 09 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*global exports: false */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint couch: true, indent: 4, maxlen: 80, nomen: true */

    /*properties
        hasOwnProperty, _id, ip, ips, length, lists, map, reduce, shows, split,
        updates, url, views
    */

 // Out-of-scope definitions

    exports._id = '_design/app';

    exports.lists = {};

    exports.shows = {};

    exports.updates = {};

    exports.views = {
        ips: {
            map: function (doc) {
             // This function needs documentation.
                var box, flag, key, status;
                flag = ((doc.hasOwnProperty('ip'))  &&
                        (doc.hasOwnProperty('url')));
                if (flag === true) {
                    emit(doc.ip.split(', ')[0], doc.url);
                }
                return;
            },
            reduce: function (keys, values) {
             // This function needs documentation.
                return values.length;
            }
        }
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
