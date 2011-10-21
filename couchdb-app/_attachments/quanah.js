//- JavaScript source code

//- quanah.js ~~
//
//  This program defines Quanah in terms of Web Chassis. It depends on global
//  variables "chassis" and "RAINMAN" (the latter indirectly), but ultimately
//  I plan to hand-roll an optimized, self-contained version some day :-)
//
//                                                      ~~ (c) SRW, 19 Oct 2011

chassis(function (q, global) {
    'use strict';

 // Prerequisites

    q.lib('fs');

    if (typeof Object.prototype.Q === 'function') {
     // Avoid unnecessary work if Method Q already exists.
        return;
    }

 // Private declarations

    var countdown, isFunction, sync;

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

    isFunction = function (f) {
        return ((typeof f === 'function') && (f instanceof Function));
    };

    sync = q.fs$sync;

 // Global definitions

    Object.prototype.Q = function (func) {
        var count, f, x, y, task;
        if (isFunction(func)) {
            count = countdown(3, function () {
                task.onready = function (val, exit) {
                    val.f = f.key;
                    val.x = x.key;
                    val.y = y.key;
                    val.status = 'waiting';
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
            };
        } else {
            throw new Error('Method Q expects a function as its argument.');
        }
    };

 // Invocations

    q.puts('Welcome to Quanah.');

    if (q.argv.developer === true) {
        (function developer_startup() {
         // This is just a demonstration script, actually ...
            console.log('--- Developer mode ---');
            var x;
            x = sync({key: 'lala'});
            x.onready = function (val, exit) {
                console.log(val);
                exit.success(val);
            };
        }());
    }

    if (q.argv.volunteer === true) {
        (function volunteer_startup() {
            console.log('--- Volunteer mode ---');
        }());
    }

});

//- vim:set syntax=javascript:
