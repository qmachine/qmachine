# QMachine [![Build Status](https://travis-ci.org/wilkinson/qmachine.png)](https://travis-ci.org/wilkinson/qmachine) [![Build Status](https://drone.io/github.com/wilkinson/qmachine/status.png)](https://drone.io/github.com/wilkinson/qmachine/latest)

[QMachine](https://www.qmachine.org) (QM) is a web service that can incorporate
ordinary web browsers into a World Wide Computer without installing anything.
QM contains three main components: an API server, a web server, and a website.
The API server provides a message-passing interface between nodes using HTTP
and JSON, and the web server exists only to serve the website, which functions
as the browser client application. [Quanah](//wilkinson.github.io/quanah/)
is used extensively to manage concurrency issues.

Currently, there are two implementations of the server-side components. The
original version is written in [Node.js](http://nodejs.org) and is available
for deployment to server environments via [NPM](https://npmjs.org/package/qm).
A "teaching version" written in [Ruby](http://www.ruby-lang.org) is also
available, and eventually it will be packaged and installable as a
[gem](https://rubygems.org/gems/qm).

The first of several manuscripts about QM has now been accepted for publication
by a peer-reviewed academic journal. This report explains some of the design
decisions behind QM, demonstrates the use of QM in scientific workflows, and
elaborates on some of the future directions. The accompanying screencasts are
already available on
[YouTube](http://www.youtube.com/playlist?list=PLijUCyE0Z0-8nLL5qJ__v-VB3ZoRxSubg)
, one of which was featured on the
[HPCwire](http://www.hpcwire.com/hpcwire/2013-03-14/qmachine_combines_hpc_with_www.html)
and
[insideHPC](http://insidehpc.com/2013/03/09/video-qmachine-commodity-supercomputing-with-web-browsers/)
news sites. QM has also graced the front page of
[Hacker News](https://news.ycombinator.com/item?id=6095595).

For more information, see
[https://wiki.qmachine.org](https://wiki.qmachine.org) :-)

<!-- vim:set syntax=markdown: -->
