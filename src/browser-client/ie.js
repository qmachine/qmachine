//- JavaScript source code

//- ie.js ~~
//
//  This code "encourages" users of Internet Explorer (IE) to install Google's
//  Chrome Frame. I'm not sure if this code is necessary now that I'm using the
//  "HTML5 Shiv" that Twitter Bootstrap requires, but this code is definitely
//  not being used right now ...
//
//  NOTE: I've never spent much time trying to support IE, and now I remember
//  _why_. The <script> tags don't even support the `onload` attribute! Argh.
//
//                                                      ~~ (c) SRW, 23 May 2012
//                                                  ~~ last updated 19 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint browser: true, indent: 4, maxlen: 80 */

    /*properties appendChild, body, check, createElement, mode, setAttribute */

 // Prerequisites

 // Declarations

    var script, timer;

 // Definitions

    script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');

    script.setAttribute('src',
        '//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js');

    timer = setInterval(function () {
     // This function needs work. My current strategy follows:
     //
     // 1.  Load Chrome Frame installer script.
     // 2.  If Chrome Frame is not already installed,
     //         launch a custom overlay that explains why IE sucks and why
     //         you should install Chrome Frame instead ...
        /*global CFInstall: false */
        if (CFInstall instanceof Object) {
            clearInterval(timer);
            CFInstall.check({mode: 'overlay'});
        }
        return;
    }, 1000);

 // Invocations

    document.body.appendChild(script);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
