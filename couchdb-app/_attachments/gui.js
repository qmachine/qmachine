//- JavaScript source code

//- gui.js ~~
//
//  This file contains the web app's interactive elements. I may eventually
//  move to jQuery, but for now this has been sufficient for Quanah's needs.
//
//                                                      ~~ (c) SRW, 02 Nov 2011

(function (global) {
    'use strict';

 // Assertions

    if (global.hasOwnProperty('window') === false) {
        throw new Error('The GUI targets web browsers only.');
    }

 // Private declarations

    var doh, nav, silencer, win;

 // Private definitions

    doh = global.alert;

    nav = global.navigator;

    silencer = function (evt) {
     // (placeholder)
    };

    win = global.window;

 // Private constructors (n/a)

 // Global definitions

    if (win.hasOwnProperty('applicationCache')) {
        win.applicationCache.oncached = silencer;
        win.applicationCache.onchecking = silencer;
        win.applicationCache.ondownloading = silencer;
        win.applicationCache.onerror = silencer;
        win.applicationCache.onnoupdate = silencer;
        win.applicationCache.onobsolete = silencer;
        win.applicationCache.onprogress = silencer;
        win.applicationCache.onupdateready = silencer;
    }

    win.onoffline = win.ononline = function (evt) {
        if (nav.onLine) {
            doh('Your computer is online.');
        } else {
            doh('Your computer is not online.');
        }
    };

 // That's all, folks!

    return;

}(function (outer_scope) {
    'use strict';
 // This strict anonymous closure is taken from my Web Chassis project.
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : outer_scope;
    } else {
        return (typeof this.global === 'object') ? this.global : this;
    }
}.call(null, this)));

//- vim:set syntax=javascript:
