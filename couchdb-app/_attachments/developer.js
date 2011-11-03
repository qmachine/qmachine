//- JavaScript source code

//- developer.js ~~
//                                                      ~~ (c) SRW, 26 Oct 2011

chassis(function (q, global) {
    'use strict';

 // This demonstrates a computation in the monadic style. Output should be 45.

    [1, 2, 3, 4, 5].
        Q(function (x) {
            return x.map(function (each) {
                return 3 * each;
            });
        }).
        Q(function (x) {
            return x.reduce(function (a, b) {
                return a + b;
            });
        }).
        onready = function (val, exit) {
            q.puts(val);
            exit.success(val);            
        };

});

//- vim:set syntax=javascript:
