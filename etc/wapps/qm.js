//- wApps manifest file

//- qm.js ~~
//                                                      ~~ (c) SRW, 22 Mar 2013
//                                                  ~~ last updated 22 Mar 2013

/*global wApps: false */

wApps.manifest.apps.push({
    "name": "QMachine",
    "description": "Distributed Computing in JavaScript",
    "url": "https://www.qmachine.org/",
    "author": "Sean Wilkinson",
    "namespace": "QM",
    "buildUI": function (id) {
        'use strict';
        /*jslint browser: true, indent: 4, maxlen: 80 */
        var $ = window.jQuery;
        this.require('https://v1.qmachine.org/q.js', function () {
            $('#' + id).html([
                '<form>',
                '  <fieldset>',
                '    <legend>Options</legend>',
                '    <p>',
                '      <label for="QM-box-input">Box</label>',
                '      <input type="text" id="QM-box-input" ' +
                    '      pattern="^[\\w\\-]+" required size="32">',
                '      <br>',
                '      <label for="QM-volunteer-input">Volunteer</label>',
                '      <input type="checkbox" id="QM-volunteer-input">',
                '    </p>',
                '  </fieldset>',
                '</form>',
                '<textarea id="QM-journal" rows="10"></textarea>'
            ].join(''));
            var QM, jserr, jsout, state;
            QM = window.QM;
            jserr = function () {
             // This function provides an output logging mechanism for error
             // messages that doesn't totally shatter in old browsers.
                $('#QM-journal').append((new Date()) + ' ERROR: ' +
                    Array.prototype.join.call(arguments, ' ') + '\n');
                $('#QM-journal').animate({
                    scrollTop: $('#QM-journal')[0].scrollHeight -
                            $('#QM-journal').height()
                });
                return;
            };
            jsout = function () {
             // This function provides an output logging mechanism that doesn't
             // totally shatter in old browsers.
                $('#QM-journal').append((new Date()) + ' ' +
                    Array.prototype.join.call(arguments, ' ') + '\n');
                $('#QM-journal').animate({
                    scrollTop: $('#QM-journal')[0].scrollHeight -
                            $('#QM-journal').height()
                });
                return;
            };
            state = {};
            if (window.localStorage instanceof Object) {
             // Here, we load a user's previous settings if they are available.
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
             // This function synchronizes the jQuery object that represents
             // the input element directly with QM's `box` property using
             // Quanah's own event loop. Thankfully, this function won't
             // distribute to another machine because it closes over `document`
             // and `window`.
                if (document.activeElement.id !== 'QM-box-input') {
                    $('#QM-box-input').val(QM.box);
                }
                if (window.localStorage instanceof Object) {
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
                if ($('#QM-volunteer-input').is(':checked') === false) {
                 // Yes, you're right, it _does_ look inefficient to invoke
                 // jQuery more than once, but because `volunteer` calls itself
                 // recursively using `setTimeout`, using `$(this)` can do some
                 // pretty wacky stuff if you're not careful. I prefer this
                 // strategy it's simple :-)
                    window.clearTimeout(state.vol_timer);
                    return;
                }
                QM.volunteer(QM.box).on('error', function (message) {
                 // This function redirects "error" messages appropriately.
                    if (message === 'Nothing to do ...') {
                     // Back by popular demand ;-)
                        jsout(message);
                    } else {
                        jserr('Error:', message);
                    }
                    window.clearTimeout(state.vol_timer);
                    state.vol_timer = window.setTimeout(volunteer, 1000);
                    return;
                }).Q(function (evt) {
                 // This function provides visual feedback for debugging
                 // as soon as the volunteer finishes executing a task.
                    jsout('Done:', this.key);
                    window.clearTimeout(state.vol_timer);
                    state.vol_timer = window.setTimeout(volunteer, 1000);
                    return evt.exit();
                });
                return;
            });
            return;
        });
        return;
    }
});

wApps.manifest.authors.push({
    name: 'Sean Wilkinson',
    url: 'http://seanwilkinson.info'
});

//- vim:set syntax=javascript:
