QMachine
=========

[QMachine](https://www.qmachine.org) (QM) is a web service that uses
[Quanah](http://wilkinson.github.com/quanah) to create a distributed computer
that can use ordinary web browsers as ephemeral nodes. It contains three main
components: an API server, a web server, and a website. The API server and the
web server are both implemented in [Node.js](http://nodejs.org) and available
for use in server environments via [NPM](https://npmjs.org/package/qm). The API
server supports [CORS](http://www.w3.org/TR/cors/) and configurable persistent
storage for a variety of popular databases, including
[Apache CouchDB](http://couchdb.apache.org/),
[MongoDB](http://www.mongodb.org/), [PostgreSQL](http://www.postgresql.org),
[Redis](http://redis.io), and [SQLite](http://www.sqlite.org). The web server
exists only to serve the website. The website functions as an example browser
client for the QM API, and its implementation as static content written in
[HTML5](http://www.whatwg.org/specs/web-apps/current-work/multipage/),
[CSS](http://www.w3.org/Style/CSS/Overview.en.html), and
[JavaScript](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf) allows it to be served out of memory by the web server for high
performance and used by ordinary web browsers for high portability. Parts of
the browser client are installable via Twitter's
[Bower](http://twitter.github.com/bower/) package manager, but I have only
recently experimented with that. The analytical layer can also be used from
[MinervaJS](http://minervajs.org/site/index.html#!/view/qm).

There are several project "mirrors" available on
[Bitbucket](https://bitbucket.org/wilkinson/qmachine),
[GitHub](https://github.com/wilkinson/qmachine), and
[Google Code](https://qmachine.googlecode.com). Various project statistics are
available on [GitHub](https://github.com/wilkinson/qmachine/graphs) and
[Ohloh](https://www.ohloh.net/p/qm), too.

I have done some preliminary investigation into app integration for

-   [Google Chrome](https://chrome.google.com/webstore/detail/meagomakeegjimdibmlodmilfhplkjgp?utm_source=chrome-ntp-icon)
-   [Facebook](http://apps.facebook.com/qmachine/)
-   [Firefox Marketplace](https://marketplace.firefox.com/app/qmachine/)
-   [Twitter](https://dev.twitter.com/apps/1755018/)

I am currently preparing several academic publications that explain some of the
design decisions behind QM, demonstrate the use of QM in a scientific workflow,
and elaborate on the future directions of QM. As in all my projects, the best
documentation is contained inline as comments within the source code. I have
written some tutorials recently, but I probably won't get around to releasing
them until early 2013.

