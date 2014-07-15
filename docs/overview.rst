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

QM contains three main components: an API server, a web server, and a website.
All of the :doc:`source code <source-code>` is freely available.

API server
~~~~~~~~~~

The API server provides a message-passing interface between nodes via an
:doc:`http-api`. There are two implementations to choose from: the original
:doc:`Node.js <npm-module>` version, and the "teaching version" written in
:doc:`Ruby <rack-app>`.

Web server
~~~~~~~~~~

The web server exists only to serve the website. Both implementations of the
API server include a configurable web server, but it can also be replaced
trivially because the website is composed only of static content.

Website
~~~~~~~

The website, which acts as the browser client interface, is implemented in only
HTML, CSS, and JavaScript. It relies heavily on Quanah_.


How to use it
-------------

See :doc:`local-sandbox` and :doc:`paas-sandbox`.


How to contribute
-----------------

See :doc:`source-code`.


.. ----------------------------
.. include:: external-links.rst

