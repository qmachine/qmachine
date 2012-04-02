//- JavaScript source code

//- ie.js ~~
//                                                      ~~ (c) SRW, 01 Apr 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, browser: true */

 // Prerequisites

 // Declarations

    var s;

 // Definitions

    s = document.body.createElement('script');

    s.src = '//ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.js';

    s.onload = function () {
     // This function needs work. My current strategy follows:
     //
     // 1.  Load Chrome Frame installer script.
     // 2.  If Chrome Frame is not already installed,
     //         launch a custom overlay that explains why IE sucks and why
     //         you should install Chrome Frame instead ...
     // 3.  Load 'main.js'.
     //
        /*global CFInstall: false */
        CFInstall.check({mode: 'overlay'});
        // ...
        return;
    };

    s.type = 'text/javascript';

 // Invocations

    document.body.appendChild(s);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
