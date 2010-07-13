// BROWSER ONLY!

// Q.js --
//  This contains routines specific to "The World's Most Relaxed Supercomputer",
//  and its only external dependencies are the 'curl' and 'JSON' objects.
//                                                          -- SRW, 11 Jul 2010

//  NOTE: I just realized the current system is vulnerable to "wabbits". This
//  is in addition to the fact that any anonymous person out there could bring
//  down the entire system with a mere 'curl -X DELETE $URL'. Argh.

//  NOTE: Does 'jslint' have a bug in it, for methods that begin with '_' ?

//  NOTE: I'd like to forego explicitly disallowing insecure JS functions in
//  favor of simply refreshing the page if anything alters the volunteers'
//  local instance of the webpage. Can this be done with 'onchange'-type events?

if (!this.Q) {                          // check for its existence
    var Q = {};
}

(function () {                          // build it inside an anonymous closure

 // First, we declare private variables that exist only within this closure.

    var root = window.location.protocol + '//' + window.location.host + '/',
        db = root + 'quanah/',
        results = {"stdout": [], "stderr": []},
        build_Q = function (branch, definition) {
            if (typeof Q[branch] !== 'function') {
                Q[branch] = definition;
            }
        },
        nono = function (fname) {
            return function () {
                throw "ERROR: Do not use the '" + fname + "' function.";
            };
        };

 // Now, let's nip some potential nuisances in the bud by overwriting some of
 // the default output functions. The list will be carefully expanded soon.

    window.alert = nono("alert");
    document.write = nono("document.write");
    document.writeln = nono("document.writeln");

 // From this point on, we are building members for the 'Q' object, so we must
 // be careful not to create any "Hawking radiation" that leaves the closure.

    build_Q("sterilize", function () {
        results.stdout.length = 0;
        results.stderr.length = 0;
    });

    build_Q("print", function (message) {
        results.stdout.push(message);
    });

    build_Q("up", function (obj) {      // client --> cloud transfer
        var msg = curl.PUT(db + obj['_id'], JSON.stringify(obj));
        return JSON.parse(msg);
    });

    build_Q("down", function (doc_id) { // cloud --> client transfer
        var msg = curl.GET(db + doc_id);
        return JSON.parse(msg);
    });

    build_Q("fresh_id", function (n) {  // need to memoize ...
        n = n || 1;
        var msg = curl.GET(root + '_uuids?count=' + n),
            temp = JSON.parse(msg);
        return (n === 1) ? temp.uuids[0] : temp.uuids;
    });

    build_Q("Doc", function () {        // Constructor that takes no arguments
        var template = {"_id": Q.fresh_id()},
            msg = Q.up(template);
        if (msg.ok) {
            template['_rev'] = msg.rev;
            return template;
        } else {
            throw msg;
        }
    });

    build_Q("eval", function (code) {
        Q.sterilize();
        try {
            eval(code);
        } catch (error) {
            results.stderr.push(error);
        }
        return results;
    });

}());
