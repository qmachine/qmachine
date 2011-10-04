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
//                                                      ~~ (c) SRW, 04 Oct 2011

function (doc) {
    if (doc.hasOwnProperty('val') && doc.val.hasOwnProperty('status')) {
        emit(doc.val.status, {
            //date:     new Date,       //- this is mainly for debugging
            main:       doc.val.main,
            argv:       doc.val.argv,
            results:    doc.val.results,
            rev:        doc._rev
        });
    }
}

//- vim:set syntax=javascript:
