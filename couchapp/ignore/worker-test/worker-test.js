//- JavaScript source code -- usable in browser Web Worker context only

//- worker-test.js ~~
//  A test script to see what technologies are available to a Web Worker.
//                                                          ~~ SRW, 25 Sep 2010

var checker = function (name, obj) {
        if (obj !== undefined) {
            postMessage(name + " is available.");
        }
    },

    get_raw = function (url) {
        var req = new XMLHttpRequest();
        req.open('GET', url, false);    //- synchronous
        req.send(null);
    },

    google = "http://www.google.com";

checker("JSON", JSON);
checker("WebSocket", WebSocket);
checker("XMLHttpRequest", XMLHttpRequest);
checker("location", location);

try {

    location.href = google;
    postMessage("Tried redirecting to " + google + ".");
    postMessage("Went to " + location.href + " without error.");
    postMessage(get_raw(google));

} catch (err) {

    postMessage(err);

}

//- vim:set syntax=javascript:
