Running a local sandbox
=======================

QMachine (QM) can be installed and run locally, which can be extremely
useful for development as well as for deployment behind firewalls. A lot
of this information is contained within the project Makefile_.

Prerequisites
-------------

Mac OS X
~~~~~~~~

To get started on Mac OS X 10.8 "Mountain Lion" with your own local sandbox,
you will need to install Homebrew_ using directions from its website. Then,
install a minimal set of native dependencies by launching Terminal and typing
::

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
::

    $ sudo apt-get install git imagemagick libsqlite3-dev make

Then, you should install Node.js_ using the directions given here_.

Node.js
-------

First, make sure that you have NPM_ installed:
::

    $ which npm || echo 'NPM is missing'

If NPM is missing, refer to its documentation_ for the installation procedure.

Next, check out QM's source code from GitHub_:
::

    $ git clone https://github.com/qmachine/qmachine.git

Now, select your local copy of the repository as the current directory:
::

    $ cd qmachine/

Finally, launch QM on localhost:
::

    $ make local-sandbox

QM uses SQLite_ bindings by default for convenience because then you don't have
to turn on any other programs, configure internal ports, etc. If you can't get
SQLite to work on your platform, or if you just prefer another database, the
current choices are CouchDB_, MongoDB_, PostgreSQL_, and Redis_. To launch with
a different database, run one of the following:
::

    $ make local-sandbox db=couch
    $ make local-sandbox db=mongo
    $ make local-sandbox db=postgres
    $ make local-sandbox db=redis

Ruby
----

There are instructions for using the minimal "teaching version"
:doc:`here <rack-app>`. Notes on using the :doc:`ruby-gem` are forthcoming.


.. --------------------------
.. External link definitions:
.. --------------------------
.. include:: external-links.rst

.. _documentation: https://www.npmjs.org/doc/README.html
.. _here: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint-elementary-os
.. _Makefile: https://raw.githubusercontent.com/qmachine/qmachine/master/Makefile

