//- JavaScript source code

//- 502-demo.js ~~
//                                                      ~~ (c) SRW, 27 Apr 2012

(function () {
    'use strict';

    Q.box = 'sean';

    var x = Q.avar();

    x.onerror = function (message) {
        console.error(message);
        return;
    };

    x.onready = function (evt) {
        this.val = Math.random();
        return evt.exit();
    };

    x.onready = function (evt) {
        console.log(this.val);
        return evt.exit();
    };

    return;

}());

//- vim:set syntax=javascript:
