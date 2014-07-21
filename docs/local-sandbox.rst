Running a local sandbox
=======================

QMachine (QM) can be installed and run locally, which can be extremely
useful for development as well as for deployment behind firewalls.


Prerequisites
-------------

Mac OS X
~~~~~~~~

To get started on Mac OS X with your own local sandbox, you will need to
install Homebrew_ using directions from its website. Then, install a minimal
set of native dependencies by launching Terminal and typing

.. code-block:: bash

    $ brew install imagemagick node

I highly recommend installing Git_ through Homebrew, as well, but it isn't
required. I prefer Apache's official CouchDB.app_ over the one installed by
Homebrew because it includes a convenient launcher that lives in the menu bar.
For the same reason, I also prefer Heroku's Postgres.app_ over the version that
ships with Mountain Lion. I don't know of any nice launchers for MongoDB_ or
Redis_, but Homebrew can install them for you, and directions are included.


Ubuntu Linux 12.04 LTS
~~~~~~~~~~~~~~~~~~~~~~

Ubuntu has a built-in package manager that we can use to install some of
the dependencies:

.. code-block:: bash

    $ sudo apt-get install git imagemagick libsqlite3-dev make

Then, you should install Node.js_ using the directions given here_.


Node.js
-------

First, make sure that you have NPM_ installed:

.. code-block:: bash

    $ which npm || echo 'NPM is missing'

If NPM is missing, refer to its documentation_ for the installation procedure.

Next, check out QM's source code from GitHub_:

.. code-block:: bash

    $ git clone https://github.com/qmachine/qmachine.git

Now, select your local copy of the repository as the current directory:

.. code-block:: bash

    $ cd qmachine/

Finally, launch QM on localhost:

.. code-block:: bash

    $ make local-sandbox

QM uses SQLite_ bindings by default for convenience because then you don't have
to turn on any other programs, configure internal ports, etc. If you can't get
SQLite to work on your platform, or if you just prefer another database, the
current choices are CouchDB_, MongoDB_, PostgreSQL_, and Redis_. To launch with
a different database, run one of the following:

.. code-block:: bash

    $ make local-sandbox db=couch
    $ make local-sandbox db=mongo
    $ make local-sandbox db=postgres
    $ make local-sandbox db=redis


Ruby
----

Additionally, a QM implementation that uses Ruby_ is available in the project
repository. Please note that the :doc:`Ruby gem <ruby>` only supports MongoDB_
for persistent storage and that the Node.js version is the one recommended for
production.

First, make sure that you have Bundler_ installed:

.. code-block:: bash

    $ which bundler || echo 'Bundler is missing'

Obviously, if Bundler is missing, you will have to install it to continue.

Next, check out QM's source code from GitHub_:

.. code-block:: bash

    $ git clone https://github.com/qmachine/qmachine.git

Now, select your local copy of the repository as the current directory:

.. code-block:: bash

    $ cd qmachine/

Finally, start MongoDB and then type

.. code-block:: bash

    $ make rack-app db=mongo


.. --------------------------
.. External link definitions:
.. --------------------------
.. include:: external-links.rst

.. _documentation: https://www.npmjs.org/doc/README.html
.. _here: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint-elementary-os

