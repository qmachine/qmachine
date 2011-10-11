//- JavaScript source code

//- factorial.js ~~
//
//  Dr. Song asked a deceptively difficult question today about how to write a
//  recursive function with Quanah; this program attempts to answer it.
//
//                                                      ~~ (c) SRW, 06 Oct 2011

(function () {
    'use strict';

    var x, y;

    x = 42;

    y = x.Q(function factorial(x) {
     // NOTE: I have assumed positive integral x.
     // NOTE: I have not yet tested this code ...
        var y2;
        if (x === 1) {
            return 1;
        } else {
            y2 = (x - 1).Q(factorial);
            y2.onready = function (y2, exit) {
                exit.success(x * y2);
            };
            return y2.sync();
        }
    });

    y.onready = function (y, exit) {
        console.log(y);
        exit.success(y);
    };

}());

//- vim:set syntax=javascript:
