//- JavaScript source code

//- queue-stats.js ~~
//
//  This demonstrates a way to execute parallel downloads in Worker contexts
//  without AJAX by using JSONP and functions that redefine themselves. This
//  technique skirts the same-origin policy by treating data as functions.
//
//  In JavaScript, it is incredibly powerful to treat functions as data, but
//  we don't treat data as functions nearly as often :-)
//
//                                                      ~~ (c) SRW, 08 Sep 2011

var done, running, waiting;

done = function (obj) {
    postMessage({
        name: "done",
        queue: (obj.hasOwnProperty("results")) ? obj.results : "No jobs found."
    });
};

running = function (obj) {
    postMessage({
        name: "running",
        queue: (obj.hasOwnProperty("results")) ? obj.results : "No jobs found."
    });
};

waiting = function (obj) {
    postMessage({
        name: "waiting",
        queue: (obj.hasOwnProperty("results")) ? obj.results : "No jobs found."
    });
};

importScripts(
    "http://localhost/db/_changes?filter=quanah/done&callback=done",
    "http://localhost/db/_changes?filter=quanah/running&callback=running",
    "http://localhost/db/_changes?filter=quanah/waiting&callback=waiting"
);

//- vim:set syntax=javascript:
