//- JavaScript source code

//- gft.js ~~
//
//  This is an OAuth 2.0 communications layer for QMachine that enables a user
//  to use his or her own Google Fusion Tables as persistent storage.
//
//                                                      ~~ (c) SRW, 21 Apr 2013
//                                                  ~~ last updated 24 Apr 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint browser: true, devel: true, indent: 4, maxlen: 80 */

    /*properties
        access_token, ajax, argv, async, audience, click, client_id, error,
        getScript, hash, hasOwnProperty, hide, join, jQuery, length, location,
        log, push, ready, redirect_uri, response_type, scope, slice, split,
        success, type, url
    */

 // Prerequisites

    if (window.hasOwnProperty('jQuery') === false) {
        throw new Error('jQuery is missing.');
    }

 // Declarations

    var $, form2json, json2form, state, verify;

 // Definitions

    $ = window.jQuery;

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

    state = {
        argv: {}
    };

    verify = function (client_id, callback) {
     // This function needs documentation.
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

    $(document).ready(function () {
     // This function needs documentation.

        var client_id;

        client_id = '780123144915-9edrbl92r7c7of47f4umg7kkjbba3tu0.' +
            'apps.googleusercontent.com';

        console.log('Welcome to GFT Sandbox :-)');

        state.argv = form2json(location.hash.slice(1));

        if (state.argv.hasOwnProperty('access_token')) {
            verify(client_id, function (err) {
             // This function needs documentation.
                if (err !== null) {
                    throw err;
                }
                return;
            });
            return;
        }

        return;
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
