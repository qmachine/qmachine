/** Web Chassis v0.2 ********* BEGIN SHELL SCRIPT ********* >/dev/null 2>&1; #*\

#-  web-chassis.js ~~
#
#   (LICENSE AND PREAMBLE GO HERE ...)
#
#                                                       ~~ (c) SRW, 16 Aug 2011

if test -n "${ZSH_VERSION+set}" && (emulate sh) >/dev/null 2>&1; then
    emulate sh;
elif test -n "${BASH_VERSION+set}" && (set -o posix) >/dev/null 2>&1; then
    set -o posix;
fi

alert() {
  # This shell function outputs red text to stderr using ANSI C-strings.
    printf '\033[1;31mERROR: %s\033[1;0m\n' "$*" >&2;
}

available() {
  # This shell function accepts a variable number of program names and prints
  # the absolute path to the first one available by watching for a successful
  # exit code. Looping isn't ideal, but it behaves consistently across shells.
    for each in $@; do
        command -v ${each} >/dev/null 2>&1;
        if [ $? -eq 0 ]; then
            command -v ${each};
            break;
        fi
    done
    return $?;
}

usage() {
  # This shell function prints a subset of the full documentation and exits.
    printf '%s\n\n' "Usage: [SHELL] $0 [OPTION]... [FILE]...";
    printf '%s\n\n' "Options:
    -h, --help                          print this message and exit
    -v, --version                       print version number and exit
    -*, --*                             all other options pass directly to JS";
    printf '%s %s.\n' 'Full documentation is available online at' \
        'https://web-chassis.googlecode.com';
}

version() {
  # This shell function prints the version number and exits. 
    printf '%s\n' '0.2';
}

while getopts ":-:hv" option; do
    case "${option}" in
        h)
            usage && exit 0;
            ;;
        v)
            version && exit 0;
            ;;
        *)
          # This is a hack so I can fake support for "long options" even
          # though 'getopts' doesn't support them. It deliberately omits
          # a catch for unknown flags; those will pass directly to JS :-)
            [ ${OPTARG} = help ] && usage && exit 0;
            [ ${OPTARG} = version ] && version && exit 0;
            ;;
    esac
done

ENVJS=${JS};
JS=$(available ${JS} v8 js jsc d8 node rhino ringo narwhal);
SHORTJS="${JS##*\/}";
Q=$0;
ARGV="$0 $*";

if [ -n "${ENVJS}" ] && [ -n "${JS}" ]; then
    if [ "${ENVJS}" != "${JS}" ] && [ "${ENVJS}" != "${SHORTJS}" ]; then
        alert "Could not find '${ENVJS}'; using '${SHORTJS}' instead ...";
    fi
fi

case ${SHORTJS:=:} in
  # Explicit rules to enable features that should have been on by default ...
    d8)                                 #-  Google V8 debugging shell
        exec ${JS} --strict_mode ${Q} -- ${ARGV};
        ;;
    js)                                 #-  Mozilla SpiderMonkey 1.8 or later
        exec ${JS} ${Q} ${ARGV};        #   For 1.8.5+, "-m -j -U" --> JIT+UTF8
        ;;
    jsc)                                #-  JavaScriptCore developer shell
        exec ${JS} ${Q} -- ${ARGV};
        ;;
    node)                               #-  Node.js
        exec ${JS} ${ARGV} --v8-options --strict_mode;
        ;;
    rhino)                              #-  Mozilla Rhino 1.7 release 3 2011
        exec ${JS} -encoding utf8 ${Q} ${ARGV};
        ;;
    v8)                                 #-  Google V8 sample shell
        exec ${JS} --strict_mode -e "arguments = ('${ARGV}'.split(' '))" ${Q};
        ;;
  # Last resort rules
    :)                                  #-  No [known] ${JS} available
        alert 'No known JS engine found on ${PATH}.';
        JS="`printf '%q%q' \
            '/System/Library/Frameworks/JavaScriptCore.framework' \
            '/Versions/Current/Resources/jsc'`";
        if [ `available ${JS}` ]; then
            alert "Using ${JS} ..." && exec ${JS} ${Q} -- ${ARGV};
        fi
        alert 'No JS engine found.' && exit 1;
        ;;
    *)                                  #-  No explicit rule for ${JS}
        exec ${JS} ${ARGV};
        ;;
esac

#****************************** END SHELL SCRIPT ******************************/
/****************************** BEGIN JAVASCRIPT ******************************\
 *                                                                            *
 *  NOTE: Web Chassis is undergoing renovations -- pardon our mess ;-)        *
 *                                                                            *
\******************************************************************************/

/*jslint indent: 4, maxlen: 80, nomen: true                                   */
/*global chassis: true, global: true, module: true, require: false            */

/******************************************************************************\
 *                                                                            *
 *  (Brief explanation will go here ...)                                      *
 *                                                                            *
\******************************************************************************/

(function (global) {                    //- This strict anonymous closure can
    "use strict";                       //  still access the global object :-)

 // Constructors (these would get lifted to the top of the scope anyway ...)

    function TryAgainLater(message) {
        this.message = message || "Dying ...";
    }

    TryAgainLater.prototype = new Error();

 // Private declarations

    var q, revive, stack1, stack2;

 // Private definitions

    q = global.chassis = function chassis(f) {
        if (typeof f === 'function') {
            stack1.unshift(f);
            revive();
        } else {
            throw new Error("Web Chassis expects functions as arguments.");
        }
    };

    stack1 = [];
    stack2 = [];

    revive = function () {
        var func;
        while ((func = stack1.shift()) !== undefined) {
            try {
                func.call(this, q, global);
            } catch (err) {
                if (err instanceof TryAgainLater) {
                    stack2.push(func);
                    if (q.flags.debug) {
                        q.puts(err.message);
                    }
                } else {
                    q.puts(err);
                }
            }
        }
        Array.prototype.push.apply(stack1, stack2.splice(0, stack2.length));
    };

 // Because JS functions are also objects, we can use Chassis itself as an
 // object in which we may store related properties, methods, and data :-)

    q.detects = function (property) {
     // This function detects properties available on the global object as a
     // means to configure Web Chassis to the current environment. I wrote it
     // as a lazy-loader to allow for memoization on a private variable instead
     // of on the function itself -- I hit a really nasty bug once where the
     // program needed to memoize an "arguments" property onto the function
     // itself, and that fails silently in strict mode.
        var cache = {
         // This is a special local-scope-only value in CommonJS ...
            module: (typeof module === 'object')
        };
        q.detects = function (property) {
            if (cache.hasOwnProperty(property) === false) {
                cache[property] = (global[property]) ? true : false;
            }
            return cache[property];
        };
        return q.detects(property);
    };

    q.die = function (message) {
        throw new TryAgainLater(message);
    };

    q.flags = {};

    q.include = function (libname) {    //- see also: http://goo.gl/2h4m
        var loaded = {};
        q.include = function (libname) {
            var key, re;
            if (loaded[libname] !== true) {
                re = new RegExp("^" + libname + "\\$(.+)$");
                for (key in q) {
                    if (q.hasOwnProperty(key) && re.test(key)) {
                        q[key.match(re)[1]] = q[key];
                    }
                }
                loaded[libname] = true;
            };
        };
        q.include(libname);
    };

    q.lib = function (libname) {
        var defineProperty, loaded;
        if (typeof Object.defineProperty === 'function') {
            defineProperty = Object.defineProperty;
        } else {
            defineProperty = function (obj, key, params) {
                var each;
                for (each in params) {
                    if (params.hasOwnProperty(each)) {
                        switch (each) {
                        case "get":
                            obj.__defineGetter__(key, params[each]);
                            break;
                        case "set":
                            obj.__defineSetter__(key, params[each]);
                            break;
                        case "value":
                            delete obj[key];
                            obj[key] = params[each];
                            break;
                        default:
                         // (placeholder)
                        }
                    }
                }
                return obj;
            };
        }
        loaded = {};
        q.lib = function (libname) {
            switch (loaded[libname]) {
            case true:
             // The module definition has already loaded ==> exit early :-)
                break;
            case false:
             // A setter exists, but the module itself is still forthcoming.
                q.die('Awaiting "' + libname + '" ...');
                break;
            default:
             // This is the first time we've tried to lazy-load the module,
             // which means we need to check if it exists or if we should wait.
                loaded[libname] = false;
                if (q.hasOwnProperty(libname)) {
                 // If the module already exists, use Web Chassis to run it,
                 // just in case it has its own internal dependencies. We bind
                 // to 'q' to provide some support for a CommonJS-ish API.
                    q(function (q) {
                        q[libname].call(q, q);
                        loaded[libname] = true;
                        if (q.flags.debug) {
                            q.puts('Loaded "' + libname + '" :-)');
                        }
                    });
                } else {
                 // The module doesn't exist yet, so we'll create a setter
                 // function that will lazy-load it upon assignment so that
                 // we'll have it available as soon as possible.
                    defineProperty(q, libname, {
                        configurable: true,
                        set: function (f) {
                         // Remove the setter and assign the module as the
                         // user expects has already been done.
                            delete q[libname];
                            q[libname] = f;
                         // We use the same simple mechanism as above because
                         // recursing just to DRY out the code sometimes might
                         // lead to a race condition in this particular case.
                            q(function (q) {
                                q[libname].call(q, q);
                                loaded[libname] = true;
                                if (q.flags.debug) {
                                    q.puts('Loaded "' + libname + '" :-)');
                                }
                            });
                        }
                    });
                    q.die('Created setter for "' + libname + '" ...');
                }
            }
        };
        q.lib(libname);
    };

    if (q.detects("location")) {
        q.argv = global.location.search.slice(1).split(",");
        if (q.detects("window")) {
         // Web Chassis is running inside a web browser -- hooray!
            q.load = function (uri) {
                var loaded = {};
                q.load = function (uri) {
                    if (loaded[uri] === true) {
                     // It has already been loaded.
                        return;
                    } else if (loaded[uri] === false) {
                     // It is being loaded.
                        return;
                    } else {
                        loaded[uri] = false;
                        var script = global.document.createElement("script");
                        script.src = uri;
                        script.onload = function () {
                            loaded[uri] = true;
                            revive();
                        };
                        global.document.body.appendChild(script);
                    }
                };
                q.load(uri);
            };
            q.puts = function () {
                var join = Array.prototype.join;
                if (q.detects("console")) {
                    q.puts = function () {
                        global.console.log(join.call(arguments, " "));
                    };
                } else {
                    q.puts = function () {
                        var d, f, p;
                        d = global.document;
                        p = d.body.appendChild(d.createElement("pre"));
                        p.innerHTML += join.call(arguments, " ");
                        d = p = null;
                    };
                }
                q.puts.apply(this, arguments);
            };
            global.window.onunload = function () {
                delete global.chassis;
            };
        } else {
         // Web Chassis is running inside a Web Worker -- hooray!
            q.load = function (uri) {
                var loaded = {};
                q.load = function (uri) {
                    if (loaded[uri] === true) {
                     // It has already been loaded.
                        return;
                    } else if (loaded[uri] === false) {
                     // It is being loaded. This is kind of overkill, because
                     // Web Workers use a blocking script loader anyway ...
                        return;
                    } else {
                        loaded[uri] = false;
                        global.importScripts(uri);
                        loaded[uri] = true;
                        revive();
                    }
                };
                q.load(uri);
            };
            q.puts = function () {
                global.postMessage(Array.prototype.slice.call(arguments));
            };
        }
    } else if (q.detects("load") && q.detects("print")) {
     // You're running this in a developer shell, not a browser -- good luck!
        if (q.detects("scriptArgs")) {
            q.argv = Array.prototype.slice.call(global.scriptArgs, 1);
        } else if (q.detects("arguments")) {
            q.argv = Array.prototype.slice.call(global["arguments"], 1);
        } else {
            q.argv = [];
        }
        q.load = function (uri) {
            var loaded = {};
            q.load = function (uri) {
                if (loaded[uri] === true) {
                 // It has already been loaded.
                    return;
                } else if (loaded[uri] === false) {
                 // It is being loaded. This is probably overkill, because the
                 // developer shells all use blocking script loaders ...
                    return;
                } else {
                    loaded[uri] = false;
                    global.load(uri);
                    loaded[uri] = true;
                    revive();
                }
            };
            q.load(uri);
        };
        q.puts = function () {
            global.print(Array.prototype.join.call(arguments, " "));
        };
    } else if (q.detects("process")) {
     // You're running this in Node.js, not a browser -- good luck!
        global.fs = require("fs");
        global.vm = require("vm");
        q.argv = global.process.argv.slice(2);
        q.load = function (uri) {
            var loaded = {};
            q.load = function (uri) {
                if (loaded[uri] === true) {
                 // It has already loaded.
                    return;
                } else if (loaded[uri] === false) {
                 // It is being loaded. This is NOT overkill in Node.js, since
                 // all kinds of crazy things can happen concurrently here.
                    return;
                } else {
                    loaded[uri] = false;
                    global.fs.readFile(uri, "utf8", function (err, data) {
                        if (err) {
                            throw err;
                        }
                        global.vm.createScript(data, uri).runInThisContext();
                        loaded[uri] = true;
                        revive();
                    });
                }
            };
            q.load(uri);
        };
        q.puts = function () {
            global.console.log(Array.prototype.join.call(arguments, " "));
        };
    } else {
     // Seriously, do contact me so I can add support for your platform, ok?
        throw new Error("Platform detection failed -- please file a report!");
    }

 // The formatting conventions here for valid arguments are as follows:
 // -   an argument looks like "[-][-]key[=value]"                      ;
 // -   keys are made of typical filesystem characters  (A-Za-z_./0-9)  ;
 // -   values are made of valid "word" characters      (A-Za-z_)       ;
 // -   keys without values map to "key=true"                           ; and
 // -   repeated keys' values will be stored in an array.

    (function () {
        var flag, key, i, matches, n, val;
        flag = /^[\-]{0,2}([\w\.\-\/]+)[=]?([\w]*)$/;
        n = q.argv.length;
        for (i = 0; i < n; i += 1) {
            if (flag.test(q.argv[i]) === true) {
                matches = q.argv[i].match(flag);
                key = matches[1];
                val = JSON.parse(matches[2] || true);
                if (q.flags.hasOwnProperty(key)) {
                    if (q.flags[key].hasOwnProperty("length")) {
                        Array.prototype.push.call(q.flags[key], val);
                    } else {
                        q.flags[key] = [q.flags[key], val];
                    }
                } else {
                    q.flags[key] = val;
                }
            }
        }
    }());

 // We may only load external scripts after processing _all_ input arguments!

    (function () {
        var key, re;
        re = /\.js$/;
        for (key in q.flags) {
            if (q.flags.hasOwnProperty(key) && re.test(key)) {
                q.load(key);
            }
        }
    }());

 // Finally, we'll add the ability to load Web Chassis as a CommonJS module.
 // To load it interactively, use
 //     > var chassis = require("./bin/web-chassis.js").init();

    if (typeof module === 'object') {
     // NOTE: This is deliberately written "module" instead of "global.module"
     // because the 'module' object is often restricted to local scope.
        module.exports.init = function () {
            return q;
        };
    }

}(function (outer_scope) {
    "use strict";

 // This strict anonymous closure encapsulates the logic for detecting which
 // object in the environment should be treated as _the_ global object. It's
 // not as easy as you might think -- strict mode disables the 'call' method's
 // default behavior of replacing "null" with the global object. Luckily, we
 // can work around that by passing a reference to the enclosing scope as an
 // argument at the same time and testing to see if strict mode has done its
 // deed. This task is not hard in the usual browser context because we know
 // that the global object is 'window', but CommonJS implementations such as
 // RingoJS confound the issue by modifying the scope chain, running scripts
 // in sandboxed contexts, and using identifiers like "global" carelessly ...

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
