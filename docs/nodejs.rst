Node.js
=======

Install with NPM
----------------

A Node.js_ module is available for installation with
`Node Package Manager`_ (NPM). To install it in the current directory,

.. code-block:: bash

    $ npm install qm


API client
----------

A client for Node.js is planned, but it not yet available as part of the
module. When it becomes available, it will be possible to submit jobs from a
Node.js program to be executed by volunteer compute nodes.


API server
----------

The original, reference version of QM is available as part of the module, and
a basic web server is also provided to enable the use of web browsers as
compute nodes if so desired.

A QM server can be launched by a Node.js program as shown in the following
example, which shows the default configuration values:

.. code-block:: javascript

    var qm = require('qm');

    qm.launch_service({
        enable_api_server:  false,
        enable_CORS:        false,
        enable_www_server:  false,
        hostname:           '0.0.0.0',  //- aka INADDR_ANY
        log: function (request) {
         // This function is the default logging function.
            return {
                host: request.headers.host,
                method: request.method,
                timestamp: new Date(),
                url: request.url
            };
        },
        match_hostname:     false,
        max_http_sockets:   500,
        max_upload_size:    1048576,    //- 1024 * 1024 = 1 Megabyte
        persistent_storage: {
            avar_ttl:       86400,      //- expire avars after 24 hours
            gc_interval:    10          //- collect garbage every _ seconds
        },
        port:               8177,
        static_content:     'katamari.json',
        trafficlog_storage: {},
        worker_procs:       0
    });

The Node.js version of the API server can use any of five different databases
to provide persistent storage for its message-passing interface: CouchDB_,
MongoDB_, PostgreSQL_, Redis_, and SQLite_. It can also log traffic data into
CouchDB, MongoDB, or PostgreSQL_ if desired.


Try it live
~~~~~~~~~~~

Live, interactive demonstrations of the API and web servers are
available at runnable.com_. These will give you a different insight into the
guts of QM by allowing you to make your own copies to play with and debug,
completely for free.


.. https://badge.fury.io/js/qm.png
.. https://gemnasium.com/qmachine/qm-nodejs.png


.. ----------------------------
.. include:: external-links.rst

.. _`Node Package Manager`: NPM_
.. _runnable.com: http://runnable.com/qmachine

