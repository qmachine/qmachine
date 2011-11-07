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

    var silencer, window;

 // Private definitions

    silencer = function (evt) {
     // (placeholder)
    };

    window = global.window;

 // Private constructors

 // Global definitions

    if (window.hasOwnProperty('applicationCache')) {
        window.applicationCache.oncached = silencer;
        window.applicationCache.onchecking = silencer;
        window.applicationCache.ondownloading = silencer;
        window.applicationCache.onerror = silencer;
        window.applicationCache.onnoupdate = silencer;
        window.applicationCache.onobsolete = silencer;
        window.applicationCache.onprogress = silencer;
        window.applicationCache.onupdateready = silencer;
    }

    window.onoffline = window.ononline = function (evt) {
        console.log('Are we online? ' + navigator.onLine);
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
