Ruby
====

Getting started
---------------

A Ruby_ gem is available for installation with RubyGems_. To install it
globally,

.. code-block:: bash

    $ gem install qm


API client
----------

A client for Ruby is under development. Basic low-level functions are now
available in the stable release, but no effort has been made to leverage any of
Ruby's language-level concurrency features. It is possible to use the current
functions in a Ruby program to submit jobs to be executed by volunteer compute
nodes, but it is not yet convenient.


API server
----------

The "teaching version" of QMachine has now been merged into the Ruby gem, and
a basic web server is also provided to enable the use of web browsers as
compute nodes if so desired.

A QM server can be launched by a Ruby program as shown in the following
example, which includes default configuration values and commented database
connection strings:

.. code-block:: ruby

    require 'qm'

    QM.launch_service({
        avar_ttl:           86400, # seconds to store avars (default: 24 hours)
        enable_api_server:  false,
        enable_cors:        false,
        enable_web_server:  false,
        hostname:           '0.0.0.0',
        max_body_size:      65536, # 64 * 1024 = 64 KB
        persistent_storage: {
          # mongo:          'mongodb://localhost:27017/test'
        },
        port:               8177,
        public_folder:      'public',
        trafficlog_storage: {
          # mongo:          'mongodb://localhost:27017/test'
        },
        worker_procs:       1
    })

.. NOTE: In the code sample shown above, `QM.launch_service` is used instead of
.. `QM::launch_service` in order to look as similar to Node.js as possible. Is
.. this a "terrible" thing to do in Ruby?

The Ruby version of the API server has less flexibility than the original
Node.js version does. The only choice to persist storage for the
message-passing interface is MongoDB_, and MongoDB is also the only supported
database for logging traffic data.


.. The SQLite_ bindings are no longer present in the repository's `master`
.. branch because the `sqlite3 gem`_ disables deployment to Heroku.


.. https://badge.fury.io/rb/qm.png
.. https://gemnasium.com/qmachine/qm-ruby.png


.. ----------------------------
.. include:: external-links.rst

