//- JavaScript source code

//- quanah.js ~~
//
//  NOTE: Quanah no longer contains 'generic' functionality or exports a
//  generic 'ply' method because I extracted those into "generic.js", a new
//  project I will release after I finish writing some papers.
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
//  -   finish documenting all functions and "placeholders"
//  -   remove type-checks in user-unreachable functions where appropriate
//  -   replace 'throw' statements with 'fail' statements for robustness
//  -   rewrite 'onready' assignments as 'comm' invocations (optional)
//
//  Open questions:
//
//  -   Can Quanah return a remotely distributed memoized function?
//  -   Could Quanah actually support ActionScript?
//  -   Could Quanah solve nested 'when' dependencies? (see: 'demos[6]')
//
//                                                      ~~ (c) SRW, 10 Feb 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */
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

    var atob, AVar, avar, btoa, comm, defineProperty, deserialize, init,
        isArrayLike, isClosed, isFunction, local_call, ply, puts, remote_call,
        revive, secret, serialize, stack1, stack2, sys, update_local,
        update_remote, uuid, volunteer, when;

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
     // Quanah itself -- the avar "type".
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
             // by making it non-enumerable, which not only makes iteration
             // over avars faster but also allows avars to be serialized :-)
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
     // avar's private state. This function won't respond to messages unless
     // certain conditions are met, but I haven't decided if it should throw
     // errors when conditions have not been met.
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
                    stack1.unshift({
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
                Array.prototype.push.apply(inside.queue, args);
                if (inside.ready === true) {
                    x.comm({done: [], secret: secret});
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
             // In such a case, we will rely on user-submitted bug reports :-)
                throw new Error('No message "' + message + '" found.');
            }
        }
     // NOTE: Is it a good idea to invoke 'revive' every time? It does shorten
     // my code a little, of course, but the rationale here is that it helps
     // prevent a situation in which the progression through a non-empty queue
     // halts because no events remain to trigger execution.
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
         // to increase performance, but for now, update your platform ;-)
            throw new Error('platform lacks support for getters and setters.');
        }
        return defineProperty(obj, name, params);
    };

    deserialize = function ($x) {
     // This function is a JSON-based deserialization utility that pairs with
     // the 'serialize' function provided herein. Read more documentation in
     // that function's definition, especially regarding UTF-8 conversions.
        return JSON.parse($x, function revive(key, val) {
         // This function needs documentation.
            var f, pattern;
            pattern = /^\[FUNCTION ([A-z0-9\+\/\=]+) ([A-z0-9\+\/\=]+)\]$/;
            if ((typeof val === 'string') || (val instanceof String)) {
                if (pattern.test(val)) {
                    val.replace(pattern, function ($0, code, props) {
                     // This function needs documentation.
                        /*jslint evil: true */
                        var obj = deserialize(atob(props));
                        f = ((new Function('return ' + atob(code)))());
                        ply(obj).by(function (key, val) {
                         // This function is a "map" ==> 'ply' is justified.
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

    init = function (obj) {
     // This function enables the user to redefine "internal" functions from
     // outside the giant anonymous closure. In particular, this allows users
     // to port Quanah for use with any persistent storage system by simply
     // implementing specific routines and providing them to Quanah by way of
     // this 'init' function.
        ply(obj).by(function (key, val) {
         // This function is a filtered "map" ==> 'ply' is justified.
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
        var $f, flag, left, key, right;
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
                 // Hope for the best?
                    $f = x;
                }
             // Remove leading and trailing parentheses to appease JSLINT ...
                $f = left + $f.replace(/^[(]|[)]$/g, '') + right;
             // Here, we use JSLINT to analyze the function's "source code".
             // We disable all options that do not directly pertain to the
             // exact problem of determining whether the function will run
             // correctly in a remote JavaScript environment or not. JSLINT
             // returns 'false' if the scan fails, but that corresponds to a
             // 'true' flag for our problem; thus, we negate JSLINT's output.
                flag = (false === JSLINT($f, {
                 // JSLINT configuration options (version 2012-02-03):
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
             // This function has an "all" pattern ==> 'ply' is justified.
                if (flag === false) {
                    flag = isClosed(val);
                }
                return;
            });
        }
        return flag;
    };

    isFunction = function (f) {
     // This function returns 'true' only if and only if 'f' is a Function.
     // The second condition is necessary to return 'false' for a RegExp.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    local_call = function (obj) {
     // This function applies the transformation 'f' to 'x' for method 'f' and
     // property 'x' of the input object 'obj' by calling 'f' with an input
     // argument 'evt' and a 'this' value 'x'. The advantage of performing the
     // transformation as shown, rather than simply computing 'f(x)', is that
     // the user can explicitly indicate the program's logic even when the
     // program's control is difficult or impossible to predict, as is commonly
     // the case in JavaScript when using AJAX calls, for example.
        if ((obj.x instanceof AVar) === false) {
         // I'm not sure if this condition is still necessary to check because
         // it may actually be unreachable ...
            throw new TypeError('"local_call" expects "obj.x" to be an AVar');
        }
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
                    stack2.push(obj);
                    return;
                }
            };
         // After all the setup, the actual invocation is anticlimactic, huh?
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
             // NOTE: I probably can't optimize this for Arrays and Objects
             // after all because I use it on Functions in 'serialize' ...
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
                 // I'm never quit sure if this is a good fallback definition,
                 // but hopefully I'll get around to showing that this arm is
                 // unnecessary anyway. In that case, I'll just remove it.
                    f(undefined, x);
                }
                return;
            }
        };
    };

    puts = function () {
     // This function is just a placeholder for testing purposes. It is also
     // used in 'volunteer' to induce local execution :-)
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
        var f, x;
     // First, we need to copy the computation's function and data into fresh
     // instances, define some error handlers, and then write the copies to
     // the abstract shared "filesystem".
        f = avar({val: obj.f});
        x = avar({val: obj.x.val});
        f.onerror = x.onerror = function (message) {
         // This function tells the original 'x' that something has gone awry.
            obj.x.comm({fail: message, secret: secret});
            return;
        };
        f.onready = x.onready = update_remote;
     // Step 2: (placeholder)
        when(f, x).areready = function (evt) {
         // This function creates a 'task' object to represent the computation
         // and monitors its status by polling.
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
             // a variation on the 'update_local' function as an asynchronous
             // 'while' loop -- hooray for disposable avars!
                var temp = sys.read(task.key);
                temp.onerror = function (message) {
                 // This alerts 'task' that something has gone awry.
                    return evt.fail(message);
                };
                temp.onready = function (temp_evt) {
                    var val = deserialize(temp.val).val;
                 // This function needs documentation.
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
             // This function simply releases 'f' and 'x'.
                task_evt.exit();
                return evt.exit();
            };
            return;
        };
     // Step 3: (placeholder)
        f.onready = x.onready = update_local;
     // Step 4: (placeholder)
        when(f, x).areready = function (evt) {
         // This function copies the new values into the old object. Please
         // note that we cannot simply write 'obj.foo = foo' because we would
         // lose the original avar's internal state! Also, it may be better to
         // separate these into explicit 'f.onready' and 'x.onready' events,
         // but I haven't made a decision on that part yet.
            obj.f = f.val;
            obj.x.val = x.val;
            obj.x.comm({done: [], secret: secret});
            return evt.exit();
        };
        return;
    };

    revive = function () {
     // This function contains the execution center for Quanah. It works by
     // running the first available task in its primary queue, subject to some
     // constraints, and then moving all tasks from a secondary queue into the
     // primary before exiting. The secondary queue contains tasks that have
     // been rescheduled. Then, our strategy is simply to ensure that 'revive'
     // will be called as many times as necessary to progress through the
     // entire queue. Because 'revive' makes no attempt to run every single
     // task in the queue during a single invocation, the queue can be shared
     // by multiple "contexts" that each invoke 'revive' at the same time, and
     // it makes no difference if the separate contexts are due to recursion or
     // to special object such as Web Workers. The constraints mentioned above
     // are implemented as conditional tests that determine whether a given
     // computation can be distributed to external resources for execution.
        var task = stack1.shift();
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
             // The task is serializable and we are able to distribute it :-)
                remote_call(task);
            }
        }
        stack1.push.apply(stack1, stack2.splice(0, stack2.length));
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
                 // Here, we just hope for the best. We could also try using
                 //     $val += btoa(String(val));
                 // but it would just make JSLint angry and confuse people.
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

    stack1 = [];

    stack2 = [];

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
         // This function needs documentation.
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
     // This function needs documentation.
        var f, task, x;
        f = avar();
        task = avar();
        x = avar();
        f.onerror = x.onerror = function (message) {
         // This function needs documentation.
            task.comm({fail: message, secret: secret});
            return;
        };
        task.onerror = function (message) {
         // This function attempts to notify the remote representation of the
         // task that an error has occurred, but depending on the nature of the
         // error, of course, this function may not succeed, either! Luckily,
         // a user can always redefine this handler -- 'volunteer' returns the
         // 'task' object directly. One option, of course, is to redefine the
         // 'onerror' handler here at the end of each 'onready' so that its
         // assumptions will be up-to-date. Suggestions are welcomed :-)
            var temp;
            if (task.val instanceof Object) {
                task.val.epitaph = message;
                task.val.status = 'failed';
                temp = avar({key: task.key, val: task.val});
                temp.onready = update_remote;
            }
            return;
        };
        task.onready = function (evt) {
         // This function retrieves the key of a task from the queue so we
         // can retrieve that task's full description. If no tasks are found,
         // we will simply check back later :-)
            if (sys.queue === null) {
                return evt.stay('Waiting for a "queue" definition ...');
            }
            var temp = sys.queue();
            temp.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            temp.onready = function (temp_evt) {
             // This function needs documentation.
                if (temp.val.length === 0) {
                    evt.fail('Nothing to do ...');
                } else {
                    task.key = temp.val[0];
                    evt.exit();
                }
                return temp_evt.exit();
            };
            return;
        };
        task.onready = update_local;
        when(f, task, x).areready = function (evt) {
         // This function needs documentation.
            f.key = task.val.f;
            x.key = task.val.x;
            task.val.status = 'running';
            return evt.exit();
        };
        task.onready = update_remote;
        f.onready = x.onready = update_local;
     // ------
     //
     // Now, we need to execute the computation 'f(x)' for avars 'f' and 'x'
     // with robust error-handling. Although it would be really nice just to
     // write 'x.Q(f)', doing so would simply distribute the task remotely,
     // since the task was obviously serializable or it wouldn't even be here.
     // To avoid an infinite loop, then, we need to solve the two problems of
     // controlling _where_ and _when_ the computation will run. It turns out
     // that there is a really easy solution -- close over 'f' inside an
     // 'x.onready' function and then sandwich that function between a pair of
     // 'when' statements. Closing over a local variable induces the local
     // execution we want, and the 'when' statements block and release the
     // two variables simultaneously. There are a number of other solutions
     // out there, but I prefer this one at the moment.
     //
     // NOTE: Will Quanah try to distribute the 'when' statements remotely?
     //
        when(f, x).areready = function (evt) {
         // This function is the first half of the "sandwich" pattern.
            puts(f, x);
            return evt.exit();
        };
        x.onready = function (evt) {
         // This function closes over 'f' to induce local execution of 'f(x)'.
            f.val.call(this, evt);
            return;
        };
        when(f, x).areready = function (evt) {
         // This function is the second half of the "sandwich" pattern.
            puts(f, x);
            return evt.exit();
        };
     //
     // ------
        f.onready = x.onready = update_remote;
        when(f, task, x).areready = function (evt) {
         // This function prepares to signal successful completion by changing
         // the value of the 'status' property; the signal will be sent when
         // we update the remote copy of 'task'.
            task.val.status = 'done';
            return evt.exit();
        };
        task.onready = update_remote;
        return task;
    };

    when = function () {
     // This function needs documentation because it has been completely
     // rewritten in terms of a "phantom" AVar to which I have added some
     // custom instance methods.
        var args, phantom;
        args = Array.prototype.slice.call(arguments);
        phantom = avar({val: args});
        phantom.onerror = function (message) {
         // This function needs documentation.
            ply(args).by(function (key, val) {
             // This function needs documentation.
                if (val instanceof AVar) {
                    val.comm({fail: message, secret: secret});
                }
                return;
            });
            return;
        };
        defineProperty(phantom, 'onready', {
            configurable: false,
            enumerable: false,
            get: function () {
             // This function needs documentation.
                var temp = {};
                phantom.comm({get_onready: temp, secret: secret});
                return temp.onready;
            },
            set: function (f) {
             // This function needs documentation.
                if (isFunction(f) === false) {
                    throw new TypeError('Assigned value must be a function.');
                }
                var count, egress, g, n, ready;
                count = function () {
                 // This function needs documentation.
                    n -= 1;
                    if (n === 0) {
                        ready = true;
                    }
                    revive();
                    return;
                };
                egress = [];
                g = function (evt) {
                 // This function needs documentation.
                    if (ready === false) {
                        return evt.stay('Acquiring "lock" ...');
                    }
                    f.call(this, {
                        exit: function (message) {
                         // This function needs documentation.
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> 'ply' is justified.
                                return evt.exit(message);
                            });
                            return evt.exit(message);
                        },
                        fail: function (message) {
                         // This function needs documentation.
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> 'ply' is justified.
                                return evt.fail(message);
                            });
                            return evt.fail(message);
                        },
                        stay: function (message) {
                         // This function needs documentation.
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> 'ply' is justified.
                                return evt.stay(message);
                            });
                            return evt.stay(message);
                        }
                    });
                    return;
                };
                n = args.length;
                ready = false;
                ply(args).by(function (key, val) {
                 // This function is a "forEach" ==> 'ply' is justified.
                    if (val instanceof AVar) {
                        val.onready = function (evt) {
                         // Does this function need documentation?
                            egress.push(evt);
                            count();
                            return;
                        };
                    } else {
                        count();
                    }
                    return;
                });
                phantom.comm({set_onready: g, secret: secret});
                return;
            }
        });
        defineProperty(phantom, ((args.length < 2) ? 'is' : 'are') + 'ready', {
            configurable: false,
            enumerable: false,
            get: function () {
             // This getter "forwards" to the avar's 'onready' handler as a
             // means to let the code read more idiomatically in English.
                return phantom.onready;
            },
            set: function (f) {
             // This setter "forwards" to the avar's 'onready' handler as a
             // means to let the code read more idiomatically in English.
                phantom.onready = f;
                return;
            }
        });
        return phantom;
    };

 // Prototype definitions

    defineProperty(AVar.prototype, 'onerror', {
        configurable: false,
        enumerable: false,
        get: function () {
         // This function needs documentation.
            var temp = {};
            this.comm({get_onerror: temp, secret: secret});
            return temp.onerror;
        },
        set: function (f) {
         // This function needs documentation.
            if (isFunction(f)) {
                this.comm({set_onerror: f, secret: secret});
            } else {
                this.comm({
                    fail: 'Assigned value must be a function',
                    secret: secret
                });
            }
            return;
        }
    });

    defineProperty(AVar.prototype, 'onready', {
        configurable: false,
        enumerable: false,
        get: function () {
         // This function needs documentation.
            var temp = {};
            this.comm({get_onready: temp, secret: secret});
            return temp.onready;
        },
        set: function (f) {
         // This function needs documentation.
            if (isFunction(f)) {
                this.comm({set_onready: f, secret: secret});
            } else {
                this.comm({
                    fail: 'Assigned value must be a function',
                    secret: secret
                });
            }
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
            var val = this.val;
            if ((val === null) || (val === undefined)) {
                return val;
            } else {
                return val.toString.apply(val, arguments);
            }
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
            } else {
                return this.val.valueOf.apply(this.val, arguments);
            }
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
             // This function needs documentation.
                var temp = avar({val: x.val});
                temp.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                temp.onready = (f instanceof AVar) ? f.val : f;
                temp.onready = function (temp_evt) {
                 // This function needs documentation.
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
            global:     global,         //- deprecated
            init:       init,
            uuid:       uuid,           //- may be deprecated soon ...
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

}(function (outer_scope) {
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

    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */

    if (this === null) {

     // Strict mode has captured us, but we already passed a reference :-)

        return (typeof global === 'object') ? global : outer_scope;

    } else {

     // Strict mode isn't supported in this environment, but we still need to
     // make sure we don't get fooled by Rhino's 'global' function.

        return (typeof this.global === 'object') ? this.global : this;

    }

}.call(null, this)));

//- vim:set syntax=javascript:
