//- JavaScript source code

//- manifest.js ~~
//
//  Ideally, we would use 'http://qmachine.org/q.js' as the download URL, but
//  due to Google Chrome's new Content Security Policy for packaged apps and
//  its amazing hatred for plain ol' HTTP protocol, we have to use Dropbox ...
//
//                                                      ~~ (c) SRW, 11 Jul 2012

/*jslint indent: 4, maxlen: 80 */
/*global manifest: false */

manifest([
    {
        "author": "Sean Wilkinson",
        "name": "QMachine",
        "description": "The World's Most Relaxed Supercomputer",
        "url": "https://dl.dropbox.com/s/ydymopr7xehvv9z/q.js"
    }
]);

//- vim:set syntax=javascript:
