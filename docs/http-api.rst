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


======== ================ ============================= ======== ===== =======
..       HTTP Request                                            HTTP Response
-------- ------------------------------------------------------- -------------
Purpose  Method           URL                           Data     Code  Data
======== ================ ============================= ======== ===== =======
Get avar GET              /box/cardboard?key=982770f29           200   ``{}``
Get list GET              /box/cardboard?status=waiting          200   ``[]``
Set avar POST             /box/cardboard?key=982770f29  ``{}``   201
======== ================ ============================= ======== ===== =======


The data model is based on Quanah_'s asynchronous variables ("avars"). An
avar is a JavaScript object that acts as a generic container for other types by
storing a unique identifier, "key", alongside the contained data, "val". QM
extends this model by adding a "box" parameter to allow grouping and a "status"
parameter for avars that represent job descriptions.


Get avar
~~~~~~~~

To get the value of an avar, a client must request it by known box and known
key. For the example shown in the table, an avar with "cardboard" as its box, "982770f29" as its key, and 2 as its value would look like

.. code-block:: js

    {"box":"cardboard","key":"982770f29","val":2}


Get list
~~~~~~~~

Because job descriptions are avars that must be accessed by a known box and a
known key, a volunteer which knows only the box cannot run a job until it also
knows the job's key. Clients may request a list of jobs' keys using a known
box and a known status; this list is represented as a JSON array. For the
example shown in the table, an array containing three avars' keys might look
like

.. code-block:: js

    ["job_key_1","job_key_2","job_key_3"]


Set avar
~~~~~~~~

To set the value of an avar, a client must send the new value in a request by
known box and known key. No response data will be returned, but a successful
response will be indicated by an HTTP status code of 201.


Experimental
------------

The latest version of the API (|release|) includes extensions that enable
versioned API calls. These routes were added in anticipation of future needs
to support legacy APIs without running legacy servers. Although deprecating the
word "box" in favor of "v1" seems desirable, it is possible that it anticipates
needs that will never arise in practice. Discussion and input here would be
much appreciated.


======== ================ ============================= ======== ===== =======
..       HTTP Request                                            HTTP Response
-------- ------------------------------------------------------- -------------
Purpose  Method           URL                           Data     Code  Data
======== ================ ============================= ======== ===== =======
Get avar GET              /v1/cardboard?key=982770f29            200   ``{}``
Get list GET              /v1/cardboard?status=waiting           200   ``[]``
Set avar POST             /v1/cardboard?key=982770f29   ``{}``   201
======== ================ ============================= ======== ===== =======


.. ----------------------------
.. include:: external-links.rst

