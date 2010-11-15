//- JavaScript source code -- Web Workers only

//- bee-vol.js ~~
//  This is the Web Worker for Quanah's "remote" execution context.
//                                                          ~~ SRW, 12 Nov 2010

importScripts("quanah.js");
quanah.merge(quanah, this);

try {

    var queue = bookmarks.db + "_changes?filter=quanah-rc/waiting",
        waiting = quanah.read(queue),
        jobs = JSON.parse(waiting).results,

        next, obj, didsomething = false,

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

        next = jobs[0].id;
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
