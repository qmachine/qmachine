//- JavaScript source code -- Web Workers only

//- bee-vol.js ~~
//  This is the Web Worker for Quanah's "remote" execution context.
//                                                          ~~ SRW, 12 Nov 2010

importScripts("quanah.js");
quanah.merge(quanah, this);

try {

    var queue = bookmarks.db + "_changes?filter=quanah/waiting",
        waiting = quanah.read(queue),
        jobs = JSON.parse(waiting).results,

        index, next, obj, didsomething = false,

        send_report = function () {
            if (typeof obj === 'object') {
                obj.results = {
                    stdout: quanah.print() || [],
                    stderr: quanah.error() || []
                };
                quanah.write(obj);
                didsomething = true;
            }
        };

    if (jobs.length > 0) {

     // Don't worry about "locking" and check-outs and timeouts and whatnot --
     // just let volunteers accomplish things in a random order. This idea may
     // or may not end up being better, but at the moment it does prevent total
     // gridlock when the oldest task is going to take awhile. Meh ;-)

        index = Math.floor(Math.random() * jobs.length);
        next = jobs[index].id;
        obj = JSON.parse(quanah.read(bookmarks.db + next));
        eval(obj.code);
        obj.state = "done";
        send_report();

    }

} catch(err) {

    quanah.error(err);
    obj.state = "failed";
    send_report();

}

postMessage("Did something? " + didsomething);
close();

//- vim:set syntax=javascript:
