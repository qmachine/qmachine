#!/usr/bin/env bash

#-  deploy.sh ~~
#                                                       ~~ (c) SRW, 19 Sep 2012

if [ -z "${1}" ]; then
    HEROKU_APP="";
else
    HEROKU_APP="--app ${1}";
fi

COUCH_URL="`heroku config:get CLOUDANT_URL ${HEROKU_APP}`";

if [ ! -d "./packages" ]; then
    CLOUDANT_URL="${COUCH_URL}" kanso install ./;
fi

CLOUDANT_URL="${COUCH_URL}" kanso push db;

CLOUDANT_URL="${COUCH_URL}" kanso push www;

#-  vim:set syntax=sh:
