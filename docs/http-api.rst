HTTP API
========

QMachine (QM) is not restricted to use by web browsers -- it can be used by any
platform that understands HTTP and JavaScript Object Notation (JSON). These
tables specify the Application Programming Interface (API) understood by QM's
API server. Request and response data use JSON format, but data may be omitted
where values are left blank. The ``{}`` denotes a JavaScript object, and the
``[]`` denotes a JSON array. A comprehensive list of software for interfacing
with JavaScript from other programming languages is available
`here <altjs.org_>`_.


Version 1.0
-----------

================= ============================ ======== ======== ========
 HTTP Request                                           HTTP Response
------------------------------------------------------- -----------------
 Method           URL                          Data     Code     Data
================= ============================ ======== ======== ========
 GET              /box/hello?key=world                  200      ``{}``
 GET              /box/hello?status=waiting             200      ``[]``
 POST             /box/hello?key=world         ``{}``   201
================= ============================ ======== ======== ========


Version 1.1 (experimental)
--------------------------

The latest version of the API extends the original one to support the use of
versioned API calls. The extensions were added in anticipation of future needs
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

