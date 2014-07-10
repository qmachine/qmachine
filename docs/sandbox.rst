Running a local sandbox
=======================

QMachine (QM) can be installed and run locally, which can be extremely
useful for development as well as for deployment behind firewalls. A lot
of this information is contained within the project's
`Makefile <https://raw.githubusercontent.com/qmachine/qmachine/master/Makefile>`__.

Prerequisites
-------------

Mac OS X
~~~~~~~~

To get started on Mac OS X 10.8 "Mountain Lion" with your own local
sandbox, you will need to install
`Homebrew <http://mxcl.github.io/homebrew/>`__ using directions from its
website. Then, install a minimal set of native dependencies by launching
Terminal and typing
::

    $ brew install imagemagick node

I highly recommend installing `Git <http://git-scm.com/>`__ through
Homebrew, as well, but it isn't required. I prefer the official Apache
CouchDB.app over the Homebrew-installed version because it's more
convenient. I also prefer Heroku's
`Postgres.app <http://postgresapp.com/>`__ over the version that ships
with Mountain Lion. I don't know of any nice launchers for MongoDB or
Redis, but Homebrew can install them for you, and it includes directions
for launching them.

Ubuntu Linux 12.04 LTS
~~~~~~~~~~~~~~~~~~~~~~

Ubuntu has a built-in package manager that we can use to install some of
the dependencies:
::

    $ sudo apt-get install git imagemagick libsqlite3-dev make

Then, you should install Node.js using the directions given
`here <https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint>`__.

Node.js
-------

First, make sure that you have `Node Package Manager
(NPM) <https://npmjs.org>`__ installed:
::

    $ which npm || echo 'NPM is missing' # see [https://npmjs.org/doc/README.html directions] if necessary

Next, check out QM's source code from
`GitHub <https://github.com/qmachine/qmachine>`__:
::

    $ git clone https://github.com/qmachine/qmachine.git

Now, select your new copy of the repository as the current directory:
::

    $ cd qmachine/

Finally, launch QM on localhost:
::

    $ make local-sandbox

QM uses `SQLite <https://www.sqlite.org/>`__ bindings by default for
convenience because then you don't have to turn on any other programs,
configure internal ports, etc. If you can't get SQLite to work on your
platform, or if you just prefer another database, the current choices
are `Apache CouchDB <https://couchdb.apache.org/>`__,
`MongoDB <http://www.mongodb.org/>`__,
`PostgreSQL <http://www.postgresql.org/>`__, and
`Redis <http://redis.io/>`__. Then, you can run one of the following:
::

    $ make local-sandbox db=couch
    $ make local-sandbox db=mongo
    $ make local-sandbox db=postgres
    $ make local-sandbox db=redis

Ruby
----

There are instructions for using the minimal
`Rack <http://rack.github.io/>`__-based implementation available
`here <Rack_app>`__.

