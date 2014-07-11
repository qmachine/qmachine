Overview
========

QMachine (QM) is a web service that uses Quanah_ to create a distributed
computer that can be incorporate web browsers as compute nodes. QM contains
three main components: an API server, a web server, and a website. All of the
:doc:`source code <source-code>` is freely available.

API server
----------

The API server provides a message-passing interface between nodes via an
:doc:`http-api`. There are two implementations to choose from:
the original :doc:`Node.js <npm-module>` version, and the "teaching version"
written in :doc:`Ruby <rack-app>`.

Web server
----------

The web server exists only to serve the website. Both implementations of
the API server include a configurable web server, but it can also be
replaced trivially because the website is composed only of static
content.

Website
-------

The website, which acts as the browser client interface, is implemented
in only HTML5, CSS, and JavaScript.


.. ----------------------------
.. include:: external-links.rst
