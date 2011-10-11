//- JavaScript source code

//- demo.js ~~
//                                                      ~~ (c) SRW, 11 Oct 2011

(function () {
    'use strict';

    var x, y;

    x = [1, 2, 3, 4, 5];

    y = x.Q(function (x) {
        var i, n, y;
        n = x.length;
        y = [];
        for (i = 0; i < n; i += 1) {
            y[i] = 3 * x[i];
        }
        return y;
    });

    y.onready = function (y, exit) {
        console.log(y);
        exit.success(y);
    };

}());

//- vim:set syntax=javascript:
