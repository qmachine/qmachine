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

APPDIR      :=  .
TEST_DB     :=  localhost:5984/testing
PROD_DB     :=  quanah.couchone.com:5984/app

COUCHAPPRC  :=  $(APPDIR)/.couchapprc
COUCHIGNORE :=  $(APPDIR)/.couchappignore
COUCHJSON   :=  $(APPDIR)/couchapp.json
DOCID       :=  $(APPDIR)/_id

COUCHCONFIG :=  $(COUCHAPPRC) $(COUCHIGNORE) $(COUCHJSON) $(DOCID)

COUCHAPP    :=  couchapp                #-  http://couchapp.org/
CP          :=  rsync --archive         #-  http://rsync.samba.org/
CURL        :=  curl -X
ECHO        :=  echo -e
MKDIR       :=  mkdir -p
RM          :=  rm -rf

#-  TO BE REMOVED, BUT CURRENTLY IMPORTANT:

JSON    :=  $(APPDIR)/_attachments/json2.js
MATHS   :=  $(APPDIR)/_attachments/Maths.js
STDLIB  :=  $(APPDIR)/_attachments/stdlib.js
OLDIES  :=  $(JSON) $(MATHS) $(STDLIB)

.PHONY: all clean clobber deploy raw reset run test

all: run

clean: reset
	@   $(RM) $(COUCHCONFIG)

clobber: clean
	@   $(RM) $(JSON) $(MATHS) $(STDLIB)

deploy: $(COUCHCONFIG) $(OLDIES)
	@   cd $(APPDIR) && $(COUCHAPP) push -bq prod

raw: $(COUCHCONFIG) $(OLDIES)
	@   cd $(APPDIR) && $(COUCHAPP) push --export test

reset:
	@   clear

run: test

test: $(COUCHCONFIG) $(OLDIES)
	@   cd $(APPDIR) && $(COUCHAPP) push -bq test

### OLDIES -- WILL BE REMOVED SOON!

$(JSON): $(APPDIR)
	@   $(CURL) GET http://www.json.org/json2.js | \
                sed -e 's/^alert[^;]*;$$//gp' > $@

$(MATHS): $(STDLIB)
	@   $(CURL) GET http://libjs-maths.googlecode.com/hg/Maths.js > $@

$(STDLIB): $(JSON)
	@   $(CURL) GET http://libjs-maths.googlecode.com/hg/stdlib.js > $@

###

$(APPDIR):
	@   $(COUCHAPP) generate app $(APPDIR)                          ;   \
            $(RM) $(APPDIR)/README.md                                   ;   \
            $(RM) $(APPDIR)/evently                                     ;   \
            $(RM) $(APPDIR)/lists                                       ;   \
            $(RM) $(APPDIR)/shows                                       ;   \
            $(RM) $(APPDIR)/vendor                                      ;   \
            $(RM) $(APPDIR)/views

$(COUCHAPPRC): $(APPDIR)
	@   read -p "Set up login for testing? [Y/n] " CHOICE           ;   \
            if [[ $${CHOICE:-"Y"} == "Y" ]]                             ;   \
              then                                                          \
                read -p "Username: " -e USERNAME                        ;   \
                read -p "Password: " -s PASSWORD && $(ECHO) ''          ;   \
                TEST="$${USERNAME}:$${PASSWORD}@"                       ;   \
            fi                                                          ;   \
            read -p "Set up login for deployment? [Y/n] " CHOICE        ;   \
            if [[ $${CHOICE:-"Y"} == "Y" ]]                             ;   \
              then                                                          \
                read -p "Username: " -e USERNAME                        ;   \
                read -p "Password: " -s PASSWORD && $(ECHO) ''          ;   \
                PROD="$${USERNAME}:$${PASSWORD}@"                       ;   \
            fi                                                          ;   \
            $(ECHO)                                                         \
                '{"env": {'                                                 \
                    '"test": {"db": "http://'$${TEST}$(TEST_DB)'"},'        \
                    '"prod": {"db": "http://'$${PROD}$(PROD_DB)'"}'         \
                '}}' > $@                                               ;   \
            unset CHOICE USERNAME PASSWORD TEST PROD

$(COUCHIGNORE): $(APPDIR)
	@   $(ECHO) '[ "Makefile", ".swp", "ignore/*", "~" ]' > $@

$(COUCHJSON): $(APPDIR)
	@   $(ECHO) '{"name": "Quanah", "description": "'$(SLOGAN)'"}' > $@

$(DOCID): $(APPDIR)
	@   $(ECHO) "_design/quanah" > $@

#-  vim:set syntax=make:
