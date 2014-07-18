Overview
========

QMachine (QM) is a web service for distributed computing. Its design relaxes
the usual requirements of a distributed computer so far that it can be powered
completely by web browsers -- without installing anything. As a model for
computation, QM has been detailed in a recent paper,
`QMachine: Commodity Supercomputing in Web Browsers
<http://www.biomedcentral.com/1471-2105/15/176>`_. This manual details QM as a
software platform, with particular focuses on how it works, how to use it, and
how to contribute to the open-source project.


How it works
------------

QM provides a JSON-based message-passing interface over HTTP that can be used
to coordinate heterogeneous compute nodes for distributed computing. Thus,
there are two main software categories involved: API servers and client
libraries that consume the API. Any platform can integrate with QM trivially by
using a client library that can communicate with JSON over HTTP.


API servers
~~~~~~~~~~~

An API server provides a message-passing interface between compute nodes via
an :doc:`http-api` implemented as a web service. There are two implementations
to choose from: the :doc:`original reference version <npm-module>` written in
Node.js_ and the :doc:`"teaching version" <ruby-gem>` written in Ruby_. The
Node.js version is recommended for production.


Client libraries
~~~~~~~~~~~~~~~~

Currently, the only client library supported by the QM project is the
:doc:`browser client <browser-client>`, which is written completely in
JavaScript. Because web browsers must download the client software as part of a
web page, basic web servers are packaged alongside the API servers. Clients for
Node.js and Ruby are planned, but they are incomplete.


How to use it
-------------

See :doc:`local-sandbox` and :doc:`paas-sandbox`.


How to contribute
-----------------

See :doc:`source-code`.


.. ----------------------------
.. include:: external-links.rst

