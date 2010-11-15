//- JavaScript source code -- CouchDB filter --> /db/_changes/_filter/quanah

//- waiting.js ~~
//  This function isolates programs with a "status" member indicating that it
//  is waiting to be processed.
//                                                          ~~ SRW, 01 Oct 2010

function (doc, req) {
    if ((doc.code) && (doc.state === "waiting")) {
        return true;
    } else {
        return false;
    }
}

//- vim:set syntax=javascript:
