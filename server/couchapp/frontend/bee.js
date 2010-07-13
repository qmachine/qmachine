// BROWSER ONLY!

// bee.js --
//  This JavaScript is designed for use by a "Web Worker" object. For info, see
//      https://developer.mozilla.org/En/Using_web_workers
//                                                          -- SRW, 13 Jul 2010

importScripts("json2.js","curl.js","Q.js","Maths.js");

(function (queue) {
    var fetch = function () {
        var changes = Q.down(queue),
            latest = {};
        if (changes.results.length > 0) {
            latest = Q.down(changes.results[0].id);
            latest.results = Q.eval(latest.code);
            Q.up(latest);
        }
        setTimeout(fetch, 1000);
    };
    setTimeout(fetch, 1000);
}("_changes?filter=quanah/code"));
