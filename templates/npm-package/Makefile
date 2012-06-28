#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 27 Jun 2012

TEMPLATE_ROOT   :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))
PROJECT_ROOT    :=  $(realpath $(TEMPLATE_ROOT)/../../)
PACKAGE_ROOT    :=  $(TEMPLATE_ROOT)/qm

include $(PROJECT_ROOT)/tools/macros.make

CD              :=  $(call contingent, gcd cd)
CP              :=  $(call contingent, gcp cp) -rf
MKDIR           :=  $(call contingent, gmkdir mkdir)
NPM             :=  $(call contingent, npm)
RM              :=  $(call contingent, grm rm) -rf

.PHONY: all clean clobber distclean reset run

all: run

clean: reset

clobber: clean

distclean: clobber
	@   $(RM) $(TEMPLATE_ROOT)/node_modules

reset:
	@   $(call contingent, clear)

run: check

###

.PHONY: check

check: $(TEMPLATE_ROOT)/node_modules
	@   $(call alert, 'No tests to run yet.')

###

$(TEMPLATE_ROOT)/node_modules: $(TEMPLATE_ROOT)/package.json
	@   $(NPM) install

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
