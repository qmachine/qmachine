//- JavaScript source code

//- snapshot.js ~~
//
//  This program uses PhantomJS to load Quanah's homepage and render it to a
//  particular file with a particular resolution. PhantomJS has changed its API
//  pretty drastically over the last few months, and that worries me a little
//  about the long-term usefulness of this particular program, but it was easy
//  to write, it's not needed that often, and it can be replaced if necessary
//  but similar tools like Selenium and Watir (to name a few).
//
//                                                      ~~ (c) SRW, 02 Sep 2011

(function (argv) {
    "use strict";

    if (argv.length !== 2) {
        console.log("Usage: phantomjs snapshot.js WIDTHxHEIGHT outfile");
        phantom.exit(1);
    }

    var address, output, page, size;

    address = "http://localhost/";

    output = argv[1];

    page = new WebPage();

    size = argv[0].split("x");

    page.viewportSize = {
        width:  size[0],
        height: size[1]
    };

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load "' + address + '".');
            phantom.exit(1);
        } else {
            window.setTimeout(function () {
                console.log('Rasterizing to "' + output + '" ...');
                page.render(output);
                console.log("Done.");
                phantom.exit();
            }, 200);
        }
    });

}(phantom.args));

//- vim:set syntax=javascript:
