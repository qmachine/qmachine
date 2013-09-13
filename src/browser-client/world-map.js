//- JavaScript source code

//- world-map.js ~~
//                                                      ~~ (c) SRW, 11 Sep 2013
//                                                  ~~ last updated 12 Sep 2013

(function () {
    'use strict';

 // Pragmas

    /*global $: false, google: false */

    /*jslint browser: true, devel: true, indent: 4, maxlen: 80 */

 // Declarations

    var convert_to_rank, get_data, main, options, sync_country_names;

 // Definitions

    convert_to_rank = function (x) {
     // This function sorts the input data from greatest to least by hits and
     // assigns a rank to each row as that row's index in the sorted dataset.
     // Currently, this function does not attempt to note ties, but I plan to
     // add that at the same time that I begin providing country codes for the
     // countries that have not recorded any hits yet.
        var i, n, ranks, temp, y;
        ranks = {};
        temp = x.slice(1).sort(function (a, b) {
         // This function needs documentation.
            return (a[1] < b[1]) ? 1 : -1;
        });
        n = temp.length;
        for (i = 0; i < n; i += 1) {
            if (ranks.hasOwnProperty(temp[i][1]) === false) {
                ranks[temp[i][1]] = i + 1;
            }
        }
        y = [['Country', 'Rank', 'Hits']];
        for (i = 0; i < n; i += 1) {
            y[i + 1] = [temp[i][0], ranks[temp[i][1]], temp[i][1]];
        }
        return y;
    };

    get_data = function (callback) {
     // This function just wraps a bare AJAX call and provides a callback
     // interface. I will wrap it with a `jQuery.ajax` call as soon as their
     // documentation site comes back online ...
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
         // This function needs documentation.
            if (req.readyState === 4) {
                if (req.status === 200) {
                    callback(null, JSON.parse(req.responseText));
                } else {
                    callback(new Error(req.statusText), null);
                }
            }
            return;
        };
        req.open('GET', '/hits-by-country.json' + location.search, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(null);
        return;
    };

    main = function () {
     // This function needs documentation.
        var geochart = new google.visualization.GeoChart($('#world-map')[0]);
        get_data(function (err, data) {
         // This function needs documentation.
            if (err !== null) {
                console.error('Error:', err);
                return;
            }
            var sorted, table;
            sorted = convert_to_rank(data);
            table = google.visualization.arrayToDataTable(sorted);
            sync_country_names(data, table);
            geochart.draw(table, options);
         /*
            if (location.search !== '?stale_ok=false') {
                $('#big-container')
                    .append('<a href="?stale_ok=false">view latest</a>');
            }
         */
            return;
        });
        return;
    };

    options = {
        backgroundColor: '#428BCA', // '#5592CC'
        colorAxis: {
            colors: [
             // These are "stolen" from the "rworldmap" package.
                '#00441B', '#006D2C', '#238B45', '#41AB5D', '#74C476',
                '#A1D99B', '#C7E9C0', 'white'
            ]
        },
        legend: 'none'
    };

    sync_country_names = function (data, table) {
     // This function hacks the Google Visualization API itself by attempting
     // to deduce which jacked-up property name of the table object actually
     // corresponds to the property that contains the row data. We can't rely
     // on a certain property name to reference the row data because Google
     // minifies things in an effort to keep us all *out*.
     //
     // NOTE: This function mutates `table` in-place by taking advantage of the
     // fact that JavaScript passes objects by reference.
     //
        var key, i, j, m, n, x;
        m = data.length - 1;
        n = data.length;
        for (key in table) {
            if ((table.hasOwnProperty(key)) && (table[key] instanceof Array)) {
                if (table[key].length === m) {
                    x = table[key];
                }
            }
        }
        for (i = 0; i < m; i += 1) {
            for (j = 1; j < n; j += 1) {
             // The `f` and `v` properties seem to be part of the API, and they
             // appear to stand for "format" and "value" ...
                if (x[i].c[0].v === data[j][0]) {
                    x[i].c[0].f = data[j][2];
                }
            }
        }
        return;
    };

 // Invocations

    //google.load('visualization', '1', {'packages': ['geochart']});
    google.setOnLoadCallback(main);

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
