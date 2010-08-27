//- JavaScript source code

//- curl.js ~~
//  A JavaScript object that mimics 'curl' using nothing more than XHR. It uses
//  synchronous (non-AJAX) transfer, and it returns 'req.responseText' instead
//  of 'responseXML', which allows it to work correctly in both the Browser and
//  Worker contexts.
//                                                          ~~ SRW, 03 Jul 2010

if (!this.curl) {                       //- Check for existence
    var curl = {};
}

(function () {                          //- Build it inside an anonymous closure

//- PRIVATE MEMBERS

    var template = function (action) {
            return function (URL, data) {
                URL = URL || "";
                data = data || "{}";
                var req = new XMLHttpRequest();
                req.open(action, URL, false);
                if (action === "PUT") {
                    req.setRequestHeader("Content-type", "application/json");
                    req.send(data);
                } else {
                    req.send(null);
                }
                return req.responseText;
            };
        };

//- PUBLIC MEMBERS

    if (typeof curl.GET !== 'function') {
        curl.GET = template("GET");
    }

    if (typeof curl.PUT !== 'function') {
        curl.PUT = template("PUT");
    }

}());

//- vim:set syntax=javascript:
