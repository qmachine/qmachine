// BROWSER ONLY!

// curl.js --
//  A JavaScript object I wrote that mimics 'curl' using nothing more than XHR.
//  In its current form, however, I don't think it uses asynchronous transfer.
//                                                          -- SRW, 03 Jul 2010

if (!this.curl) {                       // Check for existence
    var curl = {};
}

(function () {                          // Build it inside an anonymous closure

 // PRIVATE MEMBERS

        template = function (action) {
            return function (URL, data) {
                URL = URL || "";    // totally unnecessary, probably ...
                data = data || {};
                var req = new XMLHttpRequest();
                req.open(action, URL, false);
                if (action === "PUT" || action === "POST") {
                    req.setRequestHeader("Content-type", "application/json");
                    //if (action === "POST") {
                    //    req.setRequestHeader("Content-length", data.length);
                    //    req.setRequestHeader("Connection", "close");
                    //}
                    req.send(data);
                } else {
                    req.send(null);
                }
                return req.responseText;
            };
        };

 // PUBLIC MEMBERS

    curl.GET = template("GET");
    curl.PUT = template("PUT");
    curl.DELETE = template("DELETE");   // should be okay ...
    curl.POST = template("POST");

}());
