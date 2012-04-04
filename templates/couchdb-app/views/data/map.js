//- JavaScript source code

//- map.js ~~
//                                                      ~~ (c) SRW, 03 Apr 2012

function (doc) {
    'use strict';

    var flag;

    flag = ((doc.hasOwnProperty('key'))     &&
            (doc.hasOwnProperty('$avar'))   &&
            (doc.hasOwnProperty('token')));

    if (flag === true) {
        emit(doc.key, {token: doc.token, $avar: doc.$avar});
    }

    return;

}

//- vim:set syntax=javascript:
