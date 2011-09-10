//- JavaScript source code

//- volunteer.js ~~
//
//  Yes, it's hard-coded, but I'll deal with that later :-P
//
//                                                      ~~ (c) SRW, 09 Sep 2011

var bookmarks, cache;

if (location.port === "") {
 // This happens if we are actually using the rewrite rules I created
 // for my personal machine, but I haven't tested them on CouchOne ...
    bookmarks = {
        app:    location.href.replace(location.pathname, '/'),
        db:     location.href.replace(location.pathname, '/db/'),
        uuids:  location.href.replace(location.pathname, '/_uuids?count=1000')
    };
} else if (location.port === "5984") {
 // This is CouchDB's default debugging port, and the convention then
 // is to disable rewrite rules when using that port. In that case, I
 // have avoided hard-coding assumptions about the deployment target
 // by instead opting to navigate paths relative to the current URL.
    bookmarks = {
        app:    location.href.replace(location.pathname, '/') +
                    location.pathname.match(/([\w]+\/){3}/)[0],
        db:     location.href.replace(location.pathname, '/') +
                    location.pathname.match(/([\w]+\/){1}/)[0],
        uuids:  location.href.replace(location.pathname, '/_uuids?count=1000')
    };
} else {
 // Because this is still experimental, we may find problems.
    throw new Error("Relative path detection fell through.");
}

cache = {
    argv: function (x) {
        cache.argv = x.content;
    },
    main: function (x) {
        cache.main = eval(x.content);
    },
    queue: function (x) {
        cache.queue = x.hasOwnProperty("results") ? x.results : [];
    },
    results: function (x) {
        cache.results = x.content;
    },
    task: function (x) {
        cache.task = x.content;
    }
};

importScripts(
    "method-Q.js",
    (bookmarks.db + "_changes?filter=quanah/waiting&callback=cache.queue")
);

if (cache.queue.length > 0) {

    importScripts(
        (bookmarks.db + cache.queue[cache.queue.length - 1].id +
            "?callback=cache.task")
    );

 // (NOTE: Status change from "waiting" to "running" will go here.)

    importScripts(
        (cache.task.argv + "?callback=cache.argv"),
        (cache.task.main + "?callback=cache.main"),
        (cache.task.results + "?callback=cache.results")
    );

    cache.results = cache.main(cache.argv);

 // (NOTE: Status change from "running" to "done" will go here.)

 // (NOTE: Upload of results back to CouchDB will go here.)

    postMessage(cache.results);

}

//- vim:set syntax=javascript:
