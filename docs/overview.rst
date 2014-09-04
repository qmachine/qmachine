Overview
========

QMachine_ (QM) is a web service for distributed computing. Its design relaxes
the usual requirements of a distributed computer so far that it can be powered
completely by web browsers -- without installing anything. As a model for
computation, QM has been detailed in a recent paper,
`QMachine: commodity supercomputing in web browsers
<http://www.biomedcentral.com/1471-2105/15/176>`_. This manual details QM as a
software platform, with particular focuses on how it works, how to use it, and
how to contribute to the open-source project.


How it works
------------

Coordination of a distributed computing effort requires a common data
interchange format and a common communications protocol. As a web service, QM
provides an Application Programming Interface (API) that uses JavaScript Object
Notation (JSON) as its common data interchange format and Hypertext Transfer
Protocol (HTTP) as its communications protocol. In short, QM's API allows
JSON-encoded messages sent to URLs over HTTP to become a message-passing
interface for distributed computing. The use of web-friendly technologies is
deliberate -- QM is designed to be as universal as the World Wide Web itself.

Most QM-related software falls into two categories. API clients are programs
that consume QM's API, and API servers are programs that provide the API. Web
servers represent a third category, however, that is important only for hosting
content such as the browser client library.


API clients
~~~~~~~~~~~

An API client is a program that consumes QM's API by sending JSON-encoded
messages over HTTP to specific URLs, as defined by QM's :doc:`http-api`. The
vast majority of programs will fall into this category, and most of these
programs will use a client library for convenience. Currently, the only client
library supported by the QM project is the
:doc:`browser client <browser-client>`, which is written completely in
JavaScript. An outdated Node.js_ client is now being resurrected, and a Ruby_
client is planned.


API servers
~~~~~~~~~~~

An API server, by way of contrast, is a program that provides QM's API by
listening for and responding to specific HTTP requests, as defined by
QM's :doc:`http-api`. There are two implementations to choose from: the
:doc:`original reference version <nodejs>` written in Node.js and the
:doc:`"teaching version" <ruby>` written in Ruby. The Node.js version is
recommended for production.


Web servers
~~~~~~~~~~~

For convenience in hosting, basic web servers are packaged alongside the API
servers. A web server listens for and responds to HTTP requests for files and
other resources that are published online. A web server is not strictly
necessary as part of QM, but it is useful for making the browser client
available to web browsers. The web servers bundled with the API servers are
present only for convenience, and it is trivial to use off-the-shelf web
servers like Apache_ or Nginx_ instead.


How to use it
-------------

See :doc:`local-sandbox` and :doc:`paas-sandbox`.


How to contribute
-----------------

See :doc:`source-code`.


.. ----------------------------
.. include:: external-links.rst

