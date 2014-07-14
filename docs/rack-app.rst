Rack app
========

An experimental implementation of QMachine using Rack_ and Sinatra_ is
available in the project repository. It uses the `sqlite3 gem`_ to provide
persistent storage in a self-contained manner.

A prebuilt sandbox for testing on localhost is available here_. To use it,
download the tarball and extract its contents. Then, from within the new
directory,
::

    $ bundle install
    $ bundle exec rackup

If you don't already have Bundler_ installed, you can install it via
installed, you can install it via
::

    $ gem install bundler


Then, point your browser to http://localhost:8177.

Note also that RVM_ is indispensible here for installing everything in a
user-level sandbox. The teaching version has now been merged into the
:doc:`ruby-gem`, but it is not yet feature-complete.


.. ----------------------------
.. include:: external-links.rst

.. _here: https://code.google.com/p/qmachine/downloads/detail?name=rackup-app.tar.gz

