//- JavaScript source code

//- fs.js ~~
//
//  This Web Chassis module provide a filesystem abstraction for Rainman that
//  utilizes AJAX for transfer and CouchDB for remote storage.
//
//                                                      ~~ (c) SRW, 19 Oct 2011

chassis(function (q, global) {
    'use strict';

 // Module definition

    q.fs = function () {

     // Prerequisites

        if (global.hasOwnProperty('RAINMAN') === false) {
            q.load('rainman.js');
            q.die('Awaiting RAINMAN ...');
            return;
        }

     // Declarations

        var bookmarks;

     // Definitions

        bookmarks = { 
            doc: function (id) {
                return 'http://' + global.location.host + '/db/' + id;
            }
        };

     // Rainman initialization

        global.RAINMAN.init({

            read: function (key, exit) {
                var pull = new XMLHttpRequest();
                pull.onreadystatechange = function () {
                    var response;
                    if (pull.readyState === 4) {
                        response = JSON.parse(pull.responseText);
                        if (pull.status === 200) {
                            exit.success(response.val);
                        } else {
                            exit.failure(pull.statusText);
                        }
                    }
                };
                pull.open('GET', bookmarks.doc(key), true);
                pull.send(null);
            },

            remove: function (key, exit) {
                var pull = new XMLHttpRequest();
                pull.onreadystatechange = function () {
                    var push, response;
                    if (pull.readyState === 4) {
                        switch (pull.status) {
                        case 200:
                            response = JSON.parse(pull.responseText);
                            push = new XMLHttpRequest();
                            push.onreadystatechange = function () {
                                if (push.readyState === 4) {
                                    if (push.status === 200) {
                                        exit.success(undefined);
                                    } else {
                                        exit.failure(push.statusText);
                                    }
                                }
                            };
                            push.open('DELETE', bookmarks.doc(key), true);
                            push.setRequestHeader('If-Match', response._rev);
                            push.send(null);
                            break;
                        case 404:
                            exit.success(undefined);
                            break;
                        default:
                            exit.failure(pull.statusText);
                        }
                    }
                };
                pull.open('GET', bookmarks.doc(key), true);
                pull.send(null);
            },

            write: function (key, val, exit) {
                var pull = new XMLHttpRequest();
                pull.onreadystatechange = function () {
                    var push, response;
                    if (pull.readyState === 4) {
                        switch (pull.status) {
                        case 200:
                            response = JSON.parse(pull.responseText);
                            response.val = val;
                            break;
                        case 404:
                            response = {
                                '_id':  key,
                                'val':  val
                            };
                            break;
                        default:
                            exit.failure(pull.statusText);
                            return;
                        }
                        push = new XMLHttpRequest();
                        push.onreadystatechange = function () {
                            if (push.readyState === 4) {
                                if (push.status === 201) {
                                    exit.success(response.val);
                                } else {
                                    exit.failure(push.statusText);
                                }
                            }
                        };
                        push.open('PUT', bookmarks.doc(key), true);
                        push.send(JSON.stringify(response));
                    }
                };
                pull.open('GET', bookmarks.doc(key), true);
                pull.send(null);
            }

        });

     // Web Chassis "exports"

        q.fs$sync = function (obj) {
            return global.RAINMAN(obj);
        };

    };

});

//- vim:set syntax=javascript:
