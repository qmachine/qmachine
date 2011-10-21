//- JavaScript source code

//- fs.js ~~
//
//  This Web Chassis module provide a filesystem abstraction for Rainman that
//  utilizes AJAX for transfer, JSON for serialization, and CouchDB for remote
//  storage.
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

        var deserialize, doc, read, serialize;

     // Definitions

        deserialize = function (obj) {
            return JSON.parse(obj);     //- PLACEHOLDER
        };

        doc = function (id) {
            return 'http://' + global.location.host + '/db/' + id;
        };

        read = function (url, callback) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                var error, response;
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        error = null;
                        response = deserialize(request.responseText);
                    } else {
                        error = new Error(request.status);
                        response = request.statusText;
                    }
                    callback(error, response);
                }
            };
            request.open('GET', url, true);
            request.send(null);
        };

        serialize = function (obj) {
            return JSON.stringify(obj); //- PLACEHOLDER
        };

     // Rainman initialization

        global.RAINMAN.init({

            read: function (key, exit) {
                read(doc(key), function (err, res) {
                    if (err === null) {
                        exit.success(res.val);
                    } else {
                        exit.failure(err.message);
                    }
                });
            },

            remove: function (key, exit) {
                read(doc(key), function (err, res) {
                    var req;
                    if (err === null) {
                        req = new XMLHttpRequest();
                        req.onreadystatechange = function () {
                            if (req.readyState === 4) {
                                if (req.status === 200) {
                                    exit.success(undefined);
                                } else {
                                    exit.failure(req.statusText);
                                }
                            }
                        };
                        req.open('DELETE', doc(key), true);
                        req.setRequestHeader('If-Match', res._rev);
                        req.send(null);
                    } else if (err.message === '404') {
                        exit.success(undefined);
                    } else {
                        exit.failure(res);
                    }
                });
            },

            write: function (key, val, exit) {
                read(doc(key), function (err, res) {
                    var obj, req;
                    if (err === null) {
                        obj = res;
                        obj.val = val;
                    } else if (err.message === '404') {
                        obj = {
                            '_id':  key,
                            'val':  val
                        };
                    } else {
                        exit.failure(res);
                        return;
                    }
                    req = new XMLHttpRequest();
                    req.onreadystatechange = function () {
                        if (req.readyState === 4) {
                            if (req.status === 201) {
                                exit.success(obj.val);
                            } else {
                                exit.failure(req.statusText);
                            }
                        }
                    };
                    req.open('PUT', doc(key), true);
                    req.send(serialize(obj));
                });
            }

        });

     // Web Chassis "exports"

        q.fs$read = function (id, callback) {
            read(doc(id), callback);
        };

        q.fs$sync = function (obj) {
            return global.RAINMAN(obj);
        };

    };

});

//- vim:set syntax=javascript:
