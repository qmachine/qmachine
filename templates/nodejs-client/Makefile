#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for using the Node.js client to QMachine.
#   Please note that it is still a work in progress, which is why I haven't
#   submitted it to the NPM registry yet ...
#
#                                                       ~~ (c) SRW, 23 May 2012

include $(PWD)/../../tools/macros.make

NODE    :=  $(call contingent, node nodejs)
NPM     :=  $(call contingent, npm)
RM      :=  $(call contingent, grm rm) -rf

.PHONY: all clean clobber distclean reset run
.SILENT: ;

all: build

clean: reset

clobber: clean

distclean: clobber
	@   $(RM) node_modules/

reset:
	@   $(call contingent, clear)

run:
	@   $(NODE) main.js $(QARGS)

###

.PHONY: build install uninstall

build:
	@   $(call hilite, 'Done.')

install:
	@   $(NPM) install -g ./

uninstall:
	@   $(NPM) uninstall -g qmachine

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
