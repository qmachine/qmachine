//- JavaScript source code -- usable in browser Web Worker context only

//- worker-test.js ~~
//  A test script to see what technologies are available to a Web Worker.
//                                                          ~~ SRW, 25 Sep 2010

var checker = function (name, obj) {
        if (obj !== undefined) {
            postMessage(name + " is available.");
        }
    };

checker("JSON", JSON);
checker("WebSocket", WebSocket);
checker("XMLHttpRequest", XMLHttpRequest);

//- vim:set syntax=javascript:
