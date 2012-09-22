//- JavaScript source code

//- volunteer.js ~~
//                                                      ~~ (c) SRW, 22 Sep 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, load_script, oops, puts;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    load_script = Q.lib;

    oops = function () {
     // This function needs documentation.
        global.console.error(Array.prototype.join.call(arguments, ' '));
        return;
    };

    puts = function () {
     // This function needs documentation.
        global.console.log(Array.prototype.join.call(arguments, ' '));
        return;
    };

 // Out-of-scope definitions

    global.onload = function () {
     // This function needs documentation.
        Q.box = 'testing';
        var volunteer;
        volunteer = function () {
         // This function needs documentation.
            var x = avar();
            x.onerror = function (message) {
             // This function needs documentation.
                if (message !== 'Nothing to do ...') {
                    oops('Error:', message);
                }
                global.setTimeout(volunteer, 1000);
                return;
            };
            x.onready = function (evt) {
             // This function needs documentation.
             /*
                var box, task;
                box = global.location.search.replace(/[^A-z0-9_-]+/g, '');
                if (box === '') {
                    global.location.search = 'testing';
                }
             */
                var task = Q.volunteer();
                task.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                task.onready = function (task_evt) {
                 // This function needs documentation.
                    puts(JSON.stringify({
                        curr:   Q.box,
                        date:   new Date(),
                        task:   task
                    }, undefined, 4));
                    global.setTimeout(volunteer, 1000);
                    task_evt.exit();
                    return evt.exit();
                };
                return;
            };
            return;
        };
        volunteer();
        return;
    };

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
