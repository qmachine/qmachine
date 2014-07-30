HTTP API
========

QMachine (QM) is not restricted to use by web browsers -- it can be used by
almost any modern programming platform. Coordination of any distributed
computing effort requires a common data interchange format and a common
communications protocol. QM provides an Application Programming Interface (API)
that uses JavaScript Object Notation (JSON) as its common data interchange
format and Hypertext Transfer Protocol (HTTP) as its communications protocol.
In short, QM's API allows JSON-encoded messages sent to URLs over HTTP to be
used as a message-passing interface for distributed computing. The use of
web-friendly technologies like HTTP and JSON allows browsers to join QM
without installing anything. The API is also
`CORS <http://www.w3.org/TR/cors/>`_-enabled.


Stable
------

This table specifies the "routes" understood by QM's API server. Request and
response data use JSON format, but data may be omitted where values are left
blank. The ``{}`` denotes a JSON object, and the ``[]`` denotes a JSON array.


================= ============================ ======== ======== ========
 HTTP Request                                           HTTP Response
------------------------------------------------------- -----------------
 Method           URL                          Data     Code     Data
================= ============================ ======== ======== ========
 GET              /box/hello?key=world                  200      ``{}``
 GET              /box/hello?status=waiting             200      ``[]``
 POST             /box/hello?key=world         ``{}``   201
================= ============================ ======== ======== ========


The data model is based on Quanah_'s "asynchronous variables" ("avars"). An
avar is a JS object that acts as a generic container for a key-value pair.


Get avar
~~~~~~~~

For the first route, an avar storing a value of 2 would look like

.. code-block:: js

    {"box":"hello","key":"world","val":2}


Get jobs
~~~~~~~~

For the second route, an array containing three avars' keys might look like

.. code-block:: js

    ["job_key_1","job_key_2","job_key_3"]


Set avar
~~~~~~~~

For the third route, no response data will be sent.


Experimental
------------

The latest version of the API (|release|) includes extensions that enable
versioned API calls. These routes were added in anticipation of future needs
to support legacy APIs without running legacy servers. Although deprecating the
word "box" in favor of "v1" seems desirable, it is possible that it anticipates
needs that will never arise in practice. Discussion and input here would be
much appreciated.

================= ============================ ======== ======== ========
 HTTP Request                                           HTTP Response
------------------------------------------------------- -----------------
 Method           URL                          Data     Code     Data
================= ============================ ======== ======== ========
 GET              /v1/hello?key=world                   200      ``{}``
 GET              /v1/hello?status=waiting              200      ``[]``
 POST             /v1/hello?key=world          ``{}``   201
================= ============================ ======== ======== ========


.. ----------------------------
.. include:: external-links.rst

