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

        CouchDoc.prototype.sync = function () {
         // If the local copy is newer, a "push" will succeed. If the remote
         // copy is newer, a "pull" will succeed. At least one of these will
         // fail, and if both fail, we can only assume something has gone
         // horribly awry. Thus, the approach here attempts to synchronize to
         // and from CouchDB at the same time using AJAX and only throws an
         // error if both attempts fail. I have also decided to rewrite the
         // "ajax" module to use a Node.js idiom that asynchronous functions
         // always return an error and an output.
            var that = this;
            chassis(function (q) {
                if (that.ready === false) {
                    q.die();
                }
                that.ready = false;
                var callback, data, url;
                callback = function (err, txt) {
                    var key, other, rev;
                    if (err === null) {     //- the sync succeeded -- hooray!
                        other = JSON.parse(txt);
                        if (other.ok === true) {
                         // The local version pushed to CouchDB successfully,
                         // and thus we need only update our revision number.
                            that._rev = other.rev;
                        }
                        if (parseInt(that._rev || 0) < parseInt(other._rev)) {
                         // The remote version is newer -- copy its properties
                         // onto the local version. Don't simply replace the
                         // local instance, though -- it destroys references.
                            for (key in other) {
                                if (other.hasOwnProperty(key)) {
                                    that[key] = other[key];
                                }
                            }
                        }
                        that.ready = true;
                    } else {
                        callback.errs += 1;
                        if (callback.errs === 2) {
                            q.puts('The "sync" has gone horribly awry.');
                            //throw new Error('The "sync" has gone awry ...');
                        }
                    }
                };
                callback.errs = 0;
                data = JSON.stringify(that);
                url = bookmarks.db + that.uuid;
                q.ajax$get(url, callback);
                q.ajax$put(url, data, callback);
            });
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
                    q.ajax$get(bookmarks.uuids, function (err, txt) {
                        if (err) {
                            throw err;
                        }
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
            } else {
                y = new CouchDoc();
                y.uuid = x.raw;
            }
            y.sync();
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
            q.ajax$get(url, function (err, txt) {
                if (err) {
                    throw err;
                }
                var tasks, url;
                tasks = JSON.parse(txt).results;
                if (tasks.length > 0) {
                 // If there are things to do, we fetch one of their documents
                 // so we can run its code. Currently, this grabs the first in
                 // the list -- I'll relax that restriction soon ;-)
                    url = bookmarks.db + tasks[0].id;
                    q.ajax$get(url, function (err, txt) {
                        if (err) {
                            throw err;
                        }
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
