/** QMachine client ********** BEGIN SHELL SCRIPT ********* >/dev/null 2>&1; #*\

#-  qmachine.js ~~
#                                                       ~~ (c) SRW, 23 May 2012

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
JS=$(available ${JS} nodejs node);
SHORTJS="${JS##*\/}";
Q=$0;
ARGV="$0 $*";

if [ -n "${ENVJS}" ] && [ -n "${JS}" ]; then
    if [ "${ENVJS}" != "${JS}" ] && [ "${ENVJS}" != "${SHORTJS}" ]; then
        alert "Could not find '${ENVJS}'; using '${SHORTJS}' instead ...";
    fi
fi

case ${SHORTJS:=:} in
  # Now, we'll define some explicit rules to enable features that should have
  # been on by default. Unfortunately, these aren't especially useful at the
  # moment because I am still deciding how to handle arguments parsing ...
    node*)                              #-  Node.js
        exec ${JS} ${ARGV} --v8-options --strict_mode;
        ;;
  # Last resort rules
    :)                                  #-  No [known] ${JS} available
        alert 'No known JS engine found on ${PATH}.';
        ;;
    *)                                  #-  No explicit rule for ${JS}
        exec ${JS} ${ARGV};
        ;;
esac

#** vim:set syntax=sh: ******** END SHELL SCRIPT ******************************/
//- JavaScript source code

//- main.js ~~
//                                                      ~~ (c) SRW, 21 May 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Prerequisites

 // Declarations

    var http, repl, url, vm;

 // Definitions

    http = require('http');

    repl = require('repl');

    url = require('url');

    vm = require('vm');

 // Launch

    http.get(url.parse('http://qmachine.org/q.js'), function (response) {
     // This function needs documentation. Eventually, I also plan to take
     // better advantage of the stream API in Node.js, but this works for now.
        var txt = [];
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
         // This function needs documentation.
            txt.push(chunk.toString());
            return;
        });
        response.on('end', function () {
         // This function needs documentation.
            var code, session;
            code = txt.join('');
            session = vm.createContext();
            vm.runInContext(code, session);
            repl.start('Q>> ').context = session;
            return; 
        });
        return;
    }).on('error', function (err) {
     // This function needs documentation.
        console.error(err);
        return;
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
