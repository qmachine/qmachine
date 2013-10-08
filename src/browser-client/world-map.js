//- JavaScript source code

//- world-map.js ~~
//                                                      ~~ (c) SRW, 11 Sep 2013
//                                                  ~~ last updated 08 Oct 2013

(function () {
    'use strict';

 // Pragmas

    /*global $: false, google: false */

    /*jslint browser: true, devel: true, indent: 4, maxlen: 80 */

 // Declarations

    var add_commas, convert_to_rank, get_data, main, options,
        sync_country_names, update_html_spans, update_summary;

 // Definitions

    add_commas = function (n) {
     // This function adds commas to numbers to make things pretty.
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    convert_to_rank = function (x) {
     // This function sorts the input data from greatest to least by hits and
     // assigns a rank to each row as that row's index in the sorted dataset,
     // ties having been taken into account.
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
        y = [['Country', 'Rank', 'API calls']];
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
        req.open('GET', './hits-by-country.json' + location.search, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(null);
        return;
    };

    main = function () {
     // This function needs documentation.
        if (google.visualization === undefined) {
            return;
        }
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
            update_summary(data);
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
        datelessRegionColor: 'red', // so we'll notice problems immediately
        keepAspectRatio: true,
        legend: 'none',
        projection: {
            //name:'kavrayskiy-vii'
        },
        region: 'world',
        width: '100%'
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
                    x[i].c[2].f = add_commas(x[i].c[2].v);
                }
            }
        }
        return;
    };

    update_html_spans = function (obj) {
     // This function updates the content of HTML span elements that share ids
     // with property names of the input argument `obj`.
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                $('#' + key).text(obj[key]);
            }
        }
        return;
    };

    update_summary = function (data) {
     // This function needs documentation.
        var i, n, total;
        n = data.length - 1;
        total = {
            calls: 0,
            countries: 0
        };
        for (i = 0; i < n; i += 1) {
            if (data[i][1] > 0) {
                total.calls += data[i][1];
                total.countries += 1;
            }
        }
        update_html_spans({
            'qm-total-calls': add_commas(total.calls) +
                    ((total.calls === 1) ? ' call' : ' calls'),
            'qm-total-countries': add_commas(total.countries) +
                    ((total.countries === 1) ? ' country' : ' countries')
        });
        return;
    };

 // Invocations

    $(document).ready(function () {
     // This function will fix the asynchronous loading issues, I hope ...
        if (window.hasOwnProperty('google')) {
            google.load('visualization', '1', {
                'callback': main,
                'packages': ['geochart']
            });
        }
        return;
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
