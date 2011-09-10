//- JavaScript source code

//- volunteer.js ~~
//
//  Yes, it's hard-coded, but I'll deal with that later. It's working pretty
//  well, but I'm tired of mixing hard code and copy/paste -- the revision
//  "gotchas" in CouchDB are pretty inconvenient when you have to handle them
//  manually. I'm going to bed.
//
//                                                      ~~ (c) SRW, 10 Sep 2011

var ajax$put, bookmarks, cache, isFunction;

ajax$put = function (url, data, callback) {
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
            if (isFunction(callback) === true) {
                callback(err, txt);
            }
        }
    };
    req.open("PUT", url, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(data);
    return req;
};

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
        cache.main$original = x;
    },
    queue: function (x) {
        cache.queue = x.hasOwnProperty("results") ? x.results : [];
        cache.queue$original = x;
    },
    results: function (x) {
        cache.results = x.content;
        cache.results$original = x;
    },
    task: function (x) {
        cache.task = x.content;
        cache.task$original = x;
    }
};

isFunction = function (f) {
    return ((typeof f === 'function') && (f instanceof Function));
};

importScripts(
    "method-Q.js",
    (bookmarks.db + "_changes?filter=quanah/waiting&callback=cache.queue")
);

if (cache.queue.length > 0) {

    importScripts(
        (bookmarks.db + cache.queue[0].id + "?callback=cache.task")
    );

    cache.task$original.content.status = "running";

    ajax$put(bookmarks.db + cache.queue[0].id,
        JSON.stringify(cache.task$original),
        function (err, txt) {
            var response;
            if (err !== null) {
                postMessage(err);
            } else {
                response = JSON.parse(txt);
                if (response.ok) {
                    cache.task$original._rev = response.rev;
                    postMessage(txt);
                }
            }
        }
    );

    importScripts(
        (cache.task.argv + "?callback=cache.argv"),
        (cache.task.main + "?callback=cache.main"),
        (cache.task.results + "?callback=cache.results")
    );

    try {
        cache.results = cache.main(cache.argv);
    } catch (err) {
        cache.results = err;
    } finally {
        cache.results$original.content = cache.results;
    }

    ajax$put(bookmarks.db + cache.queue[0].id,
        JSON.stringify(cache.task$original),
        function (err, txt) {
            var response;
            if (err !== null) {
                postMessage(err);
            } else {
                response = JSON.parse(txt);
                if (response.ok) {
                    cache.task$original._rev = response.rev;
                    postMessage(txt);
                }
            }
        }
    );

    ajax$put(cache.task$original.content.results,
        JSON.stringify(cache.results$original),
        function (err, txt) {
            if (err !== null) {
                postMessage(err);
            } else {
                postMessage(txt);
            }
        }
    );

} else {

    postMessage("Nothing to do ...");

}

//- vim:set syntax=javascript:
