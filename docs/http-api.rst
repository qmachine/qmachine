.. _`HTTP API`:

HTTP API
========

QMachine (QM) is not restricted to use by web browsers -- it can be used
by any platform that understands HTTP and JavaScript Object Notation
(JSON). This table specifies the Application Programming Interface (API)
understood by QM's API server. Request and response data use JSON
format, but data may be omitted where values are left blank. The "{}"
denotes a JavaScript object, and the "[]" denotes a JSON array. A
comprehensive list of software for interfacing with JavaScript from
other programming languages is available here_.

Version 1.0
-----------

+----------------+-----------------------------+--------+--------+--------+
| HTTP Request                                 | HTTP Response            |
+================+=============================+========+========+========+
| Method         | URL                         | Data   | Code   | Data   |
+----------------+-----------------------------+--------+--------+--------+
| GET            | /box/hello?key=world        |        | 200    | {}     |
+----------------+-----------------------------+--------+--------+--------+
| GET            | /box/hello?status=waiting   |        | 200    | []     |
+----------------+-----------------------------+--------+--------+--------+
| POST           | /box/hello?key=world        | {}     | 201    |        |
+----------------+-----------------------------+--------+--------+--------+

Version 1.1
-----------

The latest version of the API still supports the original API for
backwards compatibility, but it deprecates the word "box" (which served
no actual purpose in the original API) in favor of "v1" to designate the
version of the API.

+----------------+----------------------------+--------+--------+--------+
| HTTP Request   |                            | HTTP Response            |
+================+============================+========+========+========+
| Method         | URL                        | Data   | Code   | Data   |
+----------------+----------------------------+--------+--------+--------+
| GET            | /v1/hello?key=world        |        | 200    | {}     |
+----------------+----------------------------+--------+--------+--------+
| GET            | /v1/hello?status=waiting   |        | 200    | []     |
+----------------+----------------------------+--------+--------+--------+
| POST           | /v1/hello?key=world        | {}     | 201    |        |
+----------------+----------------------------+--------+--------+--------+


.. --------------------------
.. External link definitions:
.. --------------------------

.. _here: http://bit.ly/altjsorg

