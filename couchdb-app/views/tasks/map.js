//- JavaScript source code

//- map.js ~~
//
//  This defines a CouchDB view that will hopefully outperform that filter
//  functions I have been using up to this point. Using views takes advantage
//  of CouchDB's MapReduce design for efficiency on the server-side, but it's
//  also useful in our case because it lets me remove an enormous number of
//  AJAX calls. It also immediately provides a means by which I may tackle my
//  future plans for driving Quanah stochastically :-)
//
//  Example query:
//  -   http://quanah.couchone.com/_view/tasks?key="waiting"
//
//                                                      ~~ (c) SRW, 05 Oct 2011

function (doc) {
    'use strict';
    var x, y;
    if (doc.hasOwnProperty('val') === true) {
        x = doc.val;
        y = x.hasOwnProperty('main')    &&
            x.hasOwnProperty('argv')    &&
            x.hasOwnProperty('results') &&
            x.hasOwnProperty('status')  ;
        if (y === true) {
            emit(x.status, {
                main:       x.main,
                argv:       x.argv,
                results:    x.results
            });
        }
    }
};

//- vim:set syntax=javascript:
