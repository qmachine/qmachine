// BROWSER ONLY!

// Q.js --
//  This contains routines specific to "The World's Most Relaxed Supercomputer",
//  and its only external dependencies are the 'curl' and 'JSON' objects.
//                                                          -- SRW, 11 Jul 2010

if (!this.Q) {                          // check for its existence
    var Q = {};
}

(function () {                          // build it inside an anonymous closure

 // PRIVATE MEMBERS

    var root = location.protocol + '//' + location.host + '/',
        db = root + 'quanah/',
        results = {"stdout": [], "stderr": []},
        build_Q = function (branch, definition) {
            if (typeof Q[branch] !== 'function') {
                Q[branch] = definition;
            }
        };

  // PUBLIC MEMBERS

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

     // Sterilize the environment as much as possible before proceeding

        results.stdout.length = 0;
        results.stderr.length = 0;

     // Now, evaluate the user's code inside a 'try/catch' to capture errors.

        try {
            eval(code);
        } catch (error) {
            results.stderr.push(error);
        }
        return results;
    });

}());
