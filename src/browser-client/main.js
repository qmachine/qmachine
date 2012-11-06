//- JavaScript source code

//- main.js ~~
//
//  This program's main purpose is to provide an interactive environment for
//  using the QMachine web service, but it is by no means feature-complete.
//  It doesn't load "q.js" dynamically anymore -- that task has been replaced
//  by a script tag load in the HTML page:
//
//      <script src="MOTHERSHIP/q.js"></script>
//
//  NOTE: For maximum performance in your own app, embed "q-min.js", which is
//  a minified, optimized version of "q.js". Typically, I use either Google's
//  Closure compiler or else the YUI Compressor to produce this version. I
//  make it available out of the goodness of my heart (what little there is),
//  but I will not respond to bug reports that cannot be reproduced in "q.js"
//  because I am not an active developer for either of the optimizers.
//
//  KNOWN ISSUES:
//      https://bugzilla.mozilla.org/show_bug.cgi?id=756028
//
//                                                      ~~ (c) SRW, 23 May 2012
//                                                  ~~ last updated 31 Oct 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint browser: true, indent: 4, maxlen: 80 */

    /*global jQuery: false */

    /*properties
        Q, QM, alert, blur, box, call, click, console, document, error, exit,
        getItem, hasOwnProperty, is, jQuery, join, key, keydown, localStorage,
        log, on, onerror, onready, preventDefault, prototype, ready, revive,
        setItem, setTimeout, stay, val, value, volunteer, which
    */

 // Prerequisites

    if (window.hasOwnProperty('jQuery') === false) {
        throw new Error('jQuery is missing.');
    }

    if (window.hasOwnProperty('QM') === false) {
        throw new Error('QMachine is missing.');
    }

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var $, QM, detect, isFunction, jserr, jsout, volunteer;

 // Definitions

    $ = window.jQuery;

    QM = window.QM;

    detect = function (feature_name) {
     // This function needs documentation.
        switch (feature_name) {
        case 'console.error':
            return ((window.hasOwnProperty('console')) &&
                    (isFunction(window.console.error)));
        case 'console.log':
            return ((window.hasOwnProperty('console')) &&
                    (isFunction(window.console.log)));
        case 'localStorage':
         // HTML5 localStorage object
            return (window.localStorage instanceof Object);
        default:
         // (placeholder)
        }
        return false;
    };

    isFunction = function (f) {
     // This function returns `true` only if and only if `f` is a function.
     // The second condition is necessary to return `false` for a regular
     // expression in some of the older browsers.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    jserr = function () {
     // This function needs documentation.
        if (detect('console.error')) {
            window.console.error(Array.prototype.join.call(arguments, ' '));
        }
        return;
    };

    jsout = function () {
     // This function needs documentation.
        if (detect('console.log')) {
            window.console.log(Array.prototype.join.call(arguments, ' '));
        }
        return;
    };

    volunteer = function () {
     // This function needs documentation.
        if ($('#QM-volunteer-input').is(':checked') === false) {
            return;
        }
        var task = QM.volunteer();
        task.onerror = function (message) {
         // This function needs documentation.
            if (message === 'Nothing to do ...') {
             // Back by popular demand ;-)
                jsout(message);
            } else {
                jserr('Error:', message);
            }
            window.setTimeout(volunteer, 1000);
            return;
        };
        task.onready = function (evt) {
         // This function needs documentation.
            jsout('Done:', this.key);
            window.setTimeout(volunteer, 1000);
            return evt.exit();
        };
        return;
    };

 // Invocations

    $(window.document).ready(function () {
     // This function needs documentation.
        if (detect('localStorage')) {
         // Here, we load a user's previous settings if they are available.
            if (window.localStorage.hasOwnProperty('QM_box')) {
                QM.box = window.localStorage.getItem('QM_box');
            }
        }
        $(window).on('blur focus', QM.revive);
        $('#QM-box-input').blur(function () {
         // This function needs documentation.
            try {
                QM.box = this.value;
            } catch (err) {
             // This part doesn't work well in web workers, but they're not a
             // huge priority right now ...
                window.alert(err);
            }
            QM.revive();
            return;
        }).keydown(function (evt) {
         // This function needs documentation.
            if (evt.which === 13) {
                evt.preventDefault();
                $(this).blur();
            }
            QM.revive();
            return;
        }).Q(function (evt) {
         // This function synchronizes the jQuery object that represents the
         // input element directly with QM's `box` property using Quanah's own
         // event loop. Thankfully, this function won't distribute to another
         // machine because it closes over `QM.box` :-)
            if (this.val.is(':focus') === false) {
                this.val.val(QM.box);
            }
            if (detect('localStorage')) {
             // We assume here that HTML5 localStorage has not been tampered
             // with. Super-secure code isn't necessary here because the value
             // of `QM.box` is already publicly available anyway.
                window.localStorage.setItem('QM_box', QM.box);
            }
            return evt.stay('This task repeats indefinitely.');
        });
        $('#QM-volunteer-input').click(function () {
         // There is a problem here -- if you click it on and off a couple of
         // times, you end up with several volunteer "instances" ...
            volunteer();
            return;
        });
        return;
    });

 // NOTE: This snippet successfully adds a <link> element to <head> so that
 // the splash screens work correctly for iOS. I'm still debating about the
 // advantages and disadvantages to doing it dynamically with JS vs. static
 // in the HTML itself. Either way, there's some good information about the
 // topic available online at
 //
 //     https://gist.github.com/472519
 //     https://gist.github.com/2222823
 //

 /*
    (function () {
        var link = document.createElement('link');
        link.href = 'apple-touch-startup-image-640x920.png';
        link.rel = 'apple-touch-startup-image';
        document.head.appendChild(link);
        link = null;
        return;
    }());
 */

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
