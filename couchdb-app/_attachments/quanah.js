//- JavaScript source code

//- quanah.js ~~
//                                                      ~~ (c) SRW, 19 Oct 2011

chassis(function (q, global) {
    'use strict';

 // Prerequisites

    q.lib('fs');

    if (typeof Object.prototype.Q === 'function') {
     // Avoid unnecessary work if Method Q already exists.
        return;
    }

 // Declarations

    var sync, x;

 // Definitions

    sync = q.fs$sync;

 // Invocations

    x = sync({key: 'lala'});

    x.onready = function (val, exit) {
        console.log(val);
        exit.success(val);
    };

});

//- vim:set syntax=javascript:
