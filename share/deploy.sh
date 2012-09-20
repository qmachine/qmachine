#!/usr/bin/env bash

#-  deploy.sh ~~
#                                                       ~~ (c) SRW, 19 Sep 2012

if [ -z "${1}" ]; then
    HEROKU_APP="";
else
    HEROKU_APP="--app ${1}";
fi

CLOUDANT_URL="`heroku config:get CLOUDANT_URL ${HEROKU_APP}`" kanso install ./

CLOUDANT_URL="`heroku config:get CLOUDANT_URL ${HEROKU_APP}`" kanso push db

CLOUDANT_URL="`heroku config:get CLOUDANT_URL ${HEROKU_APP}`" kanso push www

#-  vim:set syntax=sh:
