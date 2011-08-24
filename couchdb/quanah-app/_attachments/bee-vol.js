//- JavaScript source code

//- bee-vol.js ~~
//
//  This is the Web Worker for Quanah's "remote" execution context :-)
//
//                                                      ~~ (c) SRW, 23 Aug 2011

importScripts(
    "bin/web-chassis.js",
    "lib/quanah.js"
);

chassis(function (q) {
    "use strict";

 // Prerequisites

    q.lib("quanah");

 // Invocations

    q.quanah$volunteer();

 // There's no step three ;-)

});

//- vim:set syntax=javascript:
