//- JavaScript source code

//- main.js ~~
//
//  Currently, this program's only purpose is to load "q.js", but future work
//  will extend it to create a more immersive experience both for volunteers
//  and for computational scientists. The recommended way to embed QMachine
//  into your own webapps is to insert the following script tag into the body
//  of your HTML page:
//
//      <script src="http://qmachine.org/q.js"></script>
//
//  NOTE: Inserting a script tag that points to "main.js" is "deprecated" --
//  it works correctly for now, but load times are slower than loading "q.js"
//  directly. Moreover, future versions of "main.js" will assume they are
//  running as part of the presentation layer for QMachine's website, rather
//  than as part of the infrastructure providing QMachine's web service.
//
//  NOTE: For maximum performance in your own app, embed "q-min.js", which is
//  a minified, optimized version of "q.js". Typically, I use either Google's
//  Closure compiler or else the YUI Compressor to produce this version. I
//  make it available out of the goodness of my heart (what little there is),
//  but I will not respond to bug reports that cannot be reproduced in "q.js"
//  because I am not an active developer for either of the optimizers.
//
//                                                      ~~ (c) SRW, 23 May 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, browser: true */

 // Prerequisites

 // Declarations

    var q;

 // Definitions

    q = document.createElement('script');

    q.setAttribute('type', 'text/javascript');
    q.setAttribute('src', 'http://qmachine.org/q.js');

 // Invocations

    if ((document.body === null) || (document.body === undefined)) {
        document.head.appendChild(q);
    } else {
        document.body.appendChild(q);
    }

 // Clean up after ourselves.

    q = null;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
