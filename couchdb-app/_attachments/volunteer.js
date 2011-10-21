//- JavaScript source code

//- volunteer.js ~~
//                                                      ~~ (c) SRW, 21 Oct 2011

chassis(function (q, global) {
    'use strict';

 // Prerequisites

    q.lib('fs');

 // Declarations

    var countdown, sync, task;

 // Definitions (n/a)

    countdown = function (n, callback) {
        var total = parseInt(Math.abs(n));
        return function () {
            total -= 1;
            if (total === 0) {
                callback.apply(this, arguments);
            }
        };
    };

    sync = q.fs$sync;

 // Invocations

    q.fs$read('_design/quanah/_view/tasks?key="waiting"', function (err, res) {

        if (err !== null) {
         // This is sloppy but very helpful for debugging right now ...
            console.error(err, res);
        }

        if (res.rows.length === 0) {
            console.log('Nothing to do ...');
            return;
        }

     // For now, take the first entry, run it, and upload its results.

        task = sync({key: res.rows[0].id});

        task.onready = function (val, exit) {
            val.status = 'running';
            exit.success(val);
        };

        sync(task);

        task.onready = function (val_task, exit_task) {

            var count, f, x, y;

            count = countdown(3, function () {
                y.onready = function (val_y, exit_y) {
                    var results;
                    try {
                        results = f.val(x.val);
                        val_task.status = 'done';
                        exit_y.success(results);
                    } catch (err) {
                        val_task.status = 'failed';
                        exit_y.success(err);
                    }
                };
                sync(y);
                y.onready = function (val_y, exit_y) {
                    exit_task.success(val_task);
                    console.log(val_y);
                    exit_y.success(val_y);
                };
            });

            f = sync({key: val_task.f});
            x = sync({key: val_task.x});
            y = sync({key: val_task.y});

            f.onready = x.onready = y.onready = function (val, exit) {
                count();
                exit.success(val);
            };

        };

        sync(task);

    });

});

//- vim:set syntax=javascript:
