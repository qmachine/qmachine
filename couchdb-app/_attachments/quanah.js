//- JavaScript source code

//- quanah.js ~~
//
//  This program defines Quanah in terms of Web Chassis. It depends on global
//  variables "chassis" and "RAINMAN" (the latter indirectly), but ultimately
//  I plan to hand-roll an optimized, self-contained version some day :-)
//
//                                                      ~~ (c) SRW, 26 Oct 2011

chassis(function (q, global) {
    'use strict';

 // Prerequisites

    q.lib('fs');

    if (typeof Object.prototype.Q === 'function') {
     // Avoid unnecessary work if Method Q already exists.
        return;
    }

 // Private declarations

    var countdown, sync, token;

 // Private definitions

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

    token = 'sean';                     //- TODO: load value from environment

 // Global definitions

    Object.prototype.Q = function (func) {
        var count, f, x, y, task;
        if ((typeof func === 'function') && (func instanceof Function)) {
            count = countdown(3, function () {
                task.onready = function (val, exit) {
                    val.f = f.key;
                    val.x = x.key;
                    val.y = y.key;
                    val.status = 'waiting';
                    val.token = token;
                    exit.success(val);
                };
                sync(task);
            });
            f = sync({val: func});
            x = sync((this instanceof f.constructor) ? this : {val: this});
            y = sync({val: null});
            task = sync({
                val: {
                    f:      null,
                    x:      null,
                    y:      null,
                    status: 'initializing'
                }
            });
            f.onready = x.onready = y.onready = function (val, exit) {
                count();
                exit.success(val);
            };
            y.onready = function (val, exit) {
             // NOTE: See polling mechanism at http://goo.gl/TwYXA .
                var check, timer;
                check = function () {
                    q.fs$read(task.key, function (err, res) {
                        var temp;
                        if (err === null) {
                            if (res.val.status === 'done' ||
                                res.val.status === 'failed') {
                                global.clearInterval(timer);
                                if (q.argv.debug === true) {
                                    q.puts('Cleared timer :-)');
                                }
                                temp = sync({key: y.key});
                                temp.onready = function (val, exit_temp) {
                                    exit.success(val);
                                    exit_temp.success(val);
                                };
                            }
                        } else {
                            exit.failure(res);
                        }
                    });
                    if (q.argv.debug === true) {
                        q.puts('Checking ' + task.key + ' ...');
                    }
                };
                if (q.argv.debug === true) {
                    q.puts('Starting timer ...');
                }
                timer = global.setInterval(check, 1000);    //- 1 Hz polling
            };
            return y;
        } else {
            throw new Error('Method Q expects a function as its argument.');
        }
    };

 // Invocations

    if (q.argv.developer === true) {
        q.puts('Welcome to Quanah.');
        q.load('developer.js');
    }

    if (q.argv.volunteer === true) {
        q.puts('Thanks for helping out!');
        q.load('volunteer.js');
    }

});

//- vim:set syntax=javascript:
