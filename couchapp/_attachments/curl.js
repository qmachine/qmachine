//- JavaScript source code

//- curl.js ~~
//  An experimental new version of my 'curl' object that uses XMLHttpRequest
//  for asynchronous transfer of files. The main difference is callbacks:
//      var x;
//      curl.GET("http://quanah.couchone.com/_uuids", function (response) {
//          x = JSON.parse(response);
//      });
//  I'm not sure it's useful for Quanah, though.
//                                                          ~~ SRW, 28 Aug 2010

if (!this.curl) {                       //- Check for existence
    var curl = {};
}

(function () {                          //- Build inside an anonymous closure

//- PRIVATE MEMBERS

    var augment = function (branch, definition) {
            if (typeof curl[branch] !== 'function') {
                curl[branch] = definition;
            }
        };

//- PUBLIC MEMBERS

    augment('GET', function (URL, callback) {

        //- need to validate parameters ...

        var request = new XMLHttpRequest();

        if (callback === undefined) {
            request.open('GET', URL, false);    //- synchronous
            request.send(null);
            return request.responseText;
        } else {
            request.open('GET', URL, true);     //- AJAX
            request.onreadystatechange = function (aEvt) {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        callback(request.responseText);
                    } else {
                        callback("Error: Failed to load " + URL + " .");
                    }
                }
            };
            request.send(null);
        }

    });

    augment('DELETE', function (URL, callback) {

        //- need to validate parameters ...

        var request = new XMLHttpRequest();

        if (callback === undefined) {
            request.open('GET', URL, false);    //- synchronous
            request.send(null);
            return request.responseText;
        } else {
            request.open('GET', URL, true);     //- AJAX
            request.onreadystatechange = function (aEvt) {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        callback(request.responseText);
                    } else {
                        callback("Error: Failed to load " + URL + " .");
                    }
                }
            };
            request.send(null);
        }

    });

    augment('PUT', function (URL, data, callback) {

        //- need to validate parameters ...

        var request = new XMLHttpRequest();

        if (callback === undefined) {
            request.open('PUT', URL, false);    //- synchronous
            request.setRequestHeader("Content-type", "application/json");
            request.send(data);
            return request.responseText;
        } else {
            request.open('PUT', URL, true);     //- AJAX
            request.setRequestHeader("Content-type", "application/json");
            request.onreadystatechange = function (aEvt) {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        callback(request.responseText);
                    } else {
                        callback("Error: Failed to transfer to " + URL + " .");
                    }
                }
            };
            request.send(data);
        }

    });

}());

//- vim:set syntax=javascript:
