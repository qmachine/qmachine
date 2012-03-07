//- JavaScript source code

//- quanah.js ~~
//
//  Quanah does not support module systems and instead creates a single Object
//  prototype method, 'Q', that it uses as a namespace. The general consensus
//  in the community is that modifying the native prototypes is a Bad Thing,
//  but I have found that Quanah's "Method Q" is actually a beautiful solution
//  for a number of JavaScript's problems with code reuse. It packages methods
//  and properties into a single, globally available object that runs correctly
//  in "modern" JavaScript, and users can test for its existence without any
//  special knowledge about a particular module system's quirks. In the end,
//  the decision to use "Method Q" as a native prototype method is definitely
//  motivated by the syntactic sugar it enables, but the only alternative would
//  be to create a single global variable anyway, and I'd get just as many
//  flames over that strategy ;-)
//
//  To-do list:
//
//  -   enable 'when(x).isready = f' for avars f
//  -   remove type-checks in user-unreachable functions where appropriate
//  -   replace 'throw' statements with 'fail' statements for robustness
//  -   rewrite 'onready' assignments as 'comm' invocations (optional)
//  -   rewrite 'remote_call' in terms of a single avar to be like 'volunteer'
//
//  Open questions:
//
//  -   Can Quanah return a remotely distributed memoized function?
//  -   Could Quanah actually support ActionScript?
//  -   Can users' own JSLINT pragmas circumvent the 'isClosed' function?
//  -   Is Quanah a kernel?
//      -   If so, is it "re-entrant"? See http://goo.gl/985r.
//
//                                                      ~~ (c) SRW, 05 Mar 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, unparam: true */
    /*global JSLINT: false */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q')) {
     // Exit early because the framework is either already present or else
     // would overwrite existing extensions to the Object prototype object.
     // This may throw an error in the future to help remind other people
     // not to squat on this particular "namespace" ;-)
        return;
    }

 // Declarations

    var atob, AVar, avar, btoa, comm, defineProperty, deserialize,
        dmap, dply, dreduce, init, isArrayLike, isClosed, isFunction,
        local_call, ply, puts, remote_call, revive, secret, serialize,
        stack, sys, update_local, update_remote, uuid, volunteer, when;

 // Definitions

    atob = function (input) {
     // This function redefines itself during its first invocation.
        if (isFunction(global.atob)) {
            atob = global.atob;
        } else {
            atob = function (input) {
             // This function decodes a string which has been encoded using
             // base64 encoding. It isn't part of JavaScript or any standard,
             // but it is a DOM Level 0 method, and it is extremely useful to
             // have around ;-)
                /*jslint bitwise: true */
                if ((/^[A-z0-9\+\/\=]*$/).test(input) === false) {
                    throw new Error('Invalid base64 characters: ' + input);
                }
                var a, output, ch1, ch2, ch3, en1, en2, en3, en4, i, n;
                n = input.length;
                output = '';
                if (n > 0) {
                    a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                        'abcdefghijklmnopqrstuvwxyz' +
                        '0123456789+/=';
                 // NOTE: This 'for' loop may actually require sequentiality
                 // as currently written. I converted it from a "do-while"
                 // implementation, but I will write it as a "map" soon :-)
                    for (i = 0; i < n; i += 4) {
                        en1 = a.indexOf(input[i]);
                        en2 = a.indexOf(input[i + 1]);
                        en3 = a.indexOf(input[i + 2]);
                        en4 = a.indexOf(input[i + 3]);
                        ch1 = ((en1 << 2) | (en2 >> 4));
                        ch2 = (((en2 & 15) << 4) | (en3 >> 2));
                        ch3 = (((en3 & 3) << 6) | en4);
                        output += String.fromCharCode(ch1);
                        if (en3 !== 64) {
                            output += String.fromCharCode(ch2);
                        }
                        if (en4 !== 64) {
                            output += String.fromCharCode(ch3);
                        }
                    }
                }
                return output;
            };
        }
        return atob(input);
    };

    AVar = function AVar(obj) {
     // This function is a constructor for the fundamental building block of
     // Quanah itself -- the AVar "type". An avar has its own mutable 'key' and
     // 'val' properties as well as an immutable 'comm' method for simple
     // message-passing. The idea behind avars is to distill concepts like
     // "futures" and "lazy evaluation" into a simple API that encourages the
     // programmer to specify a sequence of transformations to be applied in
     // order to data. For each avar, such a sequence is stored as a first-in,
     // first-out (FIFO) queue and executed according to messages the avar
     // receives through its 'comm' method.
        var state, that;
        state = {
            epitaph:    null,
            onerror:    null,
            queue:      [],
            ready:      true
        };
        that = this;
        defineProperty(that, 'comm', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function (obj) {
             // This function is a "hidden" instance method that forwards the
             // messages it receives to 'comm' along with the internal 'state'
             // of the avar that received the message. We "hide" this method
             // by making it non-enumerable so that avars can be serialized,
             // and unfortunately this means that old JavaScript engines that
             // lack support for ECMAScript 5 metaprogramming cannot execute
             // code remotely.
                comm.call(this, state, obj);
                return;
            }
        });
        if ((obj !== null) && (obj !== undefined)) {
            that.key = (obj.hasOwnProperty('key')) ? obj.key : uuid();
            that.val = (obj.hasOwnProperty('val')) ? obj.val : null;
        } else {
            that.key = uuid();
            that.val = null;
        }
        return that;
    };

    avar = function (obj) {
     // This function enables the user to avoid the 'new' keyword, which is
     // useful because OOP in JS is not typically well-understood by users.
        return new AVar(obj);
    };

    btoa = function () {
     // This function redefines itself during its first invocation.
        if (isFunction(global.btoa)) {
            btoa = global.btoa;
        } else {
            btoa = function (input) {
             // This function encodes binary data into a base64 string. It
             // isn't part of JavaScript or any standard, but it _is_ a DOM
             // Level 0 method, and it is extremely useful to have around.
             // Unfortunately, it throws an error in most browsers if you feed
             // it Unicode --> http://goo.gl/3fLFs.
                /*jslint bitwise: true */
                var a, output, ch1, ch2, ch3, en1, en2, en3, en4, i, n;
                n = input.length;
                output = '';
                if (n > 0) {
                    a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                        'abcdefghijklmnopqrstuvwxyz' +
                        '0123456789+/=';
                 // NOTE: This 'for' loop may actually require sequentiality
                 // as currently written. I converted it from a "do-while"
                 // implementation, but I will write it as a "map" soon :-)
                    for (i = 0; i < input.length; i += 3) {
                        ch1 = input.charCodeAt(i);
                        ch2 = input.charCodeAt(i + 1);
                        ch3 = input.charCodeAt(i + 2);
                        en1 = (ch1 >> 2);
                        en2 = (((ch1 & 3) << 4) | (ch2 >> 4));
                        en3 = (((ch2 & 15) << 2) | (ch3 >> 6));
                        en4 = (ch3 & 63);
                        if (isNaN(ch2)) {
                            en3 = en4 = 64;
                        } else if (isNaN(ch3)) {
                            en4 = 64;
                        }
                        output += (a[en1] + a[en2] + a[en3] + a[en4]);
                    }
                }
                return output;
            };
        }
        return btoa.apply(this, arguments);
    };

    comm = function (inside, outside) {
     // This function provides a simple messaging system for avars that uses
     // mutual closure over the 'secret' variable to restrict access to each
     // avar's private state. This function could easily use a test such as
     //
     //     if ((outside instanceof Object) === false) {
     //         this.comm({fail: ..., secret: secret});
     //         return;
     //     }
     //
     // but I have chosen not to use one because 'ply' will handle any input
     // anyway, and unless certain flags are present, only 'revive' runs. 
        var args, message, special, x;
        special = false;
        x = this;
        ply(outside).by(function (key, val) {
         // This function has a "forEach" pattern ==> 'ply' is justified.
            if ((key === 'secret') && (val === secret)) {
                special = true;
            } else {
                message = key;
                args = [].concat(val);
            }
            return;
        });
        if (special === true) {
            switch (message) {
            case 'done':
             // A computation involving this avar has succeeded, and we will
             // now prepare to run the next computation that depends on it by
             // transferring it into the 'revive' queue.
                inside.ready = true;
                if (inside.queue.length > 0) {
                    inside.ready = false;
                    stack.unshift({
                        f: inside.queue.shift(),
                        x: x
                    });
                }
                break;
            case 'fail':
             // A computation involving this avar has failed, and we will now
             // suspend all computations that depend on it indefinitely by
             // overwriting the queue with a fresh one. This is also important
             // because the garbage collector can't free the memory unless we
             // release these references. We will also try to call 'onerror'
             // if one has been defined.
                if (inside.epitaph === null) {
                 // We don't want to overwrite the original error by accident,
                 // since that would be an utter nightmare for debugging.
                    inside.epitaph = args;
                }
                inside.queue = [];
                inside.ready = false;
                if (isFunction(inside.onerror)) {
                    inside.onerror.apply(x, inside.epitaph);
                }
                break;
            case 'get_onerror':
             // A computation requests to inspect the 'onerror' handler's
             // current value, but rather than return it as the result of the
             // 'comm' invocation itself, we will pass it by reference.
                args[0].onerror = inside.onerror;
                break;
            case 'get_onready':
             // A computation requests to inspect the 'onready' handler's
             // current value, but rather than return it as the result of the
             // 'comm' invocation itself, we will pass it by reference.
                args[0].onready = inside.queue[0];
                break;
            case 'set_onerror':
             // A computation has defined an 'onerror' handler for this avar,
             // but we need to make sure that it hasn't already failed in some
             // previous computation. If the avar has already failed, we will
             // store the handler and also fire it immediately.
                inside.onerror = args[0];
                if (inside.epitaph !== null) {
                    x.comm({fail: inside.epitaph, secret: secret});
                }
                break;
            case 'set_onready':
             // A computation has defined an 'onready' handler for this avar,
             // and to avoid overwriting the current handler, we will push it
             // onto the avar's individual queue and re-trigger execution.
                if (isFunction(args[0])) {
                    inside.queue.push(args[0]);
                    if (inside.ready === true) {
                        x.comm({done: [], secret: secret});
                    }
                } else if (args[0] instanceof AVar) {
                    when(args[0], x).areready = function (evt) {
                     // This function needs documentation.
                        var f, x;
                        f = this.val[0].val;
                        x = this.val[1];
                        f.call(x, evt);
                        return;
                    };
                } else {
                    x.comm({
                        fail: 'Assigned value must be a function',
                        secret: secret
                    });
                }
                break;
            case 'stay':
             // A computation that depends on this avar has been postponed,
             // and we will set its 'ready' property to 'true' so we can try
             // again during the next trip through 'revive'. Note that we will
             // not touch the avar's individual queue.
                inside.ready = true;
                break;
            default:
             // When this arm is chosen, an error must exist in Quanah itself.
             // In such a case, we may try to rely on user-submitted reports,
             // but right now we just hope we can capture the error ...
                x.comm({
                    fail: 'Invalid "comm" message "' + message + '"',
                    secret: secret
                });
            }
        }
     // NOTE: Is it a good idea to invoke 'revive' every time? It does shorten
     // my code a little, of course, but the rationale here is that it helps
     // prevent a situation in which the progression through a non-empty queue
     // halts because no events remain to trigger execution. Another advantage
     // is that I can externally trigger a 'revive' by invoking 'x.comm()'.
        revive();
        return;
    };

    defineProperty = function (obj, name, params) {
     // This function wraps the ES5 'Object.defineProperty' function so that
     // it degrades gracefully in crusty old browsers. I would like to improve
     // my implementation eventually so that the fallback definition will more
     // closely simulate the ES5 specification, but for now, this works well.
     // For more information, see the documentation at http://goo.gl/xXHKr.
        if (Object.hasOwnProperty('defineProperty')) {
            defineProperty = Object.defineProperty;
        } else if (Object.prototype.hasOwnProperty('__defineGetter__')) {
            defineProperty = function (obj, name, params) {
             // This function is a pseudo-implementation of the new ES5
             // 'Object.defineProperty' function (see http://goo.gl/xXHKr).
                ply(params).by(function (key, val) {
                 // This function is a "forEach" ==> 'ply' is justified.
                    /*jslint nomen: true */
                    switch (key) {
                    case 'get':
                        obj.__defineGetter__(name, val);
                        break;
                    case 'set':
                        obj.__defineSetter__(name, val);
                        break;
                    case 'value':
                     // NOTE: This would fail if the property's "configurable"
                     // attribute were set to 'false', but if such an error
                     // could occur, that JavaScript implementation would have
                     // had a native 'Object.defineProperty' anyway :-P
                        delete obj[name];
                        obj[name] = params[key];
                        break;
                    default:
                     // This arm matches ES5 property attributes ...
                    }
                    return;
                });
                return obj;
            };
        } else {
         // Why should I require platform support for getters and setters?
         // Some compelling arguments can be found here: http://goo.gl/e9rhh.
         // In the future, I may rewrite Quanah without getters and setters
         // to increase performance, but for now, it's probably a better idea
         // for you just to update your platform -- especially if you want to
         // use Quanah to distribute your computations for you. Because each
         // avar has a 'comm' method that must be "hidden" (non-enumerable) or
         // else the avar cannot be serialized, your programs will always be
         // run serially unless you use a reasonably modern platform!
            throw new Error('platform lacks support for getters and setters.');
        }
        return defineProperty(obj, name, params);
    };

    deserialize = function ($x) {
     // This function is a JSON-based deserialization utility that can invert
     // the 'serialize' function provided herein. Unfortunately, no 'fromJSON'
     // equivalent exists for obvious reasons -- it would have to be a String
     // prototype method, and it would have to be extensible for all types.
     // NOTE: This definition could stand to be optimized, but I recommend
     // leaving it as-is until improving performance is absolutely critical.
        return JSON.parse($x, function (key, val) {
         // This function is provided to 'JSON.parse' as the optional second
         // parameter that its documentation refers to as a 'revive' function.
         // NOTE: This is not the same kind of function as Quanah's 'revive'!
            var f, pattern;
            pattern = /^\[FUNCTION ([A-z0-9\+\/\=]+) ([A-z0-9\+\/\=]+)\]$/;
            if ((typeof val === 'string') || (val instanceof String)) {
                if (pattern.test(val)) {
                    val.replace(pattern, function ($0, code, props) {
                     // This function is provided to the String prototype's
                     // 'replace' method and uses references to the enclosing
                     // scope to return results. I wrote things this way in
                     // order to avoid changing the type of 'val' and thereby
                     // confusing the JIT compilers, but I'm not certain that
                     // using nested closures is any faster anyway. For that
                     // matter, calling the regular expression twice may be
                     // slower than calling it once and processing its output
                     // conditionally, and that way might be clearer, too ...
                        /*jslint evil: true */
                        var obj = deserialize(atob(props));
                        f = ((new Function('return ' + atob(code)))());
                        ply(obj).by(function (key, val) {
                         // This function copies methods and properties from
                         // the "object-only" representation of a function back
                         // onto the newly created function 'f'. Because order
                         // isn't important, the use of 'ply' is justified.
                            f[key] = val;
                            return;
                        });
                        return;
                    });
                }
            }
            return (f !== undefined) ? f : val;
        });
    };

    dmap = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            var x, y;
            x = (this.hasOwnProperty('isready')) ? this.val[0] : this;
            y = avar({val: x.val});
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = dply(function (key, val) {
             // This function needs documentation.
                y.val[key] = {f: f, x: val};
                return;
            });
            y.onready = dply(function (key, val) {
             // This function needs documentation.
                val.y = val.f(val.x);
                return;
            });
            y.onready = dply(function (key, val) {
             // This function needs documentation.
                x.val[key] = val.y;
                return;
            });
            y.onready = function (y_evt) {
             // This function needs documentation.
                y_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    dply = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            var elements, g, key, n, x;
            g = function (f, key, val) {
             // This function needs documentation.
                var temp = avar({val: {f: f, key: key, val: val}});
                temp.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                temp.onready = function (evt) {
                 // This function needs documentation.
                    this.val.f(this.val.key, this.val.val);
                    return evt.exit();
                };
                return temp;
            };
            elements = [];
            x = (this.hasOwnProperty('isready')) ? this.val[0].val : this.val;
            if (isArrayLike(x)) {
                n = x.length;
                for (key = 0; key < n; key += 1) {
                    elements.push(g(f, key, x[key]));
                }
            } else if (x instanceof Object) {
                for (key in x) {
                    if (x.hasOwnProperty(key)) {
                        elements.push(g(f, key, x[key]));
                    }
                }
            } else {
                return evt.fail('Cannot "ply" this value (' + x + ')');
            }
            when.apply(this, elements).onready = function (when_evt) {
             // This function needs documentation.
                when_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    dreduce = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            var x, y;
            x = (this.hasOwnProperty('isready')) ? this.val[0] : this;
            y = avar({val: x.val});
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = function (evt) {
             // This function needs documentation.
                var flag, key, n, pairs, x;
                flag = true;
                pairs = [];
                x = y.val;
                if (isArrayLike(x)) {
                    n = x.length;
                    if ((n % 2) === 1) {
                        pairs.push(x[0]);
                        for (key = 1; key < n; key += 2) {
                            pairs.push([x[key], x[key + 1]]);
                        }
                    } else {
                        for (key = 0; key < n; key += 2) {
                            pairs.push([x[key], x[key + 1]]);
                        }
                    }
                } else if (x instanceof Object) {
                    for (key in x) {
                        if (x.hasOwnProperty(key)) {
                            if (flag) {
                                pairs.push([x[key]]);
                            } else {
                                (pairs[pairs.length - 1]).push(x[key]);
                            }
                            flag = (!flag);
                        }
                    }
                } else {
                    pairs.push([x]);
                }
                y.val = pairs;
                return evt.exit();
            };
            y.onready = dmap(function (each) {
             // This function needs documentation.
                return (each instanceof Array) ? {f: f, x: each} : each;
            });
            y.onready = dmap(function (each) {
             // This function needs documentation.
                var flag;
                flag = ((each !== null) &&
                        (each !== undefined) &&
                        (each.hasOwnProperty('f')) &&
                        (each.hasOwnProperty('x')));
                return (flag) ? each.f(each.x[0], each.x[1]) : each;
            });
            y.onready = function (y_evt) {
             // This function needs documentation.
                if (y.val.length > 1) {
                    x.val = y.val;
                    y_evt.exit();
                    return evt.stay('Re-reducing ...');
                }
                x.val = y.val[0];
                y_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    init = function (obj) {
     // This function enables the user to redefine "internal" functions from
     // outside the giant anonymous closure. In particular, this allows users
     // to port Quanah for use with any persistent storage system by simply
     // implementing specific routines and providing them to Quanah by way of
     // this 'init' function.
        ply(obj).by(function (key, val) {
         // This function traverses the input object in search of definitions,
         // but it will only store a definition as a method of the internal
         // 'sys' object once per key. If an external definition has already
         // been assigned internally, it cannot be redefined. The policy here
         // is for simplicity, but it does add a small measure of security.
         // Because order isn't important here, the use of 'ply' is justified.
            if ((sys[key] === null) && (isFunction(val))) {
                sys[key] = val;
            }
            return;
        });
        revive();
        return;
    };

    isArrayLike = function (x) {
     // This function is useful for identifying an "Array-Like Object", which
     // is an object whose 'length' property represents its maximum numerical
     // property key. Such objects may use Array methods generically, and for
     // iteration this can be especially useful. The two surprises here are
     // functions and strings. A function has a 'length' property representing
     // its arity (number of input arguments), unfortunately, so it cannot be
     // considered an Array-Like Object. A string is actually a primitive, not
     // an object, but it can still be used as an Array-Like Object :-)
        return ((x !== null) &&
                (x !== undefined) &&
                (typeof x !== 'function') &&
                (x.hasOwnProperty('length')));
    };

    isClosed = function (x) {
     // This function tests an input argument 'x' for references that "close"
     // over external references from another scope. This function solves a
     // very important problem in JavaScript because function serialization is
     // extremely difficult to perform rigorously. Most programmers consider a
     // function only as its source code representation, but because it is also
     // a closure and JavaScript has lexical scope, the exact "place" in the
     // code where the code existed is important, too. A third consideration is
     // that a function is also an object which can have methods and properties
     // of its own, and these need to be included in the serializated form. I
     // puzzled over this problem and eventually concluded that because I may
     // not be able to serialize an entire scope (I haven't solve that yet), I
     // _can_ get the source code representation of a function from within most
     // JavaScript implementations even though it isn't part of the ECMAScript
     // standard (June 2011). Thus, if a static analysis tool were able to
     // parse the source code representation to confirm that the function did
     // not depend on its scope, then I might be able to serialize it, provided
     // that it did not contain any methods that depended on their scopes. Of
     // course, writing such a tool is a huge undertaking, so instead I just
     // used a fantastic program by Douglas Crockford, JSLINT, which contains
     // an expertly-written parser with configurable parameters. A bonus here
     // is that JSLINT allows me to avoid a number of other unsavory problems,
     // such as functions that log messages to a console -- such functions may
     // or may not be serializable, but their executions should definitely
     // occur on the same machines that invoked them! Anyway, this function is
     // only one solution to the serialization problem, and I welcome feedback
     // from others who may have battled the same problems :-)
        var $f, flag, left, right;
        flag = false;
        left = '(function () {\nreturn ';
        right = ';\n}());';
        if (x instanceof Object) {
            if (isFunction(x)) {
                if (isFunction(x.toJSON)) {
                    $f = x.toJSON();
                } else if (isFunction(x.toSource)) {
                    $f = x.toSource();
                } else if (isFunction(x.toString)) {
                    $f = x.toString();
                } else {
                 // If we fall this far, we're probably in trouble anyway, but
                 // we aren't out of options yet. We could try to coerce to a
                 // string by adding an empty string or calling the String
                 // constructor without the 'new' keyword, but I'm not sure if
                 // either would cause Quanah itself to fail JSLINT. Of course,
                 // we can always just play it safe and return 'true' early to
                 // induce local execution of the function -- let's do that!
                    return true;
                }
             // By this point, '$f' must be defined, and it must be a string
             // or else the next line will fail when we try to remove leading
             // and trailing parentheses in order to appease JSLINT.
                $f = left + $f.replace(/^[(]|[)]$/g, '') + right;
             // Now, we send our function's serialized form '$f' into JSLINT
             // for analysis, taking care to disable all options that are not
             // directly relevant to determining if the function is suitable
             // for running in some remote JavaScript environment. If JSLINT
             // returns 'false' because the scan fails for some reason, the
             // answer to our question would be 'true', which is why we have
             // to negate JSLINT's output.
                flag = (false === JSLINT($f, {
                 // JSLINT configuration options, as of version 2012-02-03:
                    anon:       true,   //- ???
                    bitwise:    true,   //- bitwise operators are allowed?
                    browser:    false,  //- assume a browser as JS environment?
                    cap:        true,   //- uppercase HTML is allowed?
                    //confusion:  true,   //- types can be used inconsistently?
                    'continue': true,   //- allow continuation statement?
                    css:        true,   //- allow CSS workarounds?
                    debug:      false,  //- allow debugger statements?
                    devel:      false,  //- allow output logging?
                    eqeq:       true,   //- allow '==' (instead of '===')?
                    es5:        true,   //- allow ES5 syntax?
                    evil:       false,  //- allow the 'eval' statement?
                    forin:      true,   //- allow unfiltered 'for .. in'?
                    fragment:   true,   //- allow HTML fragments?
                    //indent:     4,
                    //maxlen:     80,
                    //maxerr:     1,
                    newcap:     true,   //- constructors must be capitalized?
                    node:       false,  //- assume Node.js as JS environment?
                    nomen:      true,   //- allow names' dangling underscores?
                    on:         false,  //- allow HTML event handlers
                    passfail:   true,   //- halt the scan on the first error?
                    plusplus:   true,   //- allow '++' and '--' usage?
                    properties: false,  //- require JSLINT /*properties */?
                    regexp:     true,   //- allow '.' in regexp literals?
                    rhino:      false,  //- assume Rhino as JS environment?
                    undef:      false,  //- allow out-of-order definitions?
                    unparam:    true,   //- allow unused parameters?
                    sloppy:     true,   //- ES5 strict mode pragma is optional?
                    sub:        true,   //- allow all forms of subset notation?
                    vars:       true,   //- allow multiple 'var' statements?
                    white:      true,   //- allow sloppy whitespace?
                    widget:     false,  //- assume Yahoo widget JS environment?
                    windows:    false   //- assume Windows OS?
                }));
            }
            ply(x).by(function (key, val) {
             // This function examines all methods and properties of 'x'
             // recursively to make sure none of those are closed, either.
             // Because order isn't important, use of 'ply' is justified.
                if (flag === false) {
                    flag = isClosed(val);
                }
                return;
            });
        }
        return flag;
    };

    isFunction = function (f) {
     // This function returns 'true' only if and only if the input argument
     // 'f' is a function. The second condition is necessary to avoid a false
     // positive when 'f' is a regular expression. Please note that an avar
     // whose 'val' property is a function will still return 'false'.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    local_call = function (obj) {
     // This function applies the transformation 'f' to 'x' for method 'f' and
     // property 'x' of the input object 'obj' by calling 'f' with 'evt' as an
     // input argument and 'x' as the 'this' value. The advantage of performing
     // transformations this way versus computing 'f(x)' directly is that it
     // allows the user to indicate the program's logic explicitly even when
     // the program's control is difficult or impossible to predict, as is
     // commonly the case in JavaScript when working with callback functions.
        var evt;
        try {
            evt = {
             // This is the 'evt' object, an object literal with methods that
             // send messages to 'obj.x' for execution control. Methods can
             // be replaced by the user from within the calling function 'f'
             // without affecting the execution of computations :-)
                exit: function (message) {
                 // This function indicates successful completion.
                    obj.x.comm({done: message, secret: secret});
                    return;
                },
                fail: function (message) {
                 // This function indicates a failure, and it is intended to
                 // replace the 'throw new Error(...)' idiom, primarily because
                 // capturing errors that are thrown during remote execution
                 // are very difficult to capture and return to the invoking
                 // contexts otherwise. Although 'local_call' is named "local"
                 // to indicate that the invocation and execution occur on the
                 // same machine, the 'volunteer' function actually imports
                 // tasks from other machines before invoking and executing
                 // them; therefore, the "original invocation" may have come
                 // from a "remote" machine, with respect to execution. Thus,
                 // Quanah encourages users to replace 'throw' with 'fail' in
                 // their programs to solve the remote error capture problem.
                    obj.x.comm({fail: message, secret: secret});
                    return;
                },
                stay: function (message) {
                 // This function allows a user to postpone execution, and it
                 // is particularly useful for delaying execution until some
                 // condition is met -- it can be used to write non-blocking
                 // 'while' and 'until' constructs, for example. Since the
                 // ECMAScript standard lacks anything resembling a package
                 // manager, the 'stay' method also comes in handy for delaying
                 // execution until an external library has loaded. Of course,
                 // if you delay the execution, when will it run again? The
                 // short answer is unsatisfying: you can never _know_. For a
                 // longer answer, you'll have to wait for my upcoming papers
                 // that explain why leaving execution guarantees to chance is
                 // perfectly acceptable when the probability approachs 1 :-)
                    obj.x.comm({stay: message, secret: secret});
                    stack.push(obj);
                    return;
                }
            };
         // After all the setup, the actual invocation is anticlimactic ;-)
            obj.f.call(obj.x, evt);
        } catch (err) {
         // In early versions of Quanah, 'stay' threw a special Error type as
         // a crude form of message passing, but because it no longer throws
         // errors, we can assume that all caught errors are failures. Because
         // the user may have chosen to replace the 'evt.fail' method with a
         // personal routine, I have deliberately reused that reference here,
         // to honor the user's wishes.
            evt.fail(err);
        }
        return;
    };

    ply = function (x) {
     // This function is a general-purpose iterator for key-value pairs, and
     // it works exceptionally well in JavaScript because hash-like objects
     // are so common in this language. This definition itself is an optimized
     // version that depends on assumptions about how it is used within the
     // giant anonymous closure to which it belongs. If performance becomes a
     // strong enough motivation, I will probably end up inlining the loops
     // anyway, but if you enjoy functional patterns as I do, take a look at
     // my "generic.js" for a more careful treatment of "basic" iteration :-)
        return {
            by: function (f) {
             // NOTE: I probably can't optimize this function for use only on
             // arrays and objects because 'serialize' uses it on functions.
                if (isFunction(f) === false) {
                    throw new TypeError('"ply..by" expects a function');
                }
                var key, n;
                if (isArrayLike(x)) {
                 // This arm takes advantage of the fact that indexed 'for'
                 // loops are substantially faster than 'for in' loops.
                    n = x.length;
                    for (key = 0; key < n; key += 1) {
                        f(key, x[key]);
                    }
                } else if (x instanceof Object) {
                    for (key in x) {
                        if (x.hasOwnProperty(key)) {
                            f(key, x[key]);
                        }
                    }
                } else {
                 // I've never really liked this as a fallback definition, but
                 // it still helps to have it here, just in case.
                    f(undefined, x);
                }
                return;
            }
        };
    };

    puts = function () {
     // This function is just a placeholder for testing purposes. It can be
     // useful for logging to a console, but to justify its inclusion here, I
     // have also used it in 'volunteer' to induce local execution :-)
        return;
    };

    remote_call = function (obj) {
     // This function distributes computations to remote execution nodes by
     // constructing a task that represents the computation, writing it to a
     // shared storage, polling for changes to its status, and then reading
     // the new values back into the local variables. My strategy is to use
     // a bunch of temporary avars that only execute locally -- on this part
     // I must be very careful, because remote calls should be able to make
     // remote calls of their own, but execution of a remote call should not
     // require remote calls of its own! A publication is forthcoming, and at
     // that point I'll simply use a self-citation as an explanation :-)
        var f, first, x;
     // Step 1: copy the computation's function and data into fresh instances,
     // define some error handlers, and write the copies to the "filesystem".
        f = avar({val: obj.f});
        first = true;
        x = avar({key: obj.x.key, val: obj.x.val});
        f.onerror = x.onerror = function (message) {
         // This function tells the original 'x' that something has gone awry.
            if (first === true) {
                first = false;
                obj.x.comm({fail: message, secret: secret});
            }
            return;
        };
        f.onready = x.onready = update_remote;
     // Step 2: Use a 'when' statement to represent the remote computation and
     // track its execution status on whatever system is using Quanah.
        when(f, x).areready = function (evt) {
         // This function creates a 'task' object to represent the computation
         // and monitors its status by "polling" the "filesystem" for changes.
            var task;
            task = avar({
                val: {
                    f:      f.key,
                    x:      x.key,
                    status: 'waiting'
                }
            });
            task.onerror = function (message) {
             // This function alerts 'f' and 'x' that something has gone awry.
                return evt.fail(message);
            };
            task.onready = update_remote;
            task.onready = function (evt) {
             // This function polls for changes in the 'status' property using
             // a variation on the 'update_local' function as a non-blocking
             // 'while' loop -- hooray for disposable avars!
                var temp = sys.read(task.key);
                temp.onerror = function (message) {
                 // This alerts 'task' that something has gone awry.
                    return evt.fail(message);
                };
                temp.onready = function (temp_evt) {
                 // This function analyzes the results of the 'read' operation
                 // to determine if the 'task' computation is ready to proceed.
                    var val = deserialize(temp.val).val;
                    switch (val.status) {
                    case 'done':
                        task.val = val;
                        evt.exit();
                        break;
                    case 'failed':
                        evt.fail(val.epitaph);
                        break;
                    default:
                        evt.stay('Waiting for results ...');
                    }
                    return temp_evt.exit();
                };
                return;
            };
            task.onready = function (task_evt) {
             // This function ends the enclosing 'when' statement.
                task_evt.exit();
                return evt.exit();
            };
            return;
        };
     // Step 3: Update the local instances of 'f' and 'x' by retrieving the
     // remote versions' representations. If possible, these operations will
     // run concurrently.
        f.onready = x.onready = update_local;
     // Step 4: Use a 'when' statement to wait for the updates in Step 3 to
     // finish before copying the new values into the original 'obj' argument.
        when(f, x).areready = function (evt) {
         // This function copies the new values into the old object. Please
         // note that we cannot simply write 'obj.foo = foo' because we would
         // lose the original avar's internal state!
            obj.f = f.val;
            obj.x.val = x.val;
            obj.x.comm({done: [], secret: secret});
            return evt.exit();
        };
        return;
    };

    revive = function () {
     // This function contains the execution center for Quanah. It's pretty
     // simple, really -- it just runs the first available task in its queue
     // ('stack'), and it selects an execution context conditionally. That's
     // all it does. It makes no attempt to run every task in the queue every
     // time it is called, because instead Quanah uses a strategy in which it
     // tries to call 'revive' as many times as necessary to process an entire
     // program correctly. For example, every time an avar receives a 'comm'
     // message, 'revive' will run. Because 'revive' only runs a single task
     // from the queue for each invocation, its queue can be shared safely
     // across multiple execution "contexts" simultaneously, and it makes no
     // difference if the separate contexts are due to recursion or to special
     // objects such as Web Workers. The 'revive' function selects a context
     // for execution using conditional tests that determine whether a given
     // computation can be distributed to external resources for execution, but
     // it can always fall back to executing on the invoking machine :-)
        var task = stack.shift();
        if (task !== undefined) {
            if (typeof JSON === 'undefined') {
             // We can't serialize the computation anyway.
                local_call(task);
            } else if (typeof JSLINT === 'undefined') {
             // We can't decide if the computation can be serialized.
                local_call(task);
            } else if ((sys.read === null) || (sys.write === null)) {
             // We can't distribute the computation.
                local_call(task);
            } else if (isClosed(task)) {
             // The task isn't serializable.
                local_call(task);
            } else {
             // The task is serializable, and we are able to distribute it :-)
                remote_call(task);
            }
        }
        return;
    };

    secret = Math.random();

    serialize = function (x) {
     // This is a JSON-based serializer that not only understands functions,
     // but also understands that functions are objects with properties! It
     // depends on 'btoa', which unfortunately has issues with UTF-8 strings.
     // I haven't found a test case yet that proves I need to work around the
     // problem, but if I do, I will follow the post at http://goo.gl/cciXV.
        return JSON.stringify(x, function replacer(key, val) {
            var obj, $val;
            obj = {};
            if (isFunction(val)) {
             // If the input argument 'x' was actually a function, we have to
             // perform two steps to serialize the function because functions
             // are objects in JavaScript. The first step is to consider the
             // function as only its "action", represented as the source code
             // of the original function. The second step is to consider the
             // function as only an object with its own methods and properties
             // that must be preserved as source code also. (We can assume that
             // scope need not be preserved because 'serialize' is only called
             // when 'isClosed' returns 'false'.)
                $val = '[FUNCTION ';
                if (isFunction(val.toJSON)) {
                    $val += btoa(val.toJSON());
                } else if (isFunction(val.toSource)) {
                    $val += btoa(val.toSource());
                } else if (isFunction(val.toString)) {
                    $val += btoa(val.toString());
                } else {
                 // Here, we just hope for the best. This arm shouldn't ever
                 // run, actually, since we've likely already caught problems
                 // that would land here in the 'isClosed' function.
                    $val += btoa(val);
                }
                ply(val).by(function f(key, val) {
                 // This function copies methods and properties from the
                 // function stored in 'val' onto an object 'obj' so they can
                 // be serialized separately from the function itself, but it
                 // only transfers the ones a function wouldn't normally have.
                 // As comparison, we reuse this function itself for reference.
                 // Because order isn't important, use of 'ply' is justified.
                    if (f.hasOwnProperty(key) === false) {
                        obj[key] = val;
                    }
                    return;
                });
             // Now, we use recursion to serialize the methods and properties.
                $val += (' ' + btoa(serialize(obj)) + ']');
            }
            return ($val === undefined) ? val : $val;
        });
    };

    stack = [];

    sys = {
     // This object contains stubs for methods and properties that can be
     // defined externally using the 'Q.init' method. For more information,
     // read the comments in the 'init' function's definition.
        queue:  null,
        read:   null,
        write:  null
    };

    update_local = function (evt) {
     // This function is used in the 'remote_call' and 'volunteer' functions
     // to update the local copy of an avar so that its 'val' property matches
     // the one from its remote representation. It is written as a function of
     // 'evt' because it is intended to be assigned to 'onready'.
        if (sys.read === null) {
            return evt.stay('Waiting for a "read" definition ...');
        }
        var local, temp;
        local = this;
        temp = sys.read(local.key);
        temp.onerror = function (message) {
         // This function tells 'local' that something has gone awry.
            return evt.fail(message);
        };
        temp.onready = function (temp_evt) {
         // Here, we copy the remote representation into the local one.
            local.val = deserialize(temp.val).val;
            temp_evt.exit();
            return evt.exit();
        };
        return;
    };

    update_remote = function (evt) {
     // This function is used in the 'remote_call' and 'volunteer' functions
     // to update the remote copy of an avar so that its 'val' property matches
     // the one from its local representation. It is written as a function of
     // 'evt' because it is intended to be assigned to 'onready'.
        if (sys.write === null) {
            return evt.stay('Waiting for a "write" definition ...');
        }
        var temp = sys.write(this.key, serialize(this));
        temp.onerror = function (message) {
         // This tells the local avar ('this') that something has gone awry.
            return evt.fail(message);
        };
        temp.onready = function (temp_evt) {
         // This function just releases execution for the "outer" avar.
            temp_evt.exit();
            return evt.exit();
        };
        return;
    };

    uuid = function () {
     // This function generates random hexadecimal UUIDs of length 32.
        var y = Math.random().toString(16);
        if (y.length === 1) {
         // This arm shouldn't ever be used in JavaScript, but the Tamarin
         // environment has some weird quirks that derive from ActionScript.
         // I'll remove this when I confirm that Quanah cannot support AS.
            y = '';
            while (y.length < 32) {
                y += (Math.random() * 1e16).toString(16);
            }
            y = y.slice(0, 32);
        } else {
         // Every JavaScript implementation I have tried chooses this arm.
            y = y.slice(2, 32);
            while (y.length < 32) {
                y += Math.random().toString(16).slice(2, 34 - y.length);
            }
        }
        return y;
    };

    volunteer = function () {
     // This function, combined with 'remote_call', provides the remote code
     // execution mechanism in Quanah. When 'remote_call' on one machine sends
     // a serialized task to another machine, that other machine runs it with
     // the 'volunteer' function. This function outputs the avar representing
     // the task so that the underlying system (not Quanah) can control system
     // resources itself. Examples will be included in the distribution that
     // will accompany the upcoming publication(s).
        var task = avar();
        task.onready = function (evt) {
         // This function retrieves the key of a task from the queue so we
         // can retrieve that task's full description. If no tasks are found,
         // we will simply check back later :-)
            if (sys.queue === null) {
                return evt.fail('Waiting for a "queue" definition ...');
            }
            var temp = sys.queue();
            temp.onerror = function (message) {
             // This function notifies 'task' that something has gone wrong
             // during retrieval and interpretation of its description.
                return evt.fail(message);
            };
            temp.onready = function (temp_evt) {
             // This function chooses a task from the queue and runs it. The
             // current form simply chooses the first available, but I could
             // just as easily choose randomly by assigning weights to the
             // elements of the queue.
                if ((temp.val instanceof Array) === false) {
                 // This seems like a common problem that will occur whenever
                 // users begin implementing custom storage mechanisms.
                    return temp_evt.fail('"queue" should return an array');
                }
                if (temp.val.length === 0) {
                 // Here, we choose to 'fail' not because this is a dreadful
                 // occurrence or something, but because this decision allows
                 // us to avoid running subsequent functions whose assumptions
                 // depend precisely on having found a task to run. If we were
                 // instead to 'stay' and wait for something to do, it would
                 // be much harder to tune Quanah externally.
                    return temp_evt.fail('Nothing to do ...');
                }
                task.key = temp.val[0];
                temp_evt.exit();
                return evt.exit();
            };
            return;
        };
        task.onready = update_local;
        task.onready = function (evt) {
         // This function needs documentation.
            task.val.status = 'running';
            return evt.exit();
        };
        task.onready = update_remote;
        task.onready = function (evt) {
         // This function needs documentation.
            var f, first, x;
            f = avar({key: task.val.f});
            first = true;
            x = avar({key: task.val.x});
            f.onerror = x.onerror = function (message) {
             // This function needs documentation.
                var temp_f, temp_x;
                if (first) {
                    first = false;
                    task.val.epitaph = message;
                    task.val.status = 'failed';
                    temp_f = avar({key: f.key, val: f.val});
                    temp_x = avar({key: x.key, val: x.val});
                    temp_f = temp_x = update_remote;
                    when(temp_f, temp_x).areready = function (temp_evt) {
                     // This function needs documentation.
                        temp_evt.exit();
                        return evt.exit();
                    };
                }
                return;
            };
            f.onready = x.onready = update_local;
            when(f, x).areready = function (evt) {
             // This function needs documentation.
                f.val.call(x, evt);
                return;
            };
            f.onready = x.onready = update_remote;
            when(f, x).areready = function (temp_evt) {
             // This function needs documentation.
                task.val.status = 'done';
                temp_evt.exit();
                return evt.exit();
            };
            return;
        };
        task.onready = update_remote;
        return task;
    };

    when = function () {
     // This function takes any number of arguments, any number of which may
     // be avars, and outputs a special "compound" avar whose 'val' property is
     // an array of the original input arguments. The compound avar also has an
     // extra instance method (either 'isready' or 'areready') that forwards
     // its input arguments to the 'onready' handler to provide syntactic sugar
     // with a nice interpretation in English. Any functions assigned to the
     // 'onready' handler will wait for all input arguments' outstanding queues
     // to empty before executing, and exiting will allow each of the inputs
     // to begin working through its individual queue again. Also, a compound
     // avar can still be used as a prerequisite to execution even when the
     // compound avar depends on one of the other prerequisites, and although
     // the immediate usefulness of this ability may not be obvious, it will
     // turn out to be crucially important for expressing certain concurrency
     // patterns idiomatically :-)
        var args, x, y;
        args = Array.prototype.slice.call(arguments);
        x = (function union(x) {
         // This 'union' function calls itself recursively to create an array
         // 'x' of unique dependencies from the input arguments 'args'. In
         // particular, the prerequisites of compound avars will be added, but
         // the compound avars themselves will not be added. Performing this
         // operation is what allows Quanah to "un-nest" 'when' statements in
         // a single pass without constructing DAGs or preprocessing sources.
            var y = [];
            ply(x).by(function (i, xi) {
             // This function iterates over each element in 'x'.
                var flag;
                if ((xi instanceof AVar) &&
                        (xi.hasOwnProperty('isready') ||
                        (xi.hasOwnProperty('areready')))) {
                 // This arms "flattens" dependencies using recursion.
                    y = union(y.concat(xi.val));
                } else {
                 // This arm ensures elements are unique.
                    flag = true;
                    ply(y).by(function (j, yj) {
                     // This function iterates over each element in 'y'.
                        if (flag === true) {
                            flag = (xi !== yj);
                        }
                        return;
                    });
                    if (flag === true) {
                        y.push(xi);
                    }
                }
                return;
            });
            return y;
        }(args));
        y = avar({val: args});
        y.onerror = function (message) {
         // This function runs when something "terrible" has occurred.
            ply(x).by(function (key, val) {
             // This function passes the 'message' to each avar in 'x'. For
             // the other elements, there really isn't much we can do ...
                if (val instanceof AVar) {
                    val.comm({fail: message, secret: secret});
                }
                return;
            });
            return;
        };
        defineProperty(y, 'onready', {
            configurable: false,
            enumerable: false,
            get: function () {
             // This getter passes a temporary object to 'comm' in order to
             // return a reference to the next function in the avar's queue,
             // because 'comm' itself doesn't return anything.
                var temp = {};
                y.comm({get_onready: temp, secret: secret});
                return temp.onready;
            },
            set: function (f) {
             // This setter "absorbs" 'f', which is expected to be a function,
             // and it stores it in the queue for 'y' to execute later.
                var count, egress, g, n, ready;
                count = function () {
                 // This function is a simple counting semaphore that closes
                 // over some private state variables in order to delay the
                 // execution of 'f' until certain conditions are satisfied.
                    n -= 1;
                    if (n === 0) {
                        ready = true;
                    }
                    revive();
                    return;
                };
                egress = [];
                g = function (evt) {
                 // This function uses closure over private state variables
                 // and the input argument 'f' to delay execution and to run
                 // 'f' with a modified version of the 'evt' argument it will
                 // receive. This function will be assigned to 'y.onready',
                 // but it will not run until 'ready' is 'true'.
                    if (ready === false) {
                        return evt.stay('Acquiring "lock" ...');
                    }
                    if (isFunction(f) === false) {
                        return evt.fail('Assigned value must be a function');
                    }
                    f.call(this, {
                     // These methods close over the 'evt' argument as well as
                     // the 'egress' array so that invocations of the control
                     // statements 'exit', 'fail', and 'stay' are forwarded to
                     // all of the original arguments given to 'when'.
                        exit: function (message) {
                         // This function signals successful completion :-)
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> 'ply' is justified.
                                return evt.exit(message);
                            });
                            return evt.exit(message);
                        },
                        fail: function (message) {
                         // This function signals a failed execution :-(
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> 'ply' is justified.
                                return evt.fail(message);
                            });
                            return evt.fail(message);
                        },
                        stay: function (message) {
                         // This function delays execution until later.
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> 'ply' is justified.
                                return evt.stay(message);
                            });
                            return evt.stay(message);
                        }
                    });
                    return;
                };
                n = x.length;
                ready = false;
                ply(x).by(function (key, val) {
                 // This function traverses the unique arguments to 'when'.
                 // Because order isn't important, using 'ply' is justified.
                    if (val instanceof AVar) {
                        val.onready = function (evt) {
                         // This function stores the 'evt' argument into an
                         // array so we can prevent further execution involving
                         // 'val' until after 'g' calls the input argument 'f'.
                            egress.push(evt);
                            count();
                            return;
                        };
                    } else {
                     // There's no reason to wait for it because it isn't an
                     // avar, so we'll go ahead and decrement the counter.
                        count();
                    }
                    return;
                });
                y.comm({set_onready: g, secret: secret});
                return;
            }
        });
        defineProperty(y, ((args.length < 2) ? 'is' : 'are') + 'ready', {
            configurable: false,
            enumerable: false,
            get: function () {
             // This getter "forwards" to the avar's 'onready' handler as a
             // means to let the code read more idiomatically in English.
                return y.onready;
            },
            set: function (f) {
             // This setter "forwards" to the avar's 'onready' handler as a
             // means to let the code read more idiomatically in English.
                y.onready = f;
                return;
            }
        });
        return y;
    };

 // Prototype definitions

    defineProperty(AVar.prototype, 'onerror', {
        configurable: false,
        enumerable: false,
        get: function () {
         // This getter passes a temporary object to 'comm' in order to return
         // a reference to the private 'onerror' value, since 'comm' itself
         // doesn't return anything.
            var temp = {};
            this.comm({get_onerror: temp, secret: secret});
            return temp.onerror;
        },
        set: function (f) {
         // This setter "absorbs" a function 'f' and forwards it to 'comm' so
         // that it can be stored as a handler for 'this.onerror'. We don't
         // actually need to use 'isFunction' because if it's not a function,
         // it will never run anyway -- see the 'comm' definition.
            this.comm({set_onerror: f, secret: secret});
            return;
        }
    });

    defineProperty(AVar.prototype, 'onready', {
        configurable: false,
        enumerable: false,
        get: function () {
         // This getter passes a temporary object to 'comm' in order to return
         // a reference to the private 'onready' value, since 'comm' itself
         // doesn't return anything.
            var temp = {};
            this.comm({get_onready: temp, secret: secret});
            return temp.onready;
        },
        set: function (f) {
         // This setter "absorbs" a function 'f' and forwards it to 'comm' so
         // that it can be stored into a queue for subsequent execution. As a
         // bullet-proofing measure, I have moved the 'isFunction' check into
         // the 'comm' definition. Because there's only one place in the code
         // that can manipulate an avar's queue, assumptions about that queue
         // should be located as near there as possible to avoid oversight.
            this.comm({set_onready: f, secret: secret});
            return;
        }
    });

    defineProperty(AVar.prototype, 'toJSON', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function () {
         // This function exists as a way to ensure that 'JSON.stringify' can
         // serialize avars correctly, because that function will delegate to
         // an input argument's 'toJSON' prototype method if one is available.
         // Thus, providing this function allows Quanah to use its own format
         // for serialization without making it impossibly hard for users to
         // implement the abstract filesystem routines.
            return JSON.parse(serialize({
                key: this.key,
                val: this.val
            }));
        }
    });

    defineProperty(AVar.prototype, 'toString', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function () {
         // This function "forwards" to the avar's 'val' property if possible.
            if ((this.val === null) || (this.val === undefined)) {
                return this.val;
            }
            return this.val.toString.apply(this.val, arguments);
        }
    });

    defineProperty(AVar.prototype, 'valueOf', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function () {
         // This function "forwards" to the avar's 'val' property if possible.
            if ((this.val === null) || (this.val === undefined)) {
                return this.val;
            }
            return this.val.valueOf.apply(this.val, arguments);
        }
    });

 // Out-of-scope definitions

    defineProperty(Object.prototype, 'Q', {
     // Modifying the native prototype objects is extremely poor taste,
     // so we need to do this as invisibly as possible. To that end, I
     // have added the new method using "defineProperty" instead of by
     // assigning directly because then I can edit ES5 meta-properties.
        configurable: false,
        enumerable: true,
        writable: false,
        value: function (f) {
         // This function is globally available as "Object.prototype.Q", and
         // it also acts as the "namespace" for Quanah. It can be used with
         // any JavaScript value except 'null' and 'undefined', and it expects
         // one argument which is either a function of a single variable or
         // else an avar whose value is such a function.
            var x = (this instanceof AVar) ? this : avar({val: this});
            when(f, x).areready = function (evt) {
             // This function closes over 'f' and 'x' to induce execution on
             // the local (invoking) machine of the type-testing logic, but it
             // doesn't actually force the computation 'x.Q(f)' itself to run
             // locally. How? Well, by halting transformations of 'f' and 'x',
             // we can guarantee that when the handler function executes, the
             // value of 'f' will not change even if it's an avar. Thus, we can
             // use a disposable avar ('temp') to stand for 'x' and assign the
             // appropriate value of 'f' as an 'onready' handler which can run
             // remotely if 'f' and 'x' were distributable to begin with :-)
                var temp = avar({key: x.key, val: x.val});
                temp.onerror = function (message) {
                 // This function sends the 'message' along to 'f' and 'x'.
                    return evt.fail(message);
                };
                temp.onready = (f instanceof AVar) ? f.val : f;
                temp.onready = function (temp_evt) {
                 // This function updates the original avar to match and then
                 // exits the enclosing 'when' statement.
                    x.key = temp.key;   //- NOTE: is this a good idea?
                    x.val = temp.val;
                    temp_evt.exit();
                    return evt.exit();
                };
                return;
            };
            return x;
        }
    });

    (function () {

     // This function constructs a temporary 'namespace' object and then
     // copies its methods and properties onto Method Q for "export".

        var namespace;

        namespace = {
            avar:       avar,
            init:       init,
            map:        dmap,
            ply:        dply,
            reduce:     dreduce,
            uuid:       uuid,
            volunteer:  volunteer,
            when:       when
        };

        ply(namespace).by(function (key, val) {
         // This function copies the methods and properties of 'namespace'
         // onto Method Q as a simple means for "export". Because order is
         // not important, the use of 'ply' here is justified.
            defineProperty(Object.prototype.Q, key, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: val
            });
            return;
        });

        return;

    }());

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (outer_scope) {
    'use strict';

 // This strict anonymous closure encapsulates the logic for detecting which
 // object in the environment should be treated as _the_ global object. It's
 // not as easy as you may think -- strict mode disables the 'call' method's
 // default behavior of replacing "null" with the global object. Luckily, we
 // can work around that by passing a reference to the enclosing scope as an
 // argument at the same time and testing to see if strict mode has done its
 // deed. This task is not hard in the usual browser context because we know
 // that the global object is 'window', but CommonJS implementations such as
 // RingoJS confound the issue by modifying the scope chain, running scripts
 // in sandboxed contexts, and using identifiers like "global" carelessly ...

 // NOTE: This function is invoked by a "generic" 'call' to appease a recent
 // JSLINT update (~ 16 Feb 2012) that hates the 'function () {}.call()' form.
 // I first revised it to use a '[function () {}][0].call()' form that I have
 // used previously for writing quines, but I realized that it would probably
 // be "targeted" in the future as well, since '[].map()' won't pass JSLINT.
 // Thus, we use 'call' "generically" in order to change the 'this' binding
 // for an anonymous function without ever storing it (and thereby naming it).
 // I'm not sure yet if JSLINT is even correct on this issue because I haven't
 // dissected the ES5.1 syntax yet, but this does accomplish my purpose :-)

    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */

    if (this === null) {

     // Strict mode has captured us, but we already passed a reference :-)

        return (typeof global === 'object') ? global : outer_scope;

    }

     // Strict mode isn't supported in this environment, but we still need to
     // make sure we don't get fooled by Rhino's 'global' function.

    return (typeof this.global === 'object') ? this.global : this;

}, null, this)));

//- vim:set syntax=javascript:
