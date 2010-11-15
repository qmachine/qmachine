//- JavaScript source code

//- launch.js ~~
//  This defines the client-side framework for Quanah, but it does not contain
//  any library functions for users to import into their own programs. None of
//  this code depends directly on CouchDB, but it does depend on "quanah.js".
//                                                          ~~ SRW, 12 Nov 2010

//- DEPENDENCIES: quanah.js

if (this.launch === undefined) {
    var launch = {};
}

if (this.dictionary === undefined) {
    var dictionary = {};
}

(function () {

//- PRIVATE DEFINITIONS -- these are confined to this anonymous closure.

//- PUBLIC DEFINITIONS -- these will be persistent outside this closure.

    launch.Worker = function (url, func) {
        if (typeof window.Worker !== 'function') {
            document.body.innerHTML += '<div>Your browser does not support ' +
                'the Web Worker object required by Quanah.</div><div>Please ' +
                'see the <a href="faq.html">FAQ</a> for more info.</div>';
            return;
        }
        func = func || function () {};
        var sisyphus = function () {
                var worker = new Worker(url);
                worker.onmessage = function (event) {
                    if (func(event) === true) {
                        setTimeout(sisyphus, 5000);
                    }
                };
                return worker;
            };
        return sisyphus();
    };

//- DEVELOPER SETUP -//

    launch.developer = function () {

        var bee = launch.Worker('bee-dev.js', function (event) {
                if (event.data.key !== undefined) {
                    var key = event.data.key,
                        stdout = event.data.stdout,
                        stderr = event.data.stderr;
                    dictionary[key].results = stdout.concat(stderr);
                    if (stderr.length > 0) {
                        quanah.error('New results: dictionary["%s"] = %o',
                            key, dictionary[key]);
                    } else {
                        quanah.print('New results: dictionary["%s"] = %o',
                            key, dictionary[key]);
                    }
                    return;
                }
                quanah.print(event.data);
                return false;           //- "true" ==> launch a new Web Worker
            }),

            uuid = function () {        //- a quick replacement for host/_uuids
                var new_id = ((Math.random()).toString()).split('.')[1];
                if (dictionary[new_id] === undefined) {
                    dictionary[new_id] = {
                        results: null   //- placeholder that can be tested
                    };
                    return new_id;
                }
                return uuid();          //- if it wasn't unique, keep trying!
            };

        launch.job = function (code, mode) {
            mode = mode || "local";
            var key = uuid();
            bee.postMessage({
                key: key,
                mode: mode,
                code: encodeURI(code)
            });
            return dictionary[key];
        };

        launch.button = function () {
            var editor = document.getElementById("editor"),
                code = editor.codebox.value,
                mode = editor.devmode.value;
            launch.job(code, mode);
        };

    };

//- VOLUNTEER SETUP -//

    launch.volunteer = function () {
        document.body.innerHTML += "<div>Thanks for helping out!</div>";
        quanah.print(quanah.tic());
        var toc = quanah.toc;
        launch.Worker("bee-vol.js", function (event) {
            quanah.print("+ " + toc() + ": " + event.data);
            return true;                //- "true" ==> launch a new Web Worker
        });
    };

})();

//- vim:set syntax=javascript:
