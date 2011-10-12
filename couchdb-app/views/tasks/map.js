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
    var v, y;
    if (doc.hasOwnProperty('val') === true) {
        v = doc.val;
        y = v.hasOwnProperty('f') && v.hasOwnProperty('x') &&
            v.hasOwnProperty('y') && v.hasOwnProperty('status');
        if (y === true) {
            if (v.hasOwnProperty('token')) {
             // Here is preliminary token support, per Jonas's request.
                emit([v.status, v.token], {f: v.f, x: v.x, y: v.y});
            } else {
                emit(v.status, {f: v.f, x: v.x, y: v.y});
            }
        }
    }
};

//- vim:set syntax=javascript:
