//- JavaScript source code

//- ajax.js ~~
//
//  This module defines portable AJAX wrappers for use with Web Chassis. For
//  the moment, I am only concentrating on modern browsers, but I do plan to
//  add support for crusty old browsers in the future :-P
//
//  NOTE: These wrappers are written in terms of callbacks because I consider
//  these to be "low-level routines". Ultimately I hope to remove the need for
//  callback functions completely, but for now it will help me publish faster.
//
//                                                      ~~ (c) SRW, 22 Aug 2011

/*jslint indent: 4, maxlen: 80 */
/*global chassis: true */

chassis(function (q, global) {
    "use strict";

 // Prerequisites (n/a)

 // Module definition

    q.ajax = function () {

        if (q.detects("XMLHttpRequest") === false) {
            throw new Error("Your browser does not support XHR.");
        }

        q.ajax$get = function (url, callback) {
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                var err, txt;
                err = null;
                txt = null;
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        txt = req.responseText;
                    } else {
                        err = new Error('Could not GET from "' + url + '".');
                    }
                    callback(err, txt);
                }
             // In the meantime, it may be useful to trigger a "revive" ...
                q(function () {});
            };
            req.open("GET", url, true);
            req.send(null);
            return req;
        };

        q.ajax$getNOW = function (url) {
         // This wrapper uses the synchronous version of XHR, which means your
         // program will be using JAX, not AJAX, when you use this function.
         // In other words, this, like other blocking calls, is an enemy of
         // concurrency and should be used as infrequently as possible!
            var req;
            req = new XMLHttpRequest();
            req.open("GET", url, false);
            req.send();
            return req.responseText;
        };

        q.ajax$put = function (url, data, callback) {
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                var err, txt;
                err = null;
                txt = null;
                if (req.readyState === 4) {
                    if (req.status === 201) {
                        txt = req.responseText;
                    } else {
                        err = new Error('Could not PUT to "' + url + '".');
                    }
                    callback(err, txt);
                }
             // In the meantime, it may be useful to trigger a "revive" ...
                q(function () {});
            };
            req.open("PUT", url, true);
            req.setRequestHeader("Content-type", "application/json");
            req.send(data);
            return req;
        };

        q.ajax$putNOW = function (url, data) {
         // This wrapper uses the synchronous version of XHR, which means your
         // program will be using JAX, not AJAX, when you use this function.
         // In other words, this, like other blocking calls, is an enemy of
         // concurrency and should be used as infrequently as possible!
            var req;
            data = data || "";
            req = new XMLHttpRequest();
            req.open('PUT', url, false);
            req.setRequestHeader("Content-type", "application/json");
            req.send(data);
            return req.responseText;
        };

    };

});

//- vim:set syntax=javascript:
