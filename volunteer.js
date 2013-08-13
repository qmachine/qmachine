//- JavaScript source code

//- volunteer.js ~~
//                                                      ~~ (c) SRW, 15 Oct 2012
//                                                  ~~ last updated 13 Aug 2013

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (global.hasOwnProperty('QM') === false) {
        throw new Error('QMachine is missing.');
    }

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var QM, avar, oops, puts;

 // Definitions

    QM = global.QM;

    avar = Object.prototype.Q.avar;

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
        QM.box = 'testing';
        var volunteer;
        volunteer = function () {
         // This function needs documentation.
            var x = avar();
            x.on('error', function (message) {
             // This function needs documentation.
                if (message === 'Nothing to do ...') {
                    puts(message);
                } else {
                    oops('Error:', message);
                }
                global.setTimeout(volunteer, 1000);
                return;
            });
            x.Q(function (evt) {
             // This function needs documentation.
             /*
                var box, task;
                box = global.location.search.replace(/[^A-z0-9_-]+/g, '');
                if (box === '') {
                    global.location.search = 'testing';
                }
             */
                var task = QM.volunteer();
                task.on('error', function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                });
                task.Q(function (task_evt) {
                 // This function needs documentation.
                    puts(JSON.stringify({
                        curr:   QM.box,
                        date:   new Date(),
                        task:   task
                    }, undefined, 4));
                    global.setTimeout(volunteer, 1000);
                    task_evt.exit();
                    return evt.exit();
                });
                return;
            });
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
