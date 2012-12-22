QMachine
=========

[QMachine](https://www.qmachine.org) is a web service that uses
[Quanah](http://wilkinson.github.com/quanah) to act as a "supercomputer" that
distributes computations across web browsers using only
[Node.js](http://nodejs.org) and [Apache CouchDB](http://couchdb.apache.org/).
My original reasons for using Node.js was the lack of support for
[CORS](http://www.w3.org/TR/cors/) in CouchDB as well as a small quirk in its
redirect handling; otherwise, it would be completely sufficient to implement
the QMachine API. The silver lining, however, is that I was able to extend the
CORS-enabled proxy I wrote with Node.js so that it can then be bound
to other databases like [MongoDB](http://www.mongodb.org/),
[PostgreSQL](http://www.postgresql.org), [Redis](http://redis.io), and
[SQLite](http://www.sqlite.org). Keep in mind that QM is a research project and
thus bindings is still experimental! Thus, I do not promise anything to work
until after I finish the academic papers I am writing about QMachine ;-)

As in all my projects, the best documentation is contained inline as comments
within the source code. I have written some tutorials recently, and I do plan
to release them sometime in the near future.

There are several "mirrors" available on
[Bitbucket](https://bitbucket.org/wilkinson/qmachine),
[GitHub](https://github.com/wilkinson/qmachine), and
[Google Code](https://qmachine.googlecode.com).

A Node.js module can be installed via [NPM](https://npmjs.org/package/qm).

I have done some preliminary investigation into app integration for

-   [Google Chrome](https://chrome.google.com/webstore/detail/meagomakeegjimdibmlodmilfhplkjgp?utm_source=chrome-ntp-icon)
-   [Facebook](http://apps.facebook.com/qmachine/)
-   [Twitter](https://dev.twitter.com/apps/1755018/)

In the future, I would like to integrate QMachine with "app ecosystems" like

-   [Android](https://play.google.com/store/apps)
-   [App.net](https://github.com/appdotnet/api-spec/wiki/Developer-Wiki)
-   [BlackBerry](http://us.blackberry.com/apps-software/appworld/)
-   [CloudFlare](https://www.cloudflare.com/apps/)
-   [DirecTV](http://tvapps.directv.com/)
-   [Dropbox](https://www.dropbox.com/developers/apps/)
-   [ePrintCenter](https://h30495.www3.hp.com/apps/)
-   [Google Apps Marketplace](https://www.google.com/enterprise/marketplace/)
-   [Heroku](https://addons.heroku.com/)
-   [Internet Explorer Gallery](http://www.iegallery.com/)
-   [Kynetx](http://developer.kynetx.com/)
-   [Mozilla Marketplace](https://www.mozilla.org/en-US/apps/partners/)
-   [iOS](http://itunes.apple.com/us/app/)
-   [Podio](https://podio.com/store)
-   [Samsung](http://www.samsungapps.com/)
-   [SkyDrive](https://apps.live.com/skydrive)
-   [SMART Platform](http://www.smartplatforms.org/)
-   [Windows Phone](http://www.windowsphone.com/en-US/marketplace)
-   [Yahoo! Connected TV](http://connectedtv.yahoo.com/developer/tvstore/)

