//- JavaScript source code

//- test-20.js ~~
//
//  This "program" shows how to kidnap extra volunteers from other queues ...
//  It works best if you have three tabs open so that one tab is running this
//  code, one tab is volunteering for "botnet", and one tab is volunteering for
//  "testing". After this program runs, both volunteers should be polling the
//  queue for "testing" :-)
//
//                                                      ~~ (c) SRW, 15 Oct 2012

(function () {
    'use strict';

    /*global Q, avar, identity, oops, ply, puts, run_next_test, when */

    /*jslint indent: 4, maxlen: 80 */

    var x = avar({box: 'testing', val: 2});

    x.onerror = oops;

    x.onready = function (evt) {
     // This function runs remotely on a "testing" queue volunteer.
        var temp = this.Q.avar({box: 'botnet'});
        temp.onerror = function (message) {
         // This function needs documentation.
            return evt.fail(message);
        };
        temp.onready = function (evt) {
         // This function runs remotely in the "botnet" queue but switches a
         // volunteer's default `box` value and thereby abducts its resources.
            this.QM.box = 'testing';
            return evt.exit();
        };
        temp.onready = function (temp_evt) {
         // This function runs "locally" on the original "testing" volunteer,
         // but this is still remote as compared with the original invoking
         // context of `x`.
            temp_evt.exit();
            return evt.exit();
        };
        return;
    };

    x.onready = function (evt) {
     // This function needs documentation.
        puts('Test 20: Success.');
        return evt.exit();
    };

    x.onready = run_next_test;

    return;

}());

//- vim:set syntax=javascript:
