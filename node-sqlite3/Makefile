#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for working with SQLite from Node.js.
#
#                                                       ~~ (c) SRW, 20 Feb 2012

include ../tools/macros.make

GIT     :=  $(call contingent, git)
NODE    :=  $(call contingent, node)
SQLITE  :=  $(call contingent, sqlite3)

REPO    :=  https://github.com/developmentseed/node-sqlite3.git
SRC     :=  jslint.js json2.js quanah.js qmachine.js
MAINJS  :=  main.js
SQLDB   :=  Q.db

CAT     :=  $(call contingent, cat)
CD      :=  $(call contingent, cd)
CP      :=  $(call contingent, cp) -vrf
CURL    :=  $(call contingent, curl) -sS
MKDIR   :=  $(call contingent, mkdir)
RM      :=  $(call contingent, rm) -rf

define run-each
    $(NODE) $(MAINJS) cache=local token=lala $(QARGS)
endef

.PHONY: all clean clobber distclean reset run
.INTERMEDIATE: $(MAINJS)
.SILENT: ;

all: run

clean: reset

clobber: clean
	@   $(RM) $(MAINJS)

distclean: clobber
	@   $(RM) jslint.js json2.js node_modules $(SQLDB)

reset:
	@   $(call contingent, clear)

run: $(MAINJS) node_modules/sqlite3
	@   $(call run-each)

###

.PHONY: repl update volunteer

repl: $(MAINJS) node_modules/sqlite3
	@   $(call run-each) repl

update: node_modules/sqlite3
	@   $(CD) $<                                                    ;   \
            $(GIT) pull                                                 ;   \
            ./configure                                                 ;   \
            $(MAKE)

volunteer: $(MAINJS) node_modules/sqlite3
	@   $(call run-each) volunteer

###

$(MAINJS): $(SRC)
	@   $(CAT) $^ > $@

###

#-  NOTE: I cache a few JavaScript frameworks and libraries in a directory on
#   my personal machine, and I highly recommend it for rapid development. If
#   you don't have the same personal settings, though, these directions will
#   still fall back to our trusty friend 'curl' :-)

jslint.js:
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            if [ -f $(CODEBANK)/lib/JavaScript/jslint.js ]; then            \
                $(CP) $(CODEBANK)/lib/JavaScript/jslint.js $@           ;   \
            else                                                            \
                $(CURL) -o $@ $${CROCKHUB}/JSLint/master/jslint.js      ;   \
            fi

json2.js:
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            if [ -f $(CODEBANK)/lib/JavaScript/json2.js ]; then             \
                $(CP) $(CODEBANK)/lib/JavaScript/json2.js $@            ;   \
            else                                                            \
                $(CURL) -o $@ $${CROCKHUB}/JSON-js/master/json2.js      ;   \
            fi

node_modules:
	@   if [ ! -d $@ ]; then $(MKDIR) $@; fi

node_modules/sqlite3: node_modules
	@   $(GIT) clone $(REPO) $@                                     ;   \
            $(CD) $@                                                    ;   \
            ./configure                                                 ;   \
            $(MAKE)

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
