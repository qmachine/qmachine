Running on Platform-as-a-Service
================================

QMachine is easy to deploy using Platform-as-a-service (PaaS) because its
design was driven by the goal to be as far "above the metal" as possible.


One-click deployment to Heroku
------------------------------

In fact, QM is so far above the metal that it can be deployed to Heroku_ with
a single click. If you're reading this in a digital format like HTML or PDF,
you can do it without even leaving this page.

.. https://www.herokucdn.com/deploy/button.png
.. figure:: _static/heroku-button.png
    :alt: (Button that deploys QM to Heroku)
    :align: center
    :target: https://heroku.com/deploy?template=https://github.com/qmachine/qm-ruby-turnkey

    To deploy your own turnkey system, click the button. Seriously, try it.

It's okay if you're leery of clicking things, if your computer's security
settings blocked the coolness, or if you're using a hard copy of the manual.
The idea here appears again and again in QM: a workflow can be launched simply
by loading a URL. In this case, your click sends a message to Heroku to create
a new app from a template in a version-controlled repository,
https://github.com/qmachine/qm-ruby-turnkey. This template contains the
"blueprint" for a turnkey QM system, complete with an API server, a web server,
and a barebones webpage that loads the browser client. It uses the
:doc:`Ruby version <ruby>` of QM for simplicity and the
`Heroku Button <https://devcenter.heroku.com/articles/heroku-button>`_ for
convenience.


Other platforms
---------------

Full directions for platforms such as Bluemix_, Heroku, and OpenShift_ are
forthcoming.


.. ----------------------------
.. include:: external-links.rst

