#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for working with SQLite from Node.js.
#
#                                                       ~~ (c) SRW, 15 Mar 2012

include $(PWD)/../../tools/macros.make

REPO    :=  https://github.com/developmentseed/node-sqlite3.git
SQLDB   :=  Q.db

CD      :=  $(call contingent, cd)
CP      :=  $(call contingent, rsync) --archive
GIT     :=  $(call contingent, git)
MKDIR   :=  $(call contingent, gmkdir mkdir)
NODE    :=  $(call contingent, node nodejs)
RM      :=  $(call contingent, grm rm) -rf
SQLITE  :=  $(call contingent, sqlite3)

define run-each
    $(NODE) main.js cache=remote token=sean $(QARGS)
endef

.PHONY: all clean clobber distclean reset run
.SILENT: ;

all: run

clean: reset

clobber: clean
	@   $(RM) $(SQLDB)

distclean: clobber
	@   $(RM) node_modules

reset:
	@   $(call contingent, clear)

run: main.js ;#node_modules/sqlite3
	@   $(call run-each)

###

.PHONY: db-dump repl volunteer

db-dump:
	@   $(SQLITE) $(SQLDB) .dump

repl volunteer: main.js ;#node_modules/sqlite3
	@   $(call run-each) $@

###

main.js: $(PWD)/../../share/main.js
	@   $(CP) $< $@

node_modules:
	@   if [ ! -d $@ ]; then $(MKDIR) $@; fi

node_modules/sqlite3: node_modules
	@   if [ -d $(PWD)/../../deps/node-sqlite3 ]; then                  \
                $(CP) $(PWD)/../../deps/node-sqlite3/ $@                ;   \
            else                                                            \
                $(GIT) clone $(REPO) $@                                 ;   \
            fi                                                          ;   \
            $(CD) $@                                                    ;   \
            ./configure                                                 ;   \
            $(MAKE)

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
