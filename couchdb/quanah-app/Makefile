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

TEST_DB     :=  localhost:5984/testing
PROD_DB     :=  quanah.couchone.com:5984/app

COUCHAPPRC  :=  .couchapprc

COUCHAPP    :=  couchapp                #-  http://couchapp.org/
CP          :=  rsync --archive         #-  http://rsync.samba.org/
CURL        :=  curl -X
ECHO        :=  echo -e
MKDIR       :=  mkdir -p
RM          :=  rm -rf

.PHONY: all clean clobber deploy reset run test

all: run

clean: reset
	@   $(RM) $(COUCHAPPRC)

clobber: clean

deploy: $(COUCHAPPRC)
	@   $(COUCHAPP) push --browse --quiet prod

reset:
	@   clear

run: test

test: $(COUCHAPPRC)
	@   $(COUCHAPP) push --browse --quiet test

###

$(COUCHAPPRC):
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

#-  vim:set syntax=make:
