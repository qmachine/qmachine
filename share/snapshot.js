//- JavaScript source code

//- snapshot.js ~~
//
//  This program uses PhantomJS to load QMachine's homepage and render it to a
//  particular file with a particular resolution. PhantomJS has changed its API
//  pretty drastically over the last few months, and that worries me a little
//  about the long-term usefulness of this particular program, but it was easy
//  to write, it's not needed that often, and it can be replaced if necessary.
//
//  NOTE: QMachine formerly used the HTML5 Application Cache, and PhantomJS
//  seems to have trouble understanding it correctly. A "phantomjs-config.json"
//  file helps keep things from being cached, but if you find yourself needing
//  to clear the cache, you can find it in Mac OS X under
//
//      ~/Library/Application\ Support/Ofi\ Labs/PhantomJS/ .
//
//                                                      ~~ (c) SRW, 19 Sep 2012
//                                                  ~~ last updated 10 Feb 2013

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

    /*global phantom: false, require: false */

 // Prerequisites

    if (phantom.args.length !== 3) {
        global.console.log('Usage: phantomjs snapshot.js url WxH outfile');
        return phantom.exit(1);
    }

 // Declarations

    var address, output, page, size;

 // Definitions

    address = phantom.args[0];

    output = phantom.args[2];

    page = require('webpage').create();

    size = phantom.args[1].split('x');

 // Invocations

    page.viewportSize = {
        width:  size[0],
        height: size[1]
    };

    page.onConsoleMessage = function (message) {
     // This function ignores the console message and instead uses the event
     // itself as a trigger to render the page as a rasterized image.
        global.console.log('Rasterizing to "' + output + '" ...');
        page.render(output);
        global.console.log('Done.');
        return phantom.exit();
    };

    page.onError = function (message) {
     // This function just helps me debug if/when things go awry.
        global.console.error('Error:', message);
        return phantom.exit(1);
    };

    page.open(address, function f(status) {
     // This function will be executed by PhantomJS.
        if (status !== 'success') {
            global.console.log('Unable to load "' + address + '".');
            return phantom.exit(1);
        }
        global.console.log('Page has loaded ...');
        page.evaluate(function f() {
         // This function will be executed by the webpage, not by PhantomJS.
            /*jslint browser: true */
            if (window.hasOwnProperty('QM') === false) {
                window.setTimeout(f, 0);
                return;
            }
            window.QM.box = 'hi-mom';
            window.console.log('`QM.box` === ' + window.QM.box + ' :-)');
            return;
        });
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
