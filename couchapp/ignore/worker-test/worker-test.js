//- JavaScript source code -- usable in browser Web Worker context only

//- worker-test.js ~~
//  A test script to see what technologies are available to a Web Worker.
//                                                          ~~ SRW, 25 Sep 2010

var check_for = function (name, obj) {
        if (obj !== undefined) {
            postMessage(name + " is available.");
        } else {
            postMessage(name + " is NOT available.");
        }
    },

    try_redirect = function () {
        var get_raw = function (url) {
                var req = new XMLHttpRequest();
                req.open('GET', url, false);    //- synchronous
                req.send(null);
            },  

            google = "http://www.google.com";

        try {

            location.href = google;
            postMessage("Tried redirecting to " + google + ".");
            postMessage("Went to " + location.href + " without error.");
            postMessage(get_raw(google));

        } catch (err) {
            
            postMessage(err);
        
        }

    };

//- TESTS

check_for("JSON", this.JSON);
check_for("location", this.location);
check_for("navigator", this.navigator);
check_for("WebSocket", this.WebSocket);
check_for("Worker", this.Worker);
check_for("XMLHttpRequest", this.XMLHttpRequest);
//try_redirect();

postMessage("closing");
setTimeout(close, 1000);


//- vim:set syntax=javascript:
