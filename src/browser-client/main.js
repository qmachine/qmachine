//- JavaScript source code

//- main.js ~~
//
//  This program's main purpose is to provide interaction for the graphical
//  user interface (GUI) component of the browser client -- the webpage. It is
//  not intended to be an integrated development environment (IDE), however!
//  The most important part of QMachine's browser client is the "q.js" script,
//  which is loaded dynamically after the webpage has loaded. Ultimately, this
//  script will be concatenated and/or minified with jQuery and Bootstrap to
//  produce "homepage.js", which is loaded by the webpage using a script tag:
//
//      <script async defer src="./homepage.js"></script>
//
//  I will describe the rationale behind these design decisions here soon :-)
//
//  KNOWN ISSUES:
//      https://bugzilla.mozilla.org/show_bug.cgi?id=756028
//
//                                                      ~~ (c) SRW, 23 May 2012
//                                                  ~~ last updated 19 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*global jQuery: false */

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint browser: true, indent: 4, maxlen: 80 */

    /*properties Q, QM, activeElement, alert, ajax, avar, blur, box, cache,
        call, clearTimeout, console, dataType, document, error, exit, focus,
        getItem, hasOwnProperty, id, is, join, jQuery, key, localStorage, log,
        on, preventDefault, prototype, ready, revive, setItem, setTimeout,
        success, stay, url, val, value, vol_timer, volunteer, which
    */

 // Prerequisites

    if (window.hasOwnProperty('jQuery') === false) {
        throw new Error('jQuery is missing.');
    }

 // Declarations

    var $, detect, is_Function, jserr, jsout, state;

 // Definitions

    $ = window.jQuery;

    detect = function (feature_name) {
     // This function is a high-level feature detection abstraction that helps
     // make the rest of the program logic read like English.
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
     // expression in some of the old browsers.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    jserr = function () {
     // This function provides an output logging mechanism for error messages
     // that doesn't totally shatter in old browsers.
        if (detect('console.error')) {
            window.console.error(Array.prototype.join.call(arguments, ' '));
        }
        return;
    };

    jsout = function () {
     // This function provides an output logging mechanism that doesn't totally
     // shatter in old browsers.
        if (detect('console.log')) {
            window.console.log(Array.prototype.join.call(arguments, ' '));
        }
        return;
    };

    state = {};

 // Invocations

    $(window.document).ready(function () {
     // This function runs when jQuery decides that the webpage has loaded.
        $.ajax({
            url: 'q.js',
            cache: true,
            dataType: 'script',
            success: function () {
             // This function runs after "q.js" has loaded successfully.
                var QM = window.QM;
                if (detect('localStorage')) {
                 // Here, we load a user's previous settings if they are
                 // available.
                    if (window.localStorage.hasOwnProperty('QM_box')) {
                        QM.box = window.localStorage.getItem('QM_box');
                    }
                }
                $(window).on('blur focus', QM.revive);
                $('#QM-box-input').on('blur', function () {
                 // This function doesn't work well in web workers due to the
                 // `alert`, but they aren't a priority right now. The idea
                 // here is to try to assign the new value of the input box to
                 // `QM.box` and capture the error that will be thrown if the
                 // value is invalid. Then, we want to notify the user about
                 // the problem and let them try again.
                    try {
                        QM.box = this.value;
                    } catch (err) {
                        window.alert(err);
                        this.value = QM.box;
                        $(this).focus();
                    }
                    QM.revive();
                    return;
                }).on('keydown', function (evt) {
                 // This function runs while the text field is active, whenever
                 // a key is pressed down (but before the key comes back up).
                    if (evt.which === 13) {
                        evt.preventDefault();
                        $(this).blur();
                    }
                    QM.revive();
                    return;
                });
                QM.avar().Q(function (evt) {
                 // This function synchronizes the jQuery object that
                 // represents the input element directly with QM's `box`
                 // property using Quanah's own event loop. Thankfully, this
                 // function won't distribute to another machine because it
                 // closes over `detect`.
                    if (document.activeElement.id !== 'QM-box-input') {
                        $('#QM-box-input').val(QM.box);
                    }
                    if (detect('localStorage')) {
                     // We assume here that HTML5 localStorage has not been
                     // tampered with. Super-secure code isn't necessary here
                     // because the value of `QM.box` is already "publicly"
                     // available anyway.
                        window.localStorage.setItem('QM_box', QM.box);
                    }
                    return evt.stay('This task repeats indefinitely.');
                }).on('error', function (message) {
                 // This just forwards to the `jserr` function of "main.js".
                    jserr('Error:', message);
                    return;
                });
                $('#QM-volunteer-input').on('click', function volunteer() {
                 // This function runs every time the checkbox is clicked.
                    if ($('#QM-volunteer-input').is(':checked') === false) {
                     // Yes, you're right, it _does_ look inefficient to ask
                     // jQuery to do separate queries, but because `volunteer`
                     // calls itself recursively using `setTimeout`, using
                     // `$(this)` can do some pretty wacky stuff if you're not
                     // careful. I prefer this strategy it's simple :-)
                        window.clearTimeout(state.vol_timer);
                        return;
                    }
                    QM.volunteer(QM.box).on('error', function (message) {
                     // This function redirects "error" messages appropriately.
                        if (message === 'Nothing to do ...') {
                         // Back by popular demand ;-)
                            jsout(message);
                        } else {
                            jserr('Error:', message);
                        }
                        window.clearTimeout(state.vol_timer);
                        state.vol_timer = window.setTimeout(volunteer, 1000);
                        return;
                    }).Q(function (evt) {
                     // This function provides visual feedback for debugging
                     // as soon as the volunteer finishes executing a task.
                        jsout('Done:', this.key);
                        window.clearTimeout(state.vol_timer);
                        state.vol_timer = window.setTimeout(volunteer, 1000);
                        return evt.exit();
                    });
                    return;
                });
                return;
            }
        });
        return;
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
