#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 11 Jul 2012
#                                                   ~~ last updated 10 Aug 2012

TEMPLATE_ROOT   :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))
PROJECT_ROOT    :=  $(realpath $(TEMPLATE_ROOT)/../../)

include $(PROJECT_ROOT)/tools/macros.make

README          :=  $(TEMPLATE_ROOT)/README.md

CP              :=  $(call contingent, gcp cp) -f
NPM             :=  $(call contingent, npm)
RM              :=  $(call contingent, grm rm) -rf

.PHONY: all clean clobber distclean reset run

all: run

clean: reset

clobber: clean
	@   $(RM) npm-debug.log

distclean: clobber
	@   $(RM) $(README) $(TEMPLATE_ROOT)/node_modules *.tgz

reset:
	@   $(call contingent, clear)

run: pack

###

.PHONY: pack

pack: $(README)
	@   $(NPM) pack

###

$(TEMPLATE_ROOT)/%: $(PROJECT_ROOT)/%
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
