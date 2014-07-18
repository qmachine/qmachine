Browser client
==============

The browser client is the easiest place to start, because it can be added to
your own webpage with a single line of HTML:
::

<script src="https://www.qmachine.org/q.js"></script>

Upon loading, your webpage will contain the ``QM`` object in its JavaScript
environment, allowing your page's scripts to submit and volunteer to execute
compute jobs on volunteers' machines using QM's API server -- for free.


Basic use
---------

Submitting jobs
~~~~~~~~~~~~~~~

See http://www.biomedcentral.com/1471-2105/15/176#sec4 for now.


Volunteering to run jobs
~~~~~~~~~~~~~~~~~~~~~~~~

See http://www.biomedcentral.com/1471-2105/15/176#sec4 for now.


Advanced use
------------

QM's browser client leverages asynchronous variables ("avars") extensively to
manage concurrency issues in an object-oriented way, and this programming model
is provided by the Quanah_ JavaScript library. All of the convenience methods
provided by the browser client are implemented with Quanah. Tutorials for
advanced use are forthcoming, but they will essentially discuss working with
avars.


Source code
-----------

Full source code is available on GitHub at
https://github.com/qmachine/qm-browser-client.


.. ----------------------------
.. include:: external-links.rst

