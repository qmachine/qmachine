//- JavaScript source code

//- jsonp-worker.js ~~
//
//  This demonstrates a way to execute parallel downloads in Worker contexts
//  without AJAX by using JSONP and functions that redefine themselves. This
//  technique skirts the same-origin policy by treating data as functions.
//
//  In JavaScript, it is incredibly powerful to treat functions as data, but
//  we don't treat data as functions nearly as often :-)
//
//                                                      ~~ (c) SRW, 08 Sep 2011

var queue;

queue = function (obj) {
    if (obj.hasOwnProperty("results")) {
        queue = obj.results;
        postMessage(queue);
    } else {
        postMessage("No jobs found.");
    }
};

importScripts(
    "http://localhost/db/_changes?filter=quanah/waiting&callback=queue"
);

//- vim:set syntax=javascript:
