//- JavaScript source code

//- main.js ~~
//
//  Currently, this program's only purpose is to load "q.js", but future work
//  will extend it to create a more immersive experience both for volunteers
//  and for computational scientists. The recommended way to embed Q Machine
//  into your own webapps is to insert the following script tag into the body
//  of your HTML page:
//
//      <script src="http://qmachine.org/q.js"></script>
//
//  NOTE: Inserting a script tag that points to "main.js" is "deprecated" --
//  it works correctly for now, but load times are slower than loading "q.js"
//  directly. Moreover, future versions of "main.js" will assume they are
//  running as part of the presentation layer for Q Machine's website, rather
//  than as part of the infrastructure providing Q Machine's web service.
//
//                                                      ~~ (c) SRW, 08 May 2012

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
