#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 15 Mar 2012

include $(PWD)/tools/macros.make

CAT         :=  $(call contingent, gcat cat)
CD          :=  $(call contingent, cd)
CP          :=  $(call contingent, gcp cp) -rf
CURL        :=  $(call contingent, curl)
GIT         :=  $(call contingent, git)
LS          :=  $(call contingent, gls ls) 2>/dev/null
MKDIR       :=  $(call contingent, gmkdir mkdir)
QRENCODE    :=  $(call contingent, qrencode) --8bit --level=H
RM          :=  $(call contingent, grm rm) -rf
SED         :=  $(call contingent, gsed sed)
SORT        :=  $(call contingent, gsort sort)
XARGS       :=  $(call contingent, xargs)

APPS    :=  $(shell $(LS) templates)

.PHONY: all clean clobber distclean help reset
.SILENT: ;

'': help;

all: $(APPS)

clean: reset

clobber: clean
	@   $(RM) apps share/main.js share/qr.png

distclean: clobber
	@   $(RM) deps

help:
	@   printf '%s\n' 'Usage: $(MAKE) [options] [target] ...'       ;   \
            printf '%s\n' '  where "high-level" targets include'        ;   \
            $(SED) -n 's/^.PHONY:\([^$$]*\)$$/\1/p' $(MAKEFILE_LIST) |      \
                $(XARGS) printf '    %s\n' $(APPS) | $(SORT)

reset:
	@   $(call contingent, clear)

###

.NOTPARALLEL: $(APPS)
.PHONY: $(APPS)

$(APPS): apps
	@   $(CP) templates/$@ apps/$@                                  ;   \
            $(CD) apps/$@                                               ;   \
            $(MAKE)

###

apps deps:
	@   if [ ! -d $@ ]; then $(MKDIR) $@; fi

couchdb-app: share/main.js

deps/node-sqlite3: deps
	@   REPO="https://github.com/developmentseed/node-sqlite3.git"  ;   \
            if [ ! -d $@ ]; then                                            \
                $(GIT) clone $${REPO} $@                                ;   \
            else                                                            \
                $(CD) $@                                                ;   \
                $(GIT) pull                                             ;   \
            fi

deps/jslint.js: deps
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(CURL) -o $@ $${CROCKHUB}/JSLint/master/jslint.js

deps/json2.js: deps
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(CURL) -o $@ $${CROCKHUB}/JSON-js/master/json2.js

deps/quanah.js: deps
	@   SEANHUB="https://raw.github.com/wilkinson"                 ;   \
            $(CURL) -o $@ $${SEANHUB}/quanah/master/src/quanah.js

nodejs-client: deps/node-sqlite3 share/main.js

share/main.js: deps/jslint.js deps/json2.js deps/quanah.js src/qmachine.js
	@   $(CAT) $^ > $@

share/qr.png:
	@   $(QRENCODE) --margin=1 --size=10 --output=$@ http://qmachine.org

###

%:
	@   $(call alert, 'No target "$@" found.')                      ;   \
            $(MAKE) help

#-  vim:set syntax=make:
