//- JavaScript source code

//- main.js ~~
//
//  This program's main purpose is to provide an interactive environment for
//  using the QMachine web service, but it is by no means feature-complete.
//  It doesn't load "q.js" dynamically anymore -- that task has been replaced
//  by a script tag load in the HTML page:
//
//      <script src="QM_WWW_URL/homepage.js"></script>
//
//  KNOWN ISSUES:
//      https://bugzilla.mozilla.org/show_bug.cgi?id=756028
//
//                                                      ~~ (c) SRW, 23 May 2012
//                                                  ~~ last updated 10 Jan 2013

(function () {
    'use strict';

 // Pragmas

    /*jslint browser: true, indent: 4, maxlen: 80 */

    /*global jQuery: false */

    /*properties
        Q, QM, activeElement, alert, avar, blur, box, call, clearTimeout,
        click, console, document, error, exit, getItem, hasOwnProperty, id, is,
        jQuery, join, key, keydown, localStorage, log, on, preventDefault,
        prototype, ready, revive, setItem, setTimeout, stay, val, value,
        volunteer, volunteer_timer, which
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

    var $, QM, detect, is_Function, jserr, jsout, state;

 // Definitions

    $ = window.jQuery;

    QM = window.QM;

    detect = function (feature_name) {
     // This function needs documentation.
        switch (feature_name) {
        case 'console.error':
            return ((window.hasOwnProperty('console')) &&
                    (is_Function(window.console.error)));
        case 'console.log':
            return ((window.hasOwnProperty('console')) &&
                    (is_Function(window.console.log)));
        case 'localStorage':
         // HTML5 localStorage object
            return (window.localStorage instanceof Object);
        default:
         // (placeholder)
        }
        return false;
    };

    is_Function = function (f) {
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

    state = {};

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
        $('#QM-box-input').on('blur', function () {
         // This function doesn't work well in web workers due to the `alert`,
         // but they aren't a priority right now. The idea here is to try to
         // assign the new value of the input box to `QM.box` and capture the
         // error that will be thrown if the value is invalid. Then, we want to
         // notify the user about the problem and "let" them try again.
            try {
                QM.box = this.value;
            } catch (err) {
                window.alert(err);
                this.value = QM.box;
                $(this).focus();
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
        });
        QM.avar().Q(function (evt) {
         // This function synchronizes the jQuery object that represents the
         // input element directly with QM's `box` property using Quanah's own
         // event loop. Thankfully, this function won't distribute to another
         // machine because it closes over `detect` :-)
            if ($(document.activeElement)[0].id !== 'QM-box-input') {
                $('#QM-box-input').val(QM.box);
            }
            if (detect('localStorage')) {
             // We assume here that HTML5 localStorage has not been tampered
             // with. Super-secure code isn't necessary here because the value
             // of `QM.box` is already publicly available anyway.
                window.localStorage.setItem('QM_box', QM.box);
            }
            return evt.stay('This task repeats indefinitely.');
        }).on('error', function (message) {
            jserr('Error:', message);
            return;
        });
        $('#QM-volunteer-input').on('click', function volunteer() {
         // This function needs documentation.
            if ($('#QM-volunteer-input').is(':checked') === false) {
             // Yes, you're right, it _does_ look inefficient to ask jQuery to
             // do separate queries, but because `volunteer` calls itself
             // recursively using `setTimeout`, using `$(this)` can do some
             // pretty wacky stuff if you're not careful. I prefer the strategy
             // here because it's simple :-)
                window.clearTimeout(state.volunteer_timer);
                return;
            }
            QM.volunteer(QM.box).on('error', function (message) {
             // This function needs documentation.
                if (message === 'Nothing to do ...') {
                 // Back by popular demand ;-)
                    jsout(message);
                } else {
                    jserr('Error:', message);
                }
                window.clearTimeout(state.volunteer_timer);
                state.volunteer_timer = window.setTimeout(volunteer, 1000);
                return;
            }).Q(function (evt) {
             // This function needs documentation.
                jsout('Done:', this.key);
                window.clearTimeout(state.volunteer_timer);
                state.volunteer_timer = window.setTimeout(volunteer, 1000);
                return evt.exit();
            });
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
