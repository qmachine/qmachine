//- JavaScript source code

//- main.js ~~
//
//  Currently, this program's main purpose is to load "q.js", but future work
//  will extend it to create a more immersive experience both for volunteers
//  and for computational scientists. The recommended way to embed QMachine's
//  web service into your own web apps is to insert the following script tag
//  into the body of your HTML page:
//
//      <script src="http://qmachine.org/q.js"></script>
//
//  NOTE: For maximum performance in your own app, embed "q-min.js", which is
//  a minified, optimized version of "q.js". Typically, I use either Google's
//  Closure compiler or else the YUI Compressor to produce this version. I
//  make it available out of the goodness of my heart (what little there is),
//  but I will not respond to bug reports that cannot be reproduced in "q.js"
//  because I am not an active developer for either of the optimizers.
//
//                                                      ~~ (c) SRW, 23 May 2012
//                                                  ~~ last updated 10 Aug 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, browser: true */

    /*properties
        Q, appendChild, body, call, checked, console, createElement, error,
        exit, getElementById, global, hasOwnProperty, head, key, log, onclick,
        onerror, onready, prototype, setAttribute, setTimeout, volunteer
    */

 // Prerequisites

 // Declarations

    var q, volunteer;

 // Definitions

    q = document.createElement('script');

    q.setAttribute('type', 'text/javascript');
    q.setAttribute('src', 'http://qmachine.org/q.js');

    volunteer = function () {
     // This function needs documentation.
        if (Object.prototype.hasOwnProperty('Q') === false) {
         // If Q hasn't loaded yet for some reason, try again later.
            setTimeout(volunteer, 1000);
            return;
        }
        if (document.getElementById('volunteer').checked === false) {
            return;
        }
        var task = Object.prototype.Q.volunteer();
        task.onerror = function (message) {
         // This function needs documentation.
            if ((global.hasOwnProperty('console')) &&
                    (message !== 'Nothing to do ...')) {
                global.console.error('Error:', message);
            }
            global.setTimeout(volunteer, 1000);
            return;
        };
        task.onready = function (evt) {
         // This function needs documentation.
            if (global.hasOwnProperty('console')) {
                global.console.log('Done:', this.key);
            }
            setTimeout(volunteer, 1000);
            return evt.exit();
        };
        return task;
    };

 // Invocations

    if ((document.body === null) || (document.body === undefined)) {
        document.head.appendChild(q);
    } else {
        document.body.appendChild(q);
    }

    document.getElementById('volunteer').onclick = volunteer;

 // Clean up after ourselves.

    q = null;

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
