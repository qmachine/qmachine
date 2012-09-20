//- JavaScript source code

//- www.js ~~
//                                                      ~~ (c) SRW, 22 Aug 2012

(function () {
    'use strict';

 // Pragmas

    /*global exports: false */

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        forbidden, from, method, query, rewrites, to, validate_doc_update
    */

 // Out-of-scope definitions

    exports.rewrites = [
        {
            from:   '',
            to:     '/public_html/index.html',
            method: 'GET',
            query:  {}
        },
        {
            from:   '/',
            to:     '/public_html/index.html',
            method: 'GET',
            query:  {}
        },
        {
            from:   '*',
            to:     '/public_html/*',
            method: 'GET',
            query:  {}
        }
    ];

    exports.validate_doc_update = function () {
     // This function rejects all updates to all documents in the database.
        throw {forbidden: 'This is a read-only database.'};
    };

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
