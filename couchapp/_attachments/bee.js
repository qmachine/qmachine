//- JavaScript source code -- Web Worker script

//- bee.js ~~
//  This is where the magic happens. The computational nodes poll a URL where
//  tasks needing to be accomplished are posted by a CouchDB filter rule. The
//  node then executes the first task listed and uploads its results. The task
//  itself runs within a Web Worker context, which increases both security and
//  performance for all parties involved. Chrome, Safari, Firefox, and Opera
//  all fully support for Web Workers; Internet Explorer, of course, doesn't.
//                                                          ~~ SRW, 25 Sep 2010

importScripts("json2.js", "curl.js", "Q.js", "stdlib.js", "Maths.js");

(function (queue) {
    var fetch = function () {
        var changes = Q.read(queue),
            latest = {},
            results = changes.results || [];
        if (results.length > 0) {
            latest = Q.read(results[0].id);
            latest.results = Q.run(latest.code);
            Q.write(latest);
        }
        setTimeout(fetch, 1000);
    };
    setTimeout(fetch, 1000);
}("_changes?filter=quanah/code"));

//- vim:set syntax=javascript:
