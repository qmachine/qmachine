//- JavaScript source code

//- main.js ~~
//
//  This program's main purpose is to provide interaction for the graphical
//  user interface (GUI) component of the browser client -- the webpage. It is
//  not intended to be an integrated development environment (IDE), however!
//  The most important part of QMachine's browser client is the "qm.js" script,
//  which is loaded dynamically after the webpage has loaded. Ultimately, this
//  script will be concatenated and/or minified with jQuery and Bootstrap to
//  produce "homepage.js", which is loaded by the webpage using a script tag:
//
//      <script async defer src="./homepage.js"></script>
//
//  I will describe the rationale behind these design decisions here soon :-)
//
//  KNOWN ISSUES:
//      https://bugzilla.mozilla.org/show_bug.cgi?id=756028
//
//                                                      ~~ (c) SRW, 23 May 2012
//                                                  ~~ last updated 11 Nov 2014

(function () {
    'use strict';

 // Pragmas

    /*global google: false */

    /*jshint maxparams: 2, quotmark: single, strict: true */

    /*jslint browser: true, devel: true, indent: 4, maxlen: 80 */

    /*properties
        activeElement, ajax, alert, append, arrayToDataTable, avar,
        backgroundColor, blur, box, c, cache, call, callback, calls, colorAxis,
        colors, console, countries, datalessRegionColor, dataType, document,
        draw, error, f, focus, GeoChart, getItem, hasOwnProperty, id, is, join,
        jQuery, keepAspectRatio, legend, length, load, localStorage, log, on,
        onreadystatechange, open, packages, parse, preventDefault, projection,
        prototype, Q, QM, 'QM-total-calls', 'QM-total-countries', ready,
        readyState, region, replace, responseText, revive, search, send,
        setItem, setRequestHeader, slice, sort, start, status, statusText,
        stay, stop, success, text, toString, url, v, val, value, visualization,
        which, width
    */

 // Prerequisites

    if (window.hasOwnProperty('jQuery') === false) {
        throw new Error('jQuery is missing.');
    }

 // Declarations

    var $, add_commas, convert_to_rank, detect, get_data, is_Function, jserr,
        main, options, sync_country_names, update_html_spans, update_summary;

 // Definitions

    $ = window.jQuery;

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

    detect = function (feature_name) {
     // This function is a high-level feature detection abstraction that helps
     // make the rest of the program logic read like English.
        var flag = false;
        if (feature_name === 'console.error') {
            flag = ((window.console instanceof Object) &&
                    (is_Function(window.console.error)));
        } else if (feature_name === 'console.log') {
            flag = ((window.console instanceof Object) &&
                    (is_Function(window.console.log)));
        } else if (feature_name === 'localStorage') {
         // HTML5 localStorage object
            flag = (window.localStorage instanceof Object);
        }
        return flag;
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

    is_Function = function (f) {
     // This function returns `true` only if and only if `f` is a function.
     // The second condition is necessary to return `false` for a regular
     // expression in some of the old browsers.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    jserr = function () {
     // This function provides an output logging mechanism for error messages
     // that doesn't totally shatter in old browsers.
        if (detect('console.error')) {
            window.console.error(Array.prototype.join.call(arguments, ' '));
        }
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
            $('#world-map-caption').append([
                '<br>',
                'Darker shades of green indicate greater numbers of API calls.'
            ].join(''));
            return;
        });
        return;
    };

    options = {
        backgroundColor: '#66CCFF',
        colorAxis: {
            colors: [
             // These are "stolen" from the "rworldmap" package.
                '#00441B', '#006D2C', '#238B45', '#41AB5D', '#74C476',
                '#A1D99B', '#C7E9C0', 'white'
            ]
        },
     // Political issues with Palestine (PS) cause quirks in the Google
     // Visualization API that we sweep under the rug by simply whiting it out.
     // Using "red" here helps you check your data, though.
        datalessRegionColor: 'white',
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
        n = data.length;
        total = {
            calls: 0,
            countries: 0
        };
        for (i = 1; i < n; i += 1) {
            if (data[i][1] > 0) {
                total.calls += data[i][1];
                total.countries += 1;
            }
        }
        update_html_spans({
            'QM-total-calls': add_commas(total.calls) +
                    ((total.calls === 1) ? ' call' : ' calls'),
            'QM-total-countries': add_commas(total.countries) +
                    ((total.countries === 1) ? ' country' : ' countries')
        });
        return;
    };

 // Invocations

    $(window.document).ready(function () {
     // This function runs when jQuery decides that the DOM is ready.
        /*jslint unparam: true */
        if (window.hasOwnProperty('google')) {
            google.load('visualization', '1', {
                'callback': main,
                'packages': ['geochart']
            });
        }
        $.ajax({
            url: 'qm.js',
            cache: true,
            dataType: 'script',
            success: function () {
             // This function runs after "qm.js" has loaded successfully.
                var QM = window.QM;
                if (detect('localStorage')) {
                 // Here, we load a user's previous settings if they are
                 // available.
                    if (window.localStorage.hasOwnProperty('QM_box')) {
                        QM.box = window.localStorage.getItem('QM_box');
                    }
                }
                $(window).on('blur focus', QM.revive);
                $('#QM-box-input').on('blur', function () {
                 // This function doesn't work well in web workers due to the
                 // `alert`, but they aren't a priority right now. The idea
                 // here is to try to assign the new value of the input box to
                 // `QM.box` and capture the error that will be thrown if the
                 // value is invalid. Then, we want to notify the user about
                 // the problem and let them try again.
                    try {
                        QM.box = this.value;
                    } catch (err) {
                        window.alert(err);
                        this.value = QM.box;
                        $(this).focus();
                    }
                    QM.revive();
                    return;
                }).on('keydown', function (evt) {
                 // This function runs while the text field is active, whenever
                 // a key is pressed down (but before the key comes back up).
                    if (evt.which === 13) {
                        evt.preventDefault();
                        $(this).blur();
                    }
                    QM.revive();
                    return;
                });
                QM.avar().Q(function (evt) {
                 // This function synchronizes the jQuery object that
                 // represents the input element directly with QM's `box`
                 // property using Quanah's own event loop. Thankfully, this
                 // function won't distribute to another machine because it
                 // closes over `detect`.
                    if (document.activeElement.id !== 'QM-box-input') {
                        $('#QM-box-input').val(QM.box);
                    }
                    if (detect('localStorage')) {
                     // We assume here that HTML5 localStorage has not been
                     // tampered with. Super-secure code isn't necessary here
                     // because the value of `QM.box` is already "publicly"
                     // available anyway.
                        window.localStorage.setItem('QM_box', QM.box);
                    }
                    return evt.stay('This task repeats indefinitely.');
                }).on('error', function (message) {
                 // This just forwards to the `jserr` function of "main.js".
                    jserr('Error:', message);
                    return;
                });
                $('#QM-volunteer-input').on('click', function volunteer() {
                 // This function runs every time the checkbox is clicked.
                    if ($('#QM-volunteer-input').is(':checked')) {
                        QM.start();
                    } else {
                        QM.stop();
                    }
                    return;
                });
                return;
            }
        });
        return;
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
