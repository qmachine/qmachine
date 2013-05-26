QMachine
========

[QMachine (QM)](https://www.qmachine.org) is a web service that uses
[Quanah](http://wilkinson.github.io/quanah) to create a distributed computer
powered by web browsers. QM contains three main components: an API server, a
web server, and a website. The API server provides a message-passing interface
between nodes using HTTP and JSON, and the web server exists only to serve the
website, which functions as the browser client application.

Currently, there are two implementations of the server-side components. The
original version is written in [Node.js](http://nodejs.org) and is available
for deployment to server environments via [NPM](https://npmjs.org/package/qm).
A new "teaching version" written in [Ruby](http://www.ruby-lang.org) is also
available, and it will eventually be installable as a
[Gem](https://rubygems.org/gems/qm).

I am now revising the first of several manuscripts I have been preparing for
peer-reviewed academic journals. These reports will explain some of the design
decisions behind QM, demonstrate the use of QM in scientific workflows, and
elaborate on the future directions of QM. I published a few screencasts on
[YouTube](http://www.youtube.com/playlist?list=PLijUCyE0Z0-8nLL5qJ__v-VB3ZoRxSubg)
recently, one of which has been featured on the
[HPCwire](http://www.hpcwire.com/hpcwire/2013-03-14/qmachine_combines_hpc_with_www.html)
and
[insideHPC](http://insidehpc.com/2013/03/09/video-qmachine-commodity-supercomputing-with-web-browsers/)
news sites.

For more information, see
[https://wiki.qmachine.org](https://wiki.qmachine.org) :-)

