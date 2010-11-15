//- JavaScript source code -- Web Workers only

//- bee-dev.js ~~
//  This is the Web Worker for Quanah's "local" execution context.
//                                                          ~~ SRW, 12 Nov 2010

importScripts("quanah.js");
quanah.merge(quanah, this);

onmessage = function (event) {

    try {
        var key = event.data.key,
            mode = event.data.mode,
            code = decodeURI(event.data.code),

            send_report = function () {
                postMessage({
                    key: event.data.key,
                    stdout: quanah.print() || [],
                    stderr: quanah.error() || []
                });
                quanah.reset();
            };

        if (mode === "local") {
            eval(code);
            send_report();
        }

        if (mode === "remote") {
            var obj = quanah.write({code: code, state: "waiting"}),
                check_back = function () {
                    var txt = quanah.read(obj),
                        ans = JSON.parse(txt);
                    if (ans.results === undefined) {
                        setTimeout(check_back, 5000);
                    } else {
                        quanah.print(ans);
                        send_report();
                    }
                };
            check_back();
        }

    } catch (err) {

        quanah.error(err);
        send_report();

    }

};

postMessage("Welcome to Quanah 1.0 :-)");

//- vim:set syntax=javascript:
