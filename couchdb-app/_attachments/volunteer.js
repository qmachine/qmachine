//- JavaScript source code

//- volunteer.js ~~
//                                                      ~~ (c) SRW, 21 Oct 2011

chassis(function (q, global) {
    'use strict';

    q.puts('--- Volunteer mode ---');

    q.fs$read('_design/quanah/_view/tasks', function (err, res) {
        if (err === null) {
         // This is sloppy but very helpful for debugging right now ...
            console.log(res);
        } else {
            q.puts(res);
        }
    });

});

//- vim:set syntax=javascript:
