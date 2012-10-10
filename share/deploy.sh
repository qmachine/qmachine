#!/usr/bin/env bash

#-  deploy.sh ~~
#                                                       ~~ (c) SRW, 06 Oct 2012

if [ -z "${1}" ]; then
    HEROKU_APP="";
else
    HEROKU_APP="--app ${1}";
fi

COUCHDB_URL="`heroku config:get COUCHDB_URL ${HEROKU_APP}`";

if [ ! -d "./packages" ]; then
    COUCHDB_URL="${COUCHDB_URL}" kanso install ./;
fi

COUCHDB_URL="${COUCHDB_URL}" kanso push db;

COUCHDB_URL="${COUCHDB_URL}" kanso push www;

#-  vim:set syntax=sh:
