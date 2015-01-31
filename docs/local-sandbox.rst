Running a local sandbox
=======================

QMachine (QM) can be installed and run locally, which can be extremely
useful for development as well as for deployment behind firewalls.


Prerequisites
-------------

QM is developed on Mac and Linux systems, and the Makefile located in the root
of the main project's Git repository contains live instructions for building
and testing *everything*.

To get up and running, you will need `GNU Make`_, a standard POSIX development
environment, and Git_.

To build and run an API server, you will need MongoDB_ and either Node.js_ or
Ruby_. If you choose the Node.js version, you can use CouchDB_, PostgreSQL_,
Redis_, or SQLite_ instead, but the Makefile assumes Mongo by default.

.. Is an explanation needed for why MongoDB is now the default?

.. To build the documentation, you will need Sphinx_. 

To build the homepage and/or custom images, you will need ImageMagick_.

PhantomJS_ is used for regression testing and for creating snapshots that can
be converted into thumbnails.


Mac OS X
~~~~~~~~

To get started on Mac OS X with your own local sandbox, you will want to
install the Homebrew_ package manager using directions from its website. It
will allow you to install all of the software mentioned previously by launching
Terminal and typing

.. code-block:: bash

    $ brew install couchdb imagemagick mongodb node phantomjs postgresql redis

I highly recommend installing Git through Homebrew, as well, but it isn't
required. I prefer Apache's official CouchDB.app_ and Heroku's Postgres.app_
over the distributions installed by Homebrew because they include convenient
launchers that live in the menu bar.


Ubuntu Linux
~~~~~~~~~~~~

Ubuntu has a great built-in package manager that we can take advantage of, but
package names vary by version. Incantations are forthcoming.


Node.js
-------

First, make sure that you have NPM_ installed:

.. code-block:: bash

    $ which npm || echo 'NPM is missing'

If NPM is missing, refer to its `documentation <NPM-documentation_>`_ for the
installation procedure.

Next, check out QM's source code from GitHub_:

.. code-block:: bash

    $ git clone https://github.com/qmachine/qmachine.git

Now, select your local copy of the repository as the current directory:

.. code-block:: bash

    $ cd qmachine/

Finally, start MongoDB and then launch QM on localhost:

.. code-block:: bash

    $ make node-app

QM defaults to MongoDB for storage, but a different database can be specified
explicitly:

.. code-block:: bash

    $ make node-app db=couch
    $ make node-app db=mongo
    $ make node-app db=postgres
    $ make node-app db=redis
    $ make node-app db=sqlite


Ruby
----

A Ruby implementation of QM is also available in the project repository, and
its directions are similar to those for Node.js. If you don't already use RVM_,
you should -- it's fantastic and highly recommended.

First, make sure that you have Bundler_ installed:

.. code-block:: bash

    $ which bundler || echo 'Bundler is missing'

If Bundler is missing, install it:

.. code-block:: bash

    $ gem install bundler

Next, check out QM's source code from GitHub:

.. code-block:: bash

    $ git clone https://github.com/qmachine/qmachine.git

Now, select your local copy of the repository as the current directory:

.. code-block:: bash

    $ cd qmachine/

Finally, start MongoDB and then launch QM on localhost:

.. code-block:: bash

    $ make ruby-app

QM defaults to MongoDB for storage, but the Ruby version also has experimental
support for SQLite. Thus, possible command-line incantations include:

.. code-block:: bash

    $ make ruby-app db=mongo
    $ make ruby-app db=sqlite


.. ----------------------------
.. include:: external-links.rst

