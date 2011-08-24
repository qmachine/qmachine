//- JavaScript source code

//- bee-dev.js ~~
//
//  This program implements Quanah's "local" execution context, but it doesn't
//  submit code to the "remote" execution context yet.
//
//                                                      ~~ (c) SRW, 21 Aug 2011

importScripts(
    "bin/web-chassis.js",
    "bin/jslint.js",
    "lib/quanah.js"
);

chassis(function (q, global) {
    "use strict";

 // Prerequisites

    q.lib("quanah");

 // Private declarations

    var alpha;

 // Private definitions

    alpha = "\u03B1";                   //- the UTF-8 codepoint for \alpha :-)

 // Global definitions

    global.onerror = function (evt) {

     // I'll worry about formatting ErrorEvents generically later ...

        q.puts(evt);

    };

    global.onmessage = function (evt) {

     // My new idea is to use JSLint as an off-the-shelf preprocessor so that
     // I don't have to write (and therefore, maintain) my own. JSLint is a
     // self-contained code analysis tool written by the strictest JS expert
     // in the world, and it possesses both a powerful, externally configurable
     // parser and a very permissive license. This choice of "components" will
     // hopefully expedite my solution of closure serialization by allowing me
     // to reject the distribution of codes that aren't self-contained. It may
     // even be a better idea to filter these at the server-side as a safety
     // measure, but I'll worry more about that later.

        var code, mode, not_lint, options;

        code = evt.data.code;
        mode = evt.data.mode;

        not_lint = [
         // Here, I have specified defaults that aren't configurable yet ...
            "/*global chassis: true */"
        ];

        options = {
            sloppy: true                //- make "use strict" pragma optional
        };

        if (code.length === 0) {
            return;
        } else {
            code = [not_lint.join("\n"), code].join("\n");
        }

        if (global.JSLINT(code, options) === false) {            
            q.puts(global.JSLINT.errors);
            return;
        }

        switch (mode) {
        case "local":
            try {
                q.puts(eval(code));
            } catch (err) {
                q.puts(err);
            }
            break;
        case "remote":
            (function (x) {
                if (q.flags.debug) {
                    q.puts("Pushing to Quanah ...");
                }
                chassis(function (q) {
                    if (x.ready === false) {
                        q.die("It hasn't uploaded yet ...");
                    }
                 // We're in a Web Worker, so there's no reason _not_ to block,
                 // since I'm thoroughly annoyed right now anyway. This _does_
                 // work, by the way ;-)
                    if (q.flags.debug) {
                        q.puts("Polling for results ...");
                    }
                    var obj, txt;
                    obj = {state: "waiting"};
                    while (obj.state !== "done") {
                        txt = q.ajax$getNOW(q.quanah$bookmarks.db + x.uuid);
                        obj = JSON.parse(txt);
                    }
                 // The volunteer captures the exit code of the 'eval' just in
                 // case it's the only "output". If it is the only output, we
                 // want to see it, but otherwise it's usually ugly anyway.
                    if (obj.results.length === 1) {
                        q.puts(obj.results);
                    } else {
                        q.puts(obj.results.slice(0, -1));
                    }
                });
            }(q.quanah$doc({
                code: code,
                state: "waiting"
            })));
            break;
        default:
            q.puts("What have you done to this computer?!");
            break;
        }

    };

 // Send a welcome message back to the main context before exiting :-)

    q.puts("Welcome to Quanah 2.0-" + alpha + ".");

 // Also, the next line is useful for inspecting the methods available to a
 // specific browser's Worker object. The growing support for non-standard
 // object constructors like Uint8Array seems to indicate that a new era of
 // high-performance computing is just around the bend ...

 /*
    q.puts(Object.getOwnPropertyNames(global).sort(function (a, b) {
        return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;
    }));
 */

});

//- vim:set syntax=javascript:
