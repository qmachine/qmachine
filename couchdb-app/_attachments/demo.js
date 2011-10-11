//- JavaScript source code

//- demo.js ~~
//
//  I write this short demonstration in lieu of actual documentation :-P
//
//                                                      ~~ (c) SRW, 11 Oct 2011

(function () {
    'use strict';

    var x, y, z;

    x = [1, 2, 3, 4, 5];

    y = x.Q(function (x) {
        return x.map(function (each) {
            return 3 * each;
        });
    });

    y.onready = function (y, exit) {
        console.log(y);                 //> [3, 6, 9, 12, 15]
        exit.success(y);
    };

    z = y.Q(function (x) {
        return x.reduce(function (a, b) {
            return a + b;
        });
    });

    z.onready = function (z, exit) {
        console.log(z);                 //> 45
        exit.success(z);
    };

}());

//- vim:set syntax=javascript:
