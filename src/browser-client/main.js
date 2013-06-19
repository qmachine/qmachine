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
//                                                  ~~ last updated 19 Jun 2013

(function () {
    'use strict';

 // Pragmas

    /*global jQuery: false */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint browser: true, indent: 4, maxlen: 80 */

    /*properties
        Q, QM, activeElement, alert, ajax, argv, attr, audience, avar, blur,
        box, cache, call, clearTimeout, click, client_id, console, dataType,
        document, each, error, exit, focus, getItem, hash, hasOwnProperty,
        href, html, id, innerHTML, is, join, jQuery, key, length, localStorage,
        location, log, on, preventDefault, prototype, push, ready,
        redirect_uri, replace, response_type, revive, scope, setItem,
        setTimeout, slice, split, success, stay, type, url, val, value,
        vol_timer, volunteer, which
    */

 // Prerequisites

    if (window.hasOwnProperty('jQuery') === false) {
        throw new Error('jQuery is missing.');
    }

 // Declarations

    var $, client_id, detect, form2json, is_Function, jserr, json2form, jsout,
        state, verify;

 // Definitions

    $ = window.jQuery;

    client_id = '780123144915-i51f26fvkqe9v56rf7qf7' +
            'aeviol63qt5.apps.googleusercontent.com';

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

    form2json = function (x) {
     // This function needs documentation.
        var key, i, n, temp, val, y;
        temp = x.split('&');
        y = {};
        for (i = 0, n = temp.length; i < n; i += 1) {
            key = temp[i].split('=')[0];
            val = temp[i].split('=').slice(1).join('=');
            y[key] = val;
        }
        return y;
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

    json2form = function (obj) {
     // This function needs documentation.
        var key, y;
        y = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                y.push(key + '=' + obj[key]);
            }
        }
        return y.join('&');
    };

    jsout = function () {
     // This function provides an output logging mechanism that doesn't totally
     // shatter in old browsers.
        if (detect('console.log')) {
            window.console.log(Array.prototype.join.call(arguments, ' '));
        }
        return;
    };

    state = {
        argv: {}
    };

    verify = function (client_id, callback) {
     // This function needs documentation.
        /*jslint unparam: true */
        var verify_uri = 'https://www.googleapis.com/oauth2/v1/tokeninfo';
        $.ajax({
            error: function (code, message) {
             // This function needs documentation.
                callback(new Error(message));
                return;
            },
            success: function (data) {
             // This function needs documentation.
                var err = null;
                if (data.audience !== client_id) {
                    err = new Error('Do not try to confuse the deputy!');
                }
                callback(err);
                return;
            },
            type: 'GET',
            url: verify_uri + '?' + location.hash.slice(1)
        });
        return;
    };

 // Invocations

    $(window.document).ready(function () {
     // This function runs when jQuery decides that the webpage has loaded.
        /*jslint unparam: true */

        state.argv = form2json(location.hash.slice(1));

        if (state.argv.hasOwnProperty('access_token')) {

            $('#QM-login-button').html('');

            verify(client_id, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                $.ajax({
                    url: 'q.js',
                    cache: true,
                    dataType: 'script',
                    success: function () {
                     // This function runs after "q.js" has loaded
                     // successfully.
                        var QM = window.QM;
                        if (detect('localStorage')) {
                         // Here, we load a user's previous settings if they
                         // are available.
                            if (window.localStorage.hasOwnProperty('QM_box')) {
                                QM.box = window.localStorage.getItem('QM_box');
                            }
                        }
                        $(window).on('blur focus', QM.revive);
                        $('#QM-box-input').on('blur', function () {
                         // This function doesn't work well in web workers due
                         // to the `alert`, but they aren't a priority right
                         // now. The idea here is to try to assign the new
                         // value of the input box to `QM.box` and capture the
                         // error that will be thrown if the value is invalid.
                         // Then, we want to notify the user about the problem
                         // and let them try again.
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
                         // This function runs while the text field is active,
                         // whenever a key is pressed down (but before the key
                         // comes back up).
                            if (evt.which === 13) {
                                evt.preventDefault();
                                $(this).blur();
                            }
                            QM.revive();
                            return;
                        }).attr('disabled', false);
                        QM.avar().Q(function (evt) {
                         // This function synchronizes the jQuery object that
                         // represents the input element directly with QM's
                         // `box` property using Quanah's own event loop.
                         // Thankfully, this function won't distribute to
                         // another machine because it closes over `detect`.
                            if (document.activeElement.id !== 'QM-box-input') {
                                $('#QM-box-input').val(QM.box);
                            }
                            if (detect('localStorage')) {
                             // We assume here that HTML5 localStorage has not
                             // been tampered with. Super-secure code isn't
                             // necessary here because the value of `QM.box` is
                             // already "publicly" available anyway.
                                window.localStorage.setItem('QM_box', QM.box);
                            }
                            return evt.stay('This task repeats indefinitely.');
                        }).on('error', function (message) {
                         // This just forwards to the `jserr` function in 
                         // "main.js".
                            jserr('Error:', message);
                            return;
                        });
                        $('#QM-volunteer-input').click(function volunteer() {
                         // This function runs every time the checkbox is
                         // clicked.
                            var that = $('#QM-volunteer-input');
                            if (that.is(':checked') === false) {
                             // Yes, you're right, it _does_ look inefficient
                             // to ask jQuery to do separate queries, but
                             // because `volunteer` calls itself recursively
                             // using `setTimeout`, using `$(this)` can do some
                             // pretty wacky stuff if you're not careful. I
                             // prefer this strategy because it's simple :-)
                                window.clearTimeout(state.vol_timer);
                                return;
                            }
                            QM.volunteer(QM.box).on('error', function (msg) {
                             // This function redirects "error" messages.
                                if (msg === 'Nothing to do ...') {
                                 // Back by popular demand ;-)
                                    jsout(msg);
                                } else {
                                    jserr('Error:', msg);
                                }
                                window.clearTimeout(state.vol_timer);
                                state.vol_timer = window.setTimeout(volunteer,
                                        1000);
                                return;
                            }).Q(function (evt) {
                             // This function provides visual feedback for
                             // debugging as soon as the volunteer finishes
                             // executing a task.
                                jsout('Done:', this.key);
                                window.clearTimeout(state.vol_timer);
                                state.vol_timer = window.setTimeout(volunteer,
                                        1000);
                                return evt.exit();
                            });
                            return;
                        }).attr('disabled', false);
                        return;
                    }
                });
                return;
            });

            $('p').each(function (key, val) {
             // This function needs documentation.
                var text;
                text = val.innerHTML.replace('Log in, then ', '').trim();
                val.innerHTML = text[0].toUpperCase() + text.slice(1);
                return;
            });

        } else {

         // The user has not authenticated with Google yet.

            $('#QM-login-button').html('Login').attr('href', [
                'https://accounts.google.com/o/oauth2/auth?',
                json2form({
                    client_id: client_id,
                    redirect_uri: location.href,
                    scope: 'https://www.googleapis.com/auth/fusiontables',
                    response_type: 'token'
                })
            ].join(''));

            jsout('NOTE: The `QM` object is not available until you log in.');

        }

        return;

    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
