//- JavaScript source code

//- method-Q.js ~~
//
//  I bombed it back to the Pseudocode Age, but it's nearly completed anyway.
//  All jobs on Quanah are currently zombies because I haven't written the
//  "is it done yet?" part yet.
//
//                                                      ~~ (c) SRW, 08 Sep 2011

/*jslint indent: 4, maxlen: 80 */

Object.prototype.Q = (function (global) {
    "use strict";

 // Declarations

    var add_meta, add_onready, add_pusher, ajax$get, ajax$getNOW, ajax$put,
        ajax$putNOW, bookmarks, define, isFunction, uuid;

    ajax$get = QUANAH.ajax$get;
    ajax$getNOW = QUANAH.ajax$getNOW;
    ajax$put = QUANAH.ajax$put;
    ajax$putNOW = QUANAH.ajax$putNOW;
    bookmarks = QUANAH.bookmarks;
    define = QUANAH.define;
    isFunction = QUANAH.isFunction;
    uuid = QUANAH.uuid;

 // Constructors

    function QuanahFxn(f) {
        if (isFunction(f) === false) {
            throw new Error("Method Q expects a function as its argument.");
        }
        var that = this;
        that = add_meta(that, "QuanahFxn");
        that = add_onready(that);
        that = add_pusher(that, "content", (function () {
         // NOTE: This is just _begging_ for malicious code injection ...
            var front, back;
            front = '(function main() {\nreturn ';
            back  = ';\n}());'
            if (isFunction(f.toJSON)) {
                return front + f.toJSON() + back;
            } else if (isFunction(f.toSource)) {
                return front + f.toSource() + back;
            } else if (isFunction(f.toString)) {
                console.log(front + f.toString() + back);
                return front + f.toString() + back;
            } else {
                throw new Error("Method Q cannot stringify this function.");
            }
        }()));
        return that;
    }

    function QuanahTask(init) {
        var content, that;
        content = {
            argv:       init,
            main:       init,
            results:    init,
            status:     init
        };
        that = this;
        that = add_meta(that, "QuanahTask");
        that = add_onready(that);
        that = add_pusher(that, "content", content);
        return that;
    }

    function QuanahVar(x) {
        var that;
        that = this;
        that = add_meta(that, "QuanahVar");
        that = add_onready(that);
        that = add_pusher(that, "content", x);
        return that;
    }

 // Definitions

    add_meta = function (that, typename) {
        var id = uuid();
        that.meta = {
            _id:    id,
            _rev:   null,
            type:   typename,
            url:    bookmarks.db + id
        };
        return that;
    };

    add_onready = function (that) {
        var exit_generator, ready, revive, stack;
        exit_generator = function () {
            return {
                failure: function (message) {
                    console.error(message);
                },
                success: function (message) {
                    //console.log(message);
                    ready = true;
                    revive();
                }
            };
        };
        ready = true;
        revive = function () {
            var f;
            if (ready === true) {
                ready = false;
                f = stack.shift();
                if (f === undefined) {
                    ready = true;
                } else {
                    f.call(that, that.content, exit_generator());
                }
            }
        };
        stack = [];
        define(that, "onready", {
            configurable: false,
            enumerable: true,
            get: function () {
                return (stack.length > 0) ? stack[0] : null;
            },
            set: function (f) {
                if (isFunction(f) === false) {
                    throw new Error('"onready" callbacks must be functions.');
                }
                stack.push(f);
                revive();
            }
        });
        return that;
    };

    add_pusher = function (that, name, initial_value) {
        var content;
        content = initial_value;
        define(that, name, {
            configurable: false,
            enumerable: true,
            get: function () {
                return content;
            },
            set: function (x) {
                content = x;
                that.push();
            }
        });
        return that;
    };

 // Constructor prototype definitions

    QuanahFxn.prototype = new QuanahVar(null);

    QuanahTask.prototype = new QuanahVar(null);

    QuanahVar.prototype.pull = function () {
     // (placeholder)
    };

    QuanahVar.prototype.push = function () {
        var that = this;
        that.onready = function (data, exit) {
            var obj;
            obj = {
                _id:        that.meta._id,
                content:    data,
                type:       that.meta.type
            };
            if (that.meta._rev !== null) {
                obj._rev = that.meta._rev;
            }
            ajax$put(that.meta.url, JSON.stringify(obj), function (err, txt) {
                var response;
                if (err === null) {
                 // We can test for the presence of this property to see if
                 // the variable has been initialized on CouchDB yet or not.
                    response = JSON.parse(txt);
                    if (response.ok === true) {
                        that.meta._rev = response.rev;
                        exit.success('Finished "push" :-)');
                    } else {
                        exit.failure(response);
                    }
                } else {
                    exit.failure(err);
                }
            });
        };
        return that;
    };

 // Finally, we will define and return that definition for "Method Q" :-)

    return function (func) {
        var f, x, y, z;
        f = (new QuanahFxn(func)).push();
        x = (new QuanahVar(this)).push();
        y = (new QuanahVar(null)).push();
        z = (new QuanahTask(null)).push();
        z.onready = function (data_z, exit_z) {
            var counter, n;
            counter = function () {
                n += 1;
                if (n === 3) {
                    data_z.status = "waiting";
                    z.push();
                    exit_z.success(data_z);
                }
            };
            n = 0;
            f.onready = function (data, exit) {
                try {
                    z.content.main = f.meta.url;
                    exit.success('Stored the "main" property.');
                    counter();
                } catch (err) {
                    exit.failure(err);
                }
            };
            x.onready = function (data, exit) {
                try {
                    z.content.argv = x.meta.url;
                    exit.success('Stored the "argv" property.');
                    counter();
                } catch (err) {
                    exit.failure(err);
                }
            };
            y.onready = function (data, exit) {
                try {
                    z.content.results = y.meta.url;
                    exit.success('Stored the "results" property.');
                    counter();
                } catch (err) {
                    exit.failure(err);
                }
            };
        };
        return z;
    };

}(function (outer_scope) {
    "use strict";
    return (this === null) ? outer_scope : this;
}.call(null, this)));

//- vim:set syntax=javascript:
