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

A client for Ruby is planned, but it not yet available as part of the gem. When
it becomes available, it will be possible to submit jobs from a Ruby program to
be executed by volunteer compute nodes.


API server
----------

The "teaching version" of QMachine has now been merged into the Ruby gem, and
a basic web server is also provided to enable the use of web browsers as
compute nodes if so desired.

A QM server can be launched by a Ruby program as shown in the following
example, which shows the default configuration values:

.. code-block:: ruby

    require 'qm'

    QM::launch_service({
        avar_ttl:           86400, # seconds
        enable_api_server:  false,
        enable_CORS:        false,
        enable_web_server:  false,
        hostname:           '0.0.0.0',
        persistent_storage: {},
        port:               8177,
        public_folder:      'public',
        trafficlog_storage: {}
    })

The Ruby version of the API server has significantly less flexibility than the
original Node.js version does. The only choice to persist storage is MongoDB_
for the message-passing interface, and the only choice for logging traffic data
into a database is MongoDB.


.. The SQLite_ bindings are still present in the repository, but the presence
.. of the `sqlite3 gem`_ disables deployment to Heroku.


.. https://badge.fury.io/rb/qm.png
.. https://gemnasium.com/qmachine/qm-ruby.png


.. --------------------------
.. External link definitions:
.. --------------------------
.. include:: external-links.rst

.. _here: https://rubygems.org/gems/qm
.. _repository: https://github.com/qmachine/qm-ruby

