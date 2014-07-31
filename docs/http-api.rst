HTTP API
========

QM's Application Programming Interface (API) uses JavaScript Object Notation
(JSON) as its common data interchange format and Hypertext Transfer Protocol
(HTTP) as its communications protocol. It also supports
`Cross-Origin Resource Sharing <http://www.w3.org/TR/cors/>`_.


Stable
------

This table specifies the "routes" understood by QM's API server. Request and
response data use JSON format, but data may be omitted where values are left
blank. JSON objects are denoted ``{}``, and JSON arrays are denoted ``[]``.


================= ============================= ======== ======== =======
 HTTP Request                                            HTTP Response
-------------------------------------------------------- ----------------
 Method           URL                           Data     Code     Data
================= ============================= ======== ======== =======
 GET              /box/cardboard?key=world               200      ``{}``
 GET              /box/cardboard?status=waiting          200      ``[]``
 POST             /box/cardboard?key=world      ``{}``   201
================= ============================= ======== ======== =======


The data model is based on Quanah_'s asynchronous variables ("avars"). An
avar is a JS object that acts as a generic container for other types. Each avar
stores a unique identifier, "key", alongside the contained data, "val". QM
extends this model slightly by adding a "box" parameter to allow grouping and a
"status" parameter for avars that represent job descriptions.


Get avar
~~~~~~~~

To get the value of an avar, a client must request it by known box and known
key.

For the first route, an avar storing a value of 2 would look like

.. code-block:: js

    {"box":"cardboard","key":"world","val":2}


Get jobs
~~~~~~~~

To get unknown job descriptions, a client must request a list of keys to
those avars by known box and known status.

For the second route, an array containing three avars' keys might look like

.. code-block:: js

    ["job_key_1","job_key_2","job_key_3"]


Set avar
~~~~~~~~

To set the value of an avar, a client must send the new value as a request by
known box and known key.

For the third route, no response data will be sent.


Experimental
------------

The latest version of the API (|release|) includes extensions that enable
versioned API calls. These routes were added in anticipation of future needs
to support legacy APIs without running legacy servers. Although deprecating the
word "box" in favor of "v1" seems desirable, it is possible that it anticipates
needs that will never arise in practice. Discussion and input here would be
much appreciated.

================= ============================= ======== ======== =======
 HTTP Request                                            HTTP Response
-------------------------------------------------------- ----------------
 Method           URL                           Data     Code     Data
================= ============================= ======== ======== =======
 GET              /v1/cardboard?key=world                200      ``{}``
 GET              /v1/cardboard?status=waiting           200      ``[]``
 POST             /v1/cardboard?key=world       ``{}``   201
================= ============================= ======== ======== =======


.. ----------------------------
.. include:: external-links.rst

