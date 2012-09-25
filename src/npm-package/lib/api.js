//- JavaScript source code

//- api.js ~~
//                                                      ~~ (c) SRW, 16 Sep 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var API, api, corser, http;

 // Definitions

    API = function () {
     // This function needs documentation.
        var that = this;
        that.rules = [];
        return that;
    };

    api = function (obj) {
     // This function needs documentation.
        return new API(obj);
    };

    corser = require('corser');

    http = require('http');

 // Prototype definitions

    API.prototype.def = function (obj) {
     // This function needs documentation.
        //  1.  Validate input.
        //  2.  Ensure the rule hasn't already been added. (TO-DO!)
        //  3.  Add the rule.
        if ((obj instanceof Object) === false) {
            throw new TypeError('Input argument must be an object.');
        }
        if (obj.hasOwnProperty('handler') === false) {
            throw new Error('No "handler" property specified.');
        }
        if (obj.hasOwnProperty('method') === false) {
            throw new Error('No "method" property specified.');
        }
        if (obj.hasOwnProperty('pattern') === false) {
            throw new Error('No "pattern" property specified.');
        }
        this.rules.push(obj);
        return this;
    };

    API.prototype.launch = function (obj) {
     // This function needs documentation.
        if (this.hasOwnProperty('server')) {
            return;
        }
        if ((obj instanceof Object) === false) {
            throw new TypeError('Input argument must be an object.');
        }
        if (obj.hasOwnProperty('hostname') === false) {
            throw new Error('No "hostname" property specified.');
        }
        if (obj.hasOwnProperty('port') === false) {
            throw new Error('No "port" property specified.');
        }
        var enable_cors, that;
        enable_cors = corser.create({});
        that = this;
        that.server = http.createServer(function (req, res) {
         // This function needs documentation.
            enable_cors(req, res, function () {
             // This function needs documentation.
                var flag, i, n, params, rule, url;
                flag = false;
                n = that.rules.length;
                url = req.url;
                for (i = 0; (flag === false) && (i < n); i += 1) {
                    rule = that.rules[i];
                    if ((req.method === rule.method) &&
                            (rule.pattern.test(url))) {
                        flag = true;
                        params = url.match(rule.pattern).slice(1);
                        rule.handler(req, res, params);
                    }
                }
                if (flag === true) {
                    return;
                }
                res.writeHead(444);
                res.end();
                return;
            });
            return;
        });
        that.server.listen(obj.port, obj.hostname);
        return;
    };

 // Out-of-scope definitions

    exports.create = api;

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
