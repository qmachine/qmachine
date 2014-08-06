//- JavaScript source code

//- check-versions.js ~~
//
//  This is a Node.js program that checks for mistakes in "semantic versioning"
//  due simply to human oversight. Semantic versioning is a nice idea, but it
//  can be a really big pain sometimes.
//
//  NOTE: Should we also check Git tags in this script?
//
//                                                      ~~ (c) SRW, 31 Aug 2013
//                                                  ~~ last updated 05 Aug 2014

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true, nomen: true */

 // Declarations

    var check_bower_package, check_chrome_hosted_app, check_docs,
        check_homepage, check_npm_module, check_ruby_gem, check_web_service,
        current_version, fs;

 // Definitions

    check_bower_package = function () {
     // This function checks the configuration files for Twitter Bower.
        var filename = __dirname + '/../src/browser-client/bower.json';
        fs.readFile(filename, function (err, result) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            var config = JSON.parse(result);
            if (current_version === undefined) {
                current_version = config.version;
            }
            if (config.version !== current_version) {
                throw new Error('Version mismatch for Bower');
            }
            return;
        });
        return;
    };

    check_chrome_hosted_app = function () {
     // This function checks the package manifest file for Chrome Web Store.
        var config = require('../src/chrome-hosted-app/manifest.json');
        if (current_version === undefined) {
            current_version = config.version;
        }
        if (config.version !== current_version) {
            throw new Error('Version mismatch for Chrome Web Store');
        }
        return;
    };

    check_docs = function () {
     // This function checks the Sphinx configuration file.
        var filename = __dirname + '/../docs/conf.py';
        fs.readFile(filename, function (err, result) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            var conf, pattern1, pattern2, release, r_v, version;
            conf = result.toString();
            pattern1 = /\nrelease = ['"]([0-9]+\.[0-9]+)\.([0-9]+)['"]\n/;
            pattern2 = /\nversion = ['"]([0-9]+\.[0-9]+)['"]\n/;
            if (pattern1.test(conf) === false) {
                throw new Error('No "release" specified in Sphinx config');
            }
            if (pattern2.test(conf) === false) {
                throw new Error('No "version" specified in Sphinx config');
            }
            release = conf.match(pattern1).slice(1).join('.');
            r_v = conf.match(pattern1)[1];
            version = conf.match(pattern2)[1];
            if (r_v !== version) {
                console.log(r_v, version);
                throw new Error('release/version mismatch in Sphinx config');
            }
            if (current_version === undefined) {
                current_version = release;
            }
            if (release !== current_version) {
                throw new Error('Version mismatch for Sphinx config');
            }
            return;
        });
        return;
    };

    check_homepage = function () {
     // This function checks the configuration file for Mozilla's Firefox
     // Marketplace.
        var filename = __dirname + '/../src/homepage/manifest.webapp';
        fs.readFile(filename, function (err, result) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            var config = JSON.parse(result);
            if (current_version === undefined) {
                current_version = config.version;
            }
            if (config.version !== current_version) {
                throw new Error('Version mismatch for Firefox Marketplace');
            }
            return;
        });
        return;
    };

    check_npm_module = function () {
     // This function checks the package manifest file for Node Package Manager
     // (NPM).
        var config = require('../src/npm-module/package.json');
        if (current_version === undefined) {
            current_version = config.version;
        }
        if (config.version !== current_version) {
            throw new Error('Version mismatch for NPM module');
        }
        return;
    };

    check_ruby_gem = function () {
     // This function checks the "gemspec" for Rubygems. This is actually a
     // really tough problem if you want to solve it correctly (see
     // http://git.io/xUnKYA), but by setting conventions, it's a really easy
     // problem :-P
        var filename = __dirname + '/../src/ruby-gem/qm.gemspec';
        fs.readFile(filename, function (err, result) {
         // This function needs documentation.
            if (err !== null) {
                throw err;
            }
            result.toString().split('\n').forEach(function (line) {
             // This function needs documentation.
                var temp, version;
                temp = line.trim().split('=');
                if (temp[0].trim() !== 'spec.version') {
                    return;
                }
                version = temp[1].trim().slice(1, -1);
                if (current_version === undefined) {
                    current_version = version;
                }
                if (current_version !== version) {
                    throw new Error('Version mismatch for Ruby gem');
                }
                return;
            });
            return;
        });
        return;
    };

    check_web_service = function () {
     // This function checks to make sure that the package manifest file for
     // the private "web-service" NPM module keeps pace with the "qm" module.
        var config, err;
        config = require('../src/web-service/package.json');
        err = new Error('Version mismatch for web service');
        if (current_version === undefined) {
            current_version = config.version;
        }
        if ((config.dependencies.qm !== current_version) &&
                (config.dependencies.qm !== 'qmachine/qm-nodejs')) {
            throw err;
        }
        if (config.version !== current_version) {
            throw err;
        }
        return;
    };

    fs = require('fs');

 // Out-of-scope definitions

    process.on('exit', function (code) {
     // This function will run just before the script exits.
        if (code === 0) {
            console.log('Success: all versions match ' + current_version + '.');
        }
        return;
    });

 // Invocations

    check_bower_package();
    check_chrome_hosted_app();
    check_docs();
    check_homepage();
    check_npm_module();
    check_ruby_gem();
    check_web_service();

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
