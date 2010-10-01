#-  GNU Makefile

#-  quanah/couchdb/auth-app/Makefile ~~
#
#   This file serves as live instructions for assembling a second CouchApp for
#   Quanah; this is a design document for authentication to replace the buggy
#   weirdness that comes by default in /_utils/session.html.
#
#   Test machine: Mac OS X 10.6.4 with CouchDB 1.0.1 installed by HomeBrew.
#
#                                                           ~~ SRW, 30 Sep 2010

SHELL       :=  bash                    #-  GNU conventions don't apply to us!

TEST_DB     :=  localhost:5984/_users
PROD_DB     :=  quanah.couchone.com:5984/_users

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
                local CHOICE CONFIG DB USERNAME PASSWORD                ;   \
                read -p "Setup login $$1 " CHOICE                       ;   \
                [[ $${CHOICE:-"Y"} == "Y" ]] || return 0                ;   \
                DB="$$3"                                                ;   \
                CONFIG="$${DB/_users/_config}"                          ;   \
                CONFIG="$${CONFIG}/couch_httpd_auth"                    ;   \
                CONFIG="$${CONFIG}/authentication_redirect"             ;   \
                read -p "Username: " -e USERNAME                        ;   \
                read -p "Password: " -s PASSWORD && $(ECHO) ''          ;   \
                $(CURL) PUT "$${USERNAME}:$${PASSWORD}@$${CONFIG}" -d       \
                    '"/_users/_design/_auth/index.html"'                ;   \
                wc -l $@ | awk '{if (1 < $$1) print ","}' >> $@         ;   \
                $(ECHO) "\"$$2\": {"                                        \
                    "\"db\": \"http://$${USERNAME}:$${PASSWORD}@$$3\""      \
                "}" >> $@                                               ;   \
            }                                                           ;   \
            setup_login 'for testing? [Y/n]' test '$(TEST_DB)'          ;   \
            setup_login 'for deployment? [Y/n]' prod '$(PROD_DB)'       ;   \
            $(ECHO) "}}" >> $@

#-  vim:set syntax=make:
