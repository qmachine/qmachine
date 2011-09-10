//- JavaScript source code

//- volunteer.js ~~
//
//  Yes, it's hard-coded, but I'll deal with that later.
//
//                                                      ~~ (c) SRW, 10 Sep 2011

importScripts(
    "quanah.js",
    "method-Q.js"
);

var cache;

cache = {
    argv: function (x) {
        cache.argv = x.content;
    },
    main: function (x) {
        cache.main = eval(x.content);
        cache.main$raw = x;
    },
    queue: function (x) {
        cache.queue = x.hasOwnProperty("results") ? x.results : [];
        cache.queue$raw = x;
    },
    results: function (x) {
        cache.results = x.content;
        cache.results$raw = x;
    },
    task: function (x) {
        cache.argv$url = x.content.argv;
        cache.main$url = x.content.main;
        cache.results$url = x.content.results;
        cache.task$raw = x;
    }
};

importScripts(
    (QUANAH.bookmarks.db +
        "_changes?filter=quanah/waiting&callback=cache.queue")
);

if (cache.queue.length > 0) {

    cache.task$url = QUANAH.bookmarks.db + cache.queue[0].id;

    importScripts(
        (cache.task$url + "?callback=cache.task")
    );

    cache.task$raw.content.status = "running";

    cache.task$raw._rev = JSON.parse(
        QUANAH.ajax$putNOW(cache.task$url, JSON.stringify(cache.task$raw))
    ).rev;

    importScripts(
        (cache.argv$url + "?callback=cache.argv"),
        (cache.main$url + "?callback=cache.main"),
        (cache.results$url + "?callback=cache.results")
    );

    try {
        cache.results = cache.main(cache.argv);
    } catch (err) {
        cache.results = err;
    } finally {
        cache.results$raw.content = cache.results;
    }

    QUANAH.ajax$put(cache.results$url,
        JSON.stringify(cache.results$raw),
        function (err, txt) {
            if (err !== null) {
                postMessage(JSON.stringify(err));
            } else {
                postMessage("results: " + txt);
            }
        }
    );

    cache.task$raw.content.status = "done";

    QUANAH.ajax$put(cache.task$url,
        JSON.stringify(cache.task$raw),
        function (err, txt) {
            var response;
            if (err !== null) {
                postMessage(JSON.stringify(err));
            } else {
                response = JSON.parse(txt);
                if (response.ok) {
                    cache.task$raw._rev = response.rev;
                    postMessage("task done:" + txt);
                }
            }
        }
    );

} else {

    postMessage("Nothing to do ...");

}

//- vim:set syntax=javascript:
