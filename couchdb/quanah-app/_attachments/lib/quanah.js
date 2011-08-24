//- JavaScript source code

//- quanah.js ~~
//
//  This file defines Quanah as a Web Chassis module. The AJAX wrappers are
//  located in a separate module, but the calls specific to CouchDB are still
//  encapsulated in this module directly for now.
//
//                                                      ~~ (c) SRW, 21 Aug 2011

/*jslint indent: 4, maxlen: 80 */
/*global chassis: true */

chassis(function (q, global) {
    "use strict";

 // Prerequisites

    q.load("lib/ajax.js");
    q.load("lib/base.js");

    q.lib("ajax");
    q.lib("base");

 // Module definition

    q.quanah = function () {

     // Constructors

        function CouchDoc(obj) {
         // I'll worry with generics in the wrapper, not the constructor!
            var key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    this[key] = obj[key];
                }
            }
            this.uuid = uuid();
            this.ready = true;
            return this;
        }

        CouchDoc.prototype.pull = function () {
         // This function has an anticipated use, but I haven't tested it much.
            var callback, that, url;
            callback = function (txt) {
                var key, response;
                key = JSON.parse(txt);
                for (key in response) {
                    if (response.hasOwnProperty(key)) {
                        switch (key) {
                        case "_id":
                            that.uuid = that._id;
                            break;
                        default:
                            that[key] = response[key];
                        }
                    }
                }
                that.ready = true;
            };
            that = this;
            that.ready = false;
            url = bookmarks.db + that.uuid;
            q.ajax$get(url, callback);
        };

        CouchDoc.prototype.push = function () {
            var callback, data, that, url;
            callback = function (txt) {
                var response = JSON.parse(txt);
                if (response.ok) {
                    that["_rev"] = response.rev;
                    that.ready = true;
                    if (q.flags.debug) {
                        q.puts("DEBUG:", that);
                    }
                } else {
                    throw new Error('Failed to push to "' + url + '".');
                }
            };
            data = JSON.stringify(this);
            that = this;
            that.ready = false;
            url = bookmarks.db + that.uuid;
            q.ajax$put(url, data, callback);
        };

        q.base$registerType(CouchDoc);

     // Declarations

        var bookmarks, Duck, uuid;

     // Definitions

        bookmarks = {
            root: global.location.href.replace(global.location.pathname, '/')
        };

        bookmarks.db = bookmarks.root +
            global.location.pathname.match(/([\w]+\/){1}/)[0];

        bookmarks.app = bookmarks.root +
            global.location.pathname.match(/([\w]+\/){3}/)[0];

        bookmarks.uuids = bookmarks.root + "_uuids?count=10";

        Duck = q.base$duck(null).constructor;

        uuid = function () {
         // This function dispenses a UUID from a memoized cache of values it
         // has already fetched from CouchDB. It refills the cache using AJAX,
         // and if the cache actually runs out at any point, it refills using
         // the blocking form of XHR in order to guarantee correct behavior.
            var cache = [];
            uuid = function () {
                if (cache.length < 5) {
                    q.ajax$get(bookmarks.uuids, function (txt) {
                        cache.push.apply(cache, JSON.parse(txt).uuids);
                    });
                    if (cache.length === 0) {
                        if (q.flags.debug) {
                            q.puts("DEBUG: refilling empty uuid cache ...");
                        }
                        cache.push.apply(cache,
                            JSON.parse(q.ajax$getNOW(bookmarks.uuids)).uuids);
                    }
                }
                return cache.pop();
            };
            return uuid();
        };

     // Exports

        q.quanah$bookmarks = bookmarks; //- this is temporary ...

        q.quanah$doc = q.base$generic();

        q.quanah$doc(Duck).def = function (x) {
         // This function creates a CouchDoc instance generically and syncs it
         // with Quanah invisibly. It's still experimental, so be careful!
            var y;
            if (x.isObjectLike()) {
                y = new CouchDoc(x.raw);
                y.push();
            } else {
                y = new CouchDoc();
                y.uuid = x.raw;
                y.pull();
            }
            return y;
        };

        q.quanah$volunteer = function () {
         // This function encapsulates the entire workflow of the volunteer's
         // Worker context. After it runs, the context terminates and a fresh
         // one is created by the volunteer's webpage itself :-)
            if (q.detects("window") === true) {
                q.puts('The "volunteer" function only runs in a Worker.');
                return;
            }
            var results, url;
            results = [];
            q.puts = function () {
             // This is a special definition for "puts" that avoids using the
             // "postMessage" method to return output directly to the webpage
             // context; the results need to return to Quanah, after all! And,
             // if you even _try_ to communicate with the volunteer's webpage
             // manually, it terminates the worker with extreme prejudice :-P
                var args, temp;
                args = Array.prototype.slice.call(arguments);
                temp = q.base$map(args).using(q.base$format);
                results.push(Array.prototype.join.call(temp, " "));
                return results.slice();
            };
         // Now, we will hardcode a link to the queue at CouchDB, with a note
         // here so I won't forget and leave it hardcoded permanently ...
            url = bookmarks.db + "_changes?filter=quanah/waiting";
         // Finally, we get to the good part! First, we read the queue.
            q.ajax$get(url, function (txt) {
                var tasks, url;
                tasks = JSON.parse(txt).results;
                if (tasks.length > 0) {
                 // If there are things to do, we fetch one of their documents
                 // so we can run its code. Currently, this grabs the first in
                 // the list -- I'll relax that restriction soon ;-)
                    url = bookmarks.db + tasks[0].id;
                    q.ajax$get(url, function (txt) {
                        var obj = JSON.parse(txt);
                        obj.results = q.puts(eval(obj.code));
                        obj.state = "done";
                        q.ajax$put(url, JSON.stringify(obj), function (txt) {
                            if (q.flags.debug) {
                                if (JSON.parse(txt).ok === false) {
                                    throw new Error("The upload failed.");
                                }
                            }
                        });
                    });
                }
            });
        };

     // And finally, here's the one for Jonas ...

        Object.prototype.Q = function (f) {
            var that = this;
            chassis(function (q, global) {
                f.call(that, q, global);
            });
        };

    };

});

//- vim:set syntax=javascript:
