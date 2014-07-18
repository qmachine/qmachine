Ruby gem
========

A Ruby gem is available here_.


Ruby client
--------------

A client for Ruby is planned, but it not yet available as part of the gem. When
it becomes available, it will be possible to submit jobs from a Ruby program to
be executed by volunteer compute nodes.


API server
----------

The "teaching version" of QMachine has now been merged into the Ruby gem, and
a basic web server is also provided to enable the use of web browsers as
compute nodes if so desired. This implementation currently only supports
MongoDB_ for persistent storage, but the gem's repository_ contains the code
necessary for SQLite_, too.


.. https://badge.fury.io/rb/qm.png
.. https://gemnasium.com/qmachine/qm-ruby.png


.. --------------------------
.. External link definitions:
.. --------------------------
.. include:: external-links.rst

.. _here: https://rubygems.org/gems/qm
.. _repository: https://github.com/qmachine/qm-ruby

