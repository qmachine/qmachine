//- JavaScript source code -- usable in browser's "Web Worker" context only

//- bee.js ~~
//  This JavaScript is designed for use by a "Web Worker" object. For info, see
//      https://developer.mozilla.org/En/Using_web_workers
//                                                          ~~ SRW, 25 Sep 2010

importScripts("json2.js", "curl.js", "Q.js", "stdlib.js", "Maths.js");

(function (queue) {
    var fetch = function () {
        var changes = Q.down(queue),
            latest = {},
            results = changes.results || [];
        if (results.length > 0) {
            latest = Q.down(results[0].id);
            latest.results = Q.run(latest.code);
            Q.up(latest);
        }
        setTimeout(fetch, 1000);
    };
    setTimeout(fetch, 1000);
}("_changes?filter=quanah/code"));

//- vim:set syntax=javascript:
