//- JavaScript source code

//- snapshot.js ~~
//
//  This program uses PhantomJS to load Q Machine's homepage and render it to a
//  particular file with a particular resolution. PhantomJS has changed its API
//  pretty drastically over the last few months, and that worries me a little
//  about the long-term usefulness of this particular program, but it was easy
//  to write, it's not needed that often, and it can be replaced if necessary
//  but similar tools like Selenium and Watir (to name a few).
//
//  NOTE: Q Machine uses the HTML5 Application Cache, and PhantomJS seems to
//  have trouble understanding it correctly. The "phantomjs-config.json" file
//  helps keep things from being cached, but if you find yourself needing to
//  clear the cache, you can find it in Mac OS X under
//      ~/Library/Application\ Support/Ofi\ Labs/PhantomJS/ .
//
//                                                      ~~ (c) SRW, 05 Apr 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */
    /*global phantom: false */

 // Prerequisites

    if (phantom.args.length !== 2) {
        global.console.log('Usage: phantomjs snapshot.js WxH outfile');
        return phantom.exit(1);
    }

 // Declarations

    var address, output, page, size;

 // Definitions

    address = 'http://qmachine.org/?token=phantomjs';

    output = phantom.args[1];

    page = new global.WebPage();

    size = phantom.args[0].split('x');

    page.viewportSize = {
        width:  size[0],
        height: size[1]
    };

 // Invocations

    page.open(address, function (status) {
     // This function needs documentation.
        if (status !== 'success') {
            global.console.log('Unable to load "' + address + '".');
            return phantom.exit(1);
        }
        global.window.setTimeout(function () {
         // This function needs documentation.
            global.console.log('Rasterizing to "' + output + '" ...');
            page.render(output);
            global.console.log('Done.');
            return phantom.exit();
        }, 200);
        return;
    });

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (outer_scope) {
    'use strict';
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : outer_scope;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
