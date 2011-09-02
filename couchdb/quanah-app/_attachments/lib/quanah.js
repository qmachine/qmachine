//- JavaScript source code

//- quanah.js ~~
//
//  This file defines Quanah as a Web Chassis module. I'll write the rest of
//  the description later when I reflect on what I've actually accomplished :-P
//
//  An idea I had just now for implementing a non-blocking interactive session
//  is to push functions onto a stack when the CouchDoc isn't ready, just like
//  I do for Web Chassis's main "revive" loop. Then, hopefully I would be able
//  to tie those together as successfully as I have done with "revive", with a
//  single key difference -- the stack order for CouchDocs must be preserved!
//
//                                                      ~~ (c) SRW, 25 Aug 2011

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

     // Private declarations

        var bookmarks, Duck, uuid;

     // Constructors

        function CouchDoc(obj) {
         // This function is a constructor that produces CouchDoc objects.
         // A CouchDoc object corresponds directly to a document on CouchDB,
         // and this one-to-one correspondence keeps things simple. I build
         // Quanah's basic data structures using this as a building block.
            this._id = uuid();
            this._rev = null;
            this.data = obj || null;
            this.ready = true;
            this.queue = [];
            this.type = "CouchDoc";     //- useful for writing CouchDB filters
            return this;
        }

     // Constructor prototypes

        CouchDoc.prototype.onload = null;

        CouchDoc.prototype.revive = function () {
         // This function mimics Web Chassis's "revive" function, but this one
         // works its way linearly through a CouchDoc's queue when its "ready"
         // property indicates that the previous operation has succeeded.
            //(nothing yet...)
        };

        CouchDoc.prototype.whenready = function (f) {
            if (this.ready === true) {
                f.call(this);
            } else {
                this.queue.push(f);
            }
            chassis(function (q) {
                //???
            });
            return this;
        };

        CouchDoc.prototype.sync = function () {
         // This function syncs a CouchDoc to the remote CouchDB instance in
         // the same sense that Git and Mercurial would sync two repositories.
            var count, push, pull, revision, that, url;
            that = this;
            if (that.ready === false) {
             // If the object is being used right now, we'll just exit for now,
             // because I don't have the queue mechanism worked out yet. We'll
             // probably push a "sync" onto the stack here after I think about
             // how to avoid creating an endless list of consecutive syncs.
                return;
            }
            count = 0;
            pull = function () {
             // This function updates the local version if it's out-of-date.
             // The GET operation depends on the fact that the CouchDoc has
             // been PUT to remote at some point, and it fails otherwise.
                q.ajax$get(url, function (err, txt) {
                    if (err !== null) {
                        count += 1;
                        if (count === 2) {
                            throw new Error("Sync to " + url + " failed.");
                        }
                        return;
                    }
                    var key, response;
                    response = JSON.parse(txt);
                    if (revision < parseInt(response._rev)) {
                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                that[key] = response[key];
                            }
                        }
                    }
                    that.ready = true;
                });
            };
            push = function () {
             // This function succeeds if the local version is up-to-date or
             // if the local version is newer than the remote version.
                q.ajax$put(url, JSON.stringify(that), function (err, txt) {
                    if (err !== null) {
                        count += 1;
                        if (count === 2) {
                            throw new Error("Sync to " + url + " failed.");
                        }
                        return;
                    }
                    var response = JSON.parse(txt);
                    if (response.ok === true) {
                     // NOTE: I did not forget an underscore here -- CouchDB's
                     // response will have a "rev" property, not "_rev".
                        that._rev = response.rev;
                        that.ready = true;
                    } else {
                     // This is uncommon, but it would still be bad news.
                        count += 1;
                        if (count === 2) {
                            throw new Error("Sync to " + url + " failed.");
                        }
                    }
                });
            };
            revision = parseInt(this._rev);
            that = this;
            url = bookmarks.db + that._id;
         // Now, we invoke the functions simultaneously, but we don't need to
         // block execution because each CouchDoc has a "ready" flag to allow
         // the invoking function to choose its own appropriate strategy :-)
            this.ready = false;
            if (this._rev === null) {
             // This part helps avoid errors that occur when you use a "_rev"
             // property that wasn't assigned by CouchDB. We only need to do
             // this when the object hasn't been synced to remote yet, which
             // means the "pull" will fail -- avoid the "pull", then, because
             // Chrome's console fills with lots of distracting error messages
             // even though I'm catching the error. Ugh.
                delete this._rev;
            } else {
                pull();
            }
            push();
        };

        q.base$registerType(CouchDoc);

     // Private definitions

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

     // Module "exports"

        q.quanah$share = q.base$generic();

        q.quanah$share(CouchDoc).def = function (x) {
            x.sync();
            return x;
        };

        q.quanah$share(Duck).def = function (x) {
         // This function creates a CouchDoc instance and syncs it to CouchDB
         // asynchronously as a convenience. You can choose whether or not to
         // block execution by conditioning on the "ready" property :-)
            var y = new CouchDoc(x.raw);
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

     // Generic extensions

     // Generic extensions to the "base" library methods for CouchDocs use the
     // same mechanism that Web Chassis itself uses -- we treat a function to
     // be run against the variable as a transform that we may push onto a
     // stack for later execution. I will add some conventional event handlers
     // to the CouchDoc type to allow for an "onload" definition, etc.

        q.base$map(CouchDoc).def = function (x) {
            q.puts("(map found)");
        };

        q.base$ply(CouchDoc).def = function (x) {
            return {
                by: function (f) {
                 // First, we block until the document has synced locally.
                 // Since it may be unavailable, we _do_ need to "block", and
                 // my idea is to attempt to do something constructive while
                 // we are waiting by either reviving or volunteering ...
                    while (x.ready === false) {
                        q.puts("Document is busy ...");
                        q(function () {});
                    }
                 // Now, we will ply the local document's "data" property :-)
                    q.base$ply(x.data).by(f);
                 // Although this looks really strange to return the input
                 // argument, we need to do this so users can check status.
                    x.whenready(function () {
                        q.base$ply(x.data).by(f);
                    });
                    return x;
                }
            };
        };

        q.base$ply(CouchDoc, Function).def = function (x, f) {
            return q.base$ply(x).by(f);
        };

     // And finally, here's the one for Jonas ...

        Object.prototype.Q = function (f) {
            "use strict";

         // Prerequisites

            if ((f instanceof Function) !== true) {
                throw new Error('Method "Q" expects a function as argument.');
            }

         // Declarations

            var x;

         // Definitions

            x = q.quanah$share(this);   //- NOTE: This only shares the data to
                                        //  Quanah. What I really need to do is
                                        //  to construct some sort of QuanahJob
                                        //  object that encapsulates the task.

         // Invocations

            if (q.hasOwnProperty(f.name) === true) {
                return q[f.name](x, f);
            } else if (typeof x[f.name] === 'function') {
                return x[f.name].apply(x, arguments);
            } else {
             // Default to "ply", which doesn't actually return values.
                return chassis.base$ply(shared).by(f);
                throw new Error('Method "Q" could not find "' + f.name + '".');
            }
        };

    };

});

//- vim:set syntax=javascript:
