//- JavaScript source code

//- ie.js ~~
//
//  Wow. I've never spent much time trying to support IE, and now I remember
//  _why_. The <script> tags don't even support the 'onload' attribute! Argh.
//
//                                                      ~~ (c) SRW, 23 May 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint browser: true, indent: 4, maxlen: 80 */

 // Prerequisites

 // Declarations

    var script, timer;

 // Definitions

    script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');

    script.setAttribute('src',
        'http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.js');

    timer = setInterval(function () {
     // This function needs work. My current strategy follows:
     //
     // 1.  Load Chrome Frame installer script.
     // 2.  If Chrome Frame is not already installed,
     //         launch a custom overlay that explains why IE sucks and why
     //         you should install Chrome Frame instead ...
     // 3.  Load 'main.js'.
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
