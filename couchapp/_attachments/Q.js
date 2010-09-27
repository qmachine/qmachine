//- JavaScript source code

//- Q.js ~~
//  This mini-framework for "Quanah" requires only 'JSON' and 'curl' objects.
//  I am going to fix it, though. I have a new idea!
//                                                          ~~ SRW, 26 Sep 2010

if (!this.Q) {                          //- Check for the Q object's existence
    var Q = {};
}

(function () {                          //- Build inside an anonymous closure

//- PRIVATE MEMBERS

    var root = location.href.replace(location.pathname, '/'),
        db;

//- Rewrite rules allow us to ignore the database name, but using port 5984 on
//  couchone.com disables the rewrite handler, requiring us to detect the name.

    if (location.port !== "5984") {
        db = root + 'db/';
    } else {
        db = root + location.pathname.replace(/([/][^/]+\/).*/, "$1");
    }

    var fresh_id = (function () {       //- Constructor for memoized function
            var ideal = 100,
                source = root + '_uuids?count=' + ideal,
                the_uuids = [],
                refill_uuids = function () {
                    if (the_uuids.length < ideal / 2) {
                        var msg = curl.GET(source),     //- AJAX will go here
                            latest = JSON.parse(msg);
                        the_uuids = the_uuids.concat(latest.uuids);
                    }
                };
            refill_uuids();
            return function (n) {       //- the "actual" function
                n = n || 1;
                var temp = the_uuids.splice(0,n);
                refill_uuids();
                return (n === 1) ? temp[0] : temp;
            };
        }()),

        author = (function () {
            var source = root + '_session',
                msg = JSON.parse(curl.GET(source));
            return msg.userCtx.name;
        }()),

        augment = function (branch, definition) {
            if (typeof Q[branch] !== 'function') {
                Q[branch] = definition;
            }
        },

        results = {
            "stdout":   [],
            "stderr":   []
        };

//- PUBLIC MEMBERS

    augment("print", function (msg) {   //- an all-purpose output function

        results.stdout.push(msg);

    });

    augment("write", function (obj) {      //- client --> cloud transfer

        if (typeof obj !== 'object') {
            throw 'Error: Argument to "Q.write" must be an object.'
        }

        obj._id = obj._id || fresh_id(1);
        obj.name = author;

        var target = db + obj._id,
            source = JSON.stringify(obj),
            msg = curl.PUT(target, source);

        return JSON.parse(msg);
    });

    augment("read", function (id) {     //- cloud --> client transfer
        var source = db + id,
            msg = curl.GET(source);

        return JSON.parse(msg);
    });

    augment("run", function (code) {    //- CLEARS RESULTS, then runs inline JS

        results.stdout.length = 0;      //- Sterilize the environment as much
        results.stderr.length = 0;      //  as possible before proceeding.

        try {                           //- Now, use a 'try/catch' statement
            eval(code);                 //  to evaluate the user's code and
        } catch (error) {               //  catch any exceptions that may have
            results.stderr.push(error); //  been thrown in the process.
        }
        return results;

    });

    augment("Doc", function (obj) {     //- Constructor for new CouchDB docs

        obj = obj || {};
        obj._id = obj._id || fresh_id(1);
        obj.name = author;

        var msg = Q.write(obj);

        if (msg.ok === 'false') {
            throw msg;
        }

        obj._rev = msg.rev;
        return obj;

    });

    augment("reval", function (func, argarray) {
        argarray = argarray || [];
        var id = fresh_id(),
            dQ = new Q.Doc({
                "_id":  id,
                "code": '(' + func.toString() + ').apply(this, ' +
                            JSON.stringify(argarray) + ')'
            });
        Q.write(dQ);
        console.log('Waiting for response ...');
        while (!dQ.results) {
            dQ = Q.read(id);
        }
        return dQ.results.stdout;
    });

})();

if (this.console) {
    console.log("Welcome to Quanah :-)");
}

//- vim:set syntax=javascript:
