//- JavaScript source code

//- developer.js ~~
//                                                      ~~ (c) SRW, 21 Oct 2011

chassis(function (q, global) {
    'use strict';

    q.puts('--- Developer mode ---');

    var x, y;

    x = [1, 2, 3, 4, 5];

    y = x.Q(function (x) {
        return x.map(function (each) {
            return 3 * each;
        });
    });

    y.onready = function (val, exit) {
        console.log(val);
        exit.success(val);
    };

});

//- vim:set syntax=javascript:
