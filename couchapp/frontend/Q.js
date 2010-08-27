//- JavaScript source code

//- Q.js ~~
//  This mini-framework for "Quanah" requires only 'JSON' and 'curl' objects.
//                                                          ~~ SRW, 21 Jul 2010

if (!this.Q) {                          //- Check for the Q object's existence
    var Q = {};
}

(function () {                          //- Build Q inside an anonymous closure

//- PRIVATE MEMBERS

    var root = location.protocol + '//' + location.host + '/',
        db = root + 'app/',

        fresh_id = (function () {       //- Memoized (poorly) but not AJAX'ed
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
            return function (n) {
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
        },

    //- I may replace this next bit with a "validate_doc_update.js" file ...
        validate = function (obj) {     //- fills in an object's missing fields
            obj["_id"] = obj["_id"] || fresh_id();
            obj.name = author;
            return obj;
        };

//- PUBLIC MEMBERS

    augment("print", function (msg) {   //- an all-purpose output function

        results.stdout.push(msg);

    });

    augment("up", function (obj) {      //- client --> cloud transfer

        validate(obj);

        var target = db + obj['_id'],
            source = JSON.stringify(obj),
            msg = curl.PUT(target, source);

        return JSON.parse(msg);

    });

    augment("down", function (doc_id) { //- cloud --> client transfer

        var source = db + doc_id,
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

    augment("Doc", function () {        //- Constructor for new CouchDB docs

        var template = validate({}),    //- The '{}' will get validated twice,
            msg = Q.up(template);       //  but it's not a big deal right now. 

        if (msg.ok === 'false') {
            throw msg;
        }

        template['_rev'] = msg.rev;
        return template;

    });

    augment("reval", function (func, argarray) {
        argarray = argarray || [];
        var dQ = new Q.Doc(),
            id = dQ._id;
        localStorage[id] = func;        //- stringify the function
        dQ.code = '(' + localStorage[id] + ')' +
            '.apply(this, ' + JSON.stringify(argarray) + ')';
        Q.up(dQ);
        delete localStorage[id];
        console.log('Waiting for response ...');
        while (!dQ.results) {
            dQ = Q.down(id);
        }
        return dQ.results.stdout;
    });

}());

if (this.console) {
    console.log("Welcome to the Quanah Lab :-)");
}

//- vim:set syntax=javascript:
