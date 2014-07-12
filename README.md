# QMachine

[QMachine](https://www.qmachine.org) (QM) is a web service that can incorporate
ordinary web browsers into a World Wide Computer without installing anything.
QM contains three main components: an API server, a web server, and a website.
The API server provides a message-passing interface between nodes using HTTP
and JSON, and the web server exists only to serve the website, which functions
as the browser client application. [Quanah](https://qmachine.github.io/quanah/)
is used extensively to manage concurrency issues.

Currently, there are two implementations of the server-side components. The
reference implementation uses [Node.js](http://nodejs.org), and it is available
for server-side deployment via [NPM](https://www.npmjs.org/package/qm). A
"teaching version" written in [Ruby](http://www.ruby-lang.org) is also
available, and eventually it will be packaged and installable as a
[gem](https://rubygems.org/gems/qm).

[QMachine: Commodity Supercomputing in Web Browsers](http://www.biomedcentral.com/1471-2105/15/176)
has now been published online in *BMC Bioinformatics*. This
["Highly Accessed"](http://www.biomedcentral.com/about/mostviewed/)
report explains some of the design decisions behind QM, demonstrates the use of
QM in scientific workflows, and elaborates on some of the future directions.
The accompanying screencasts, one of which was featured by the
[HPCwire](http://www.hpcwire.com/hpcwire/2013-03-14/qmachine_combines_hpc_with_www.html)
and
[insideHPC](http://insidehpc.com/2013/03/09/video-qmachine-commodity-supercomputing-with-web-browsers/)
news sites, are available on
[YouTube](https://www.youtube.com/playlist?list=PLwUGp_wSf5vjD5vwzj9Dhqbz-y54oALIe).
QM has also graced the front page of
[Hacker News](https://news.ycombinator.com/item?id=6095595).

The [manual](https://docs.qmachine.org) is a work in progress, but the
[project wiki](https://wiki.qmachine.org) remains available for reference :-)

===

[![Build Status](https://travis-ci.org/qmachine/qmachine.png)](https://travis-ci.org/qmachine/qmachine) [![Build Status](https://drone.io/github.com/qmachine/qmachine/status.png)](https://drone.io/github.com/qmachine/qmachine/latest)

<!-- vim:set syntax=markdown: -->
