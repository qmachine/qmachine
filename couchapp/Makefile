#-  GNU Makefile

#-  quanah/couchapp/Makefile ~~
#
#   This file serves as live instructions for assembling Quanah as a CouchApp.
#
#   GNU Make is my choice for automation, but do not be misled -- I use Make
#   for writing semi-portable shell scripts that handle dependencies
#   automatically. I may replace Make with SCons or Ant someday, but it is
#   meaningless to argue the merits of server-side build scripts to develop
#   for The Web Computer. We terminal junkies will have to get our fix in the
#   browser someday, and worrying about the choice of command line tools just
#   prolongs the addiction.
#
#   Test machine: Mac OS X 10.6.4 with CouchDB 1.0.1 installed by HomeBrew.
#
#                                                           ~~ SRW, 25 Sep 2010

SHELL       :=  bash                    #-  GNU conventions don't apply to us!

PROJECT     :=  http://quanah.googlecode.com
SLOGAN      :=  "The World's Most Relaxed Supercomputer"

TEST_DB     :=  localhost:5984/testing
PROD_DB     :=  quanah.couchone.com:5984/app

C_APPJSON   :=  couchapp.json
C_APPRC     :=  .couchapprc
C_APPIGNORE :=  .couchappignore
DOCID       :=  _id

COUCHCONFIG :=  $(C_APPJSON) $(C_APPRC) $(C_APPIGNORE) $(DOCID)

COUCHAPP    :=  couchapp                #-  http://couchapp.org/
CP          :=  rsync --archive         #-  http://rsync.samba.org/
CURL        :=  curl -X
ECHO        :=  echo -e
MKDIR       :=  mkdir -p
RM          :=  rm -rf

JSON        :=  _attachments/json2.js
MATHS       :=  _attachments/Maths.js
STDLIB      :=  _attachments/stdlib.js
OLDIES      :=  $(JSON) $(MATHS) $(STDLIB)

.PHONY: all clean clobber deploy reset run test

all: run

clean: reset
	@   $(RM) $(COUCHCONFIG)

clobber: clean
	@   $(RM) $(OLDIES)

deploy: $(COUCHCONFIG) $(OLDIES)
	@   $(COUCHAPP) push --browse --quiet prod

reset:
	@   clear

run: test

test: $(COUCHCONFIG) $(OLDIES)
	@   $(COUCHAPP) push --browse --quiet test

###

$(JSON):
	@   URL="http://www.json.org/json2.js"                          ;   \
            $(CURL) GET $${URL} | sed -e 's/^alert[^;]*;$$//gp' > $@

$(MATHS): $(STDLIB)
	@   URL="http://libjs-maths.googlecode.com/hg/Maths.js"         ;   \
            $(CURL) GET $${URL} > $@

$(STDLIB): $(JSON)
	@   URL="http://libjs-maths.googlecode.com/hg/stdlib.js"        ;   \
            $(CURL) GET $${URL} > $@

###

$(C_APPJSON):
	@   $(ECHO) '{'                                                     \
                '"name": "Quanah",'                                         \
                '"description": "'$(SLOGAN)'",'                             \
                '"homepage": "'$(PROJECT)'"'                                \
            '}' > $@

$(C_APPRC):
	@   $(ECHO) '{"env": {' > $@                                    ;   \
            function setup_login {                                          \
                local CHOICE USERNAME PASSWORD                          ;   \
                read -p "Setup login $$1 " CHOICE                       ;   \
                [[ $${CHOICE:-"Y"} == "Y" ]] || return 0                ;   \
                read -p "Username: " -e USERNAME                        ;   \
                read -p "Password: " -s PASSWORD && $(ECHO) ''          ;   \
                wc -l $@ | awk '{if (1 < $$1) print ","}' >> $@         ;   \
                $(ECHO) "\"$$2\": {"                                        \
                    "\"db\": \"http://$${USERNAME}:$${PASSWORD}@$$3\""      \
                "}" >> $@                                               ;   \
            }                                                           ;   \
            setup_login 'for testing? [Y/n]' test '$(TEST_DB)'          ;   \
            setup_login 'for deployment? [Y/n]' prod '$(PROD_DB)'       ;   \
            $(ECHO) "}}" >> $@

$(C_APPIGNORE):
	@   $(ECHO) '[ "Makefile", ".swp", "ignore/*", "~" ]' > $@

$(DOCID):
	@   $(ECHO) "_design/quanah" > $@

#-  vim:set syntax=make:
