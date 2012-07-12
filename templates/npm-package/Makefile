#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 11 Jul 2012

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
	@   $(RM) $(PACKAGE_ROOT)

distclean: clobber
	@   $(RM) $(TEMPLATE_ROOT)/node_modules *.tgz

reset:
	@   $(call contingent, clear)

run: pack

###

.PHONY: pack

pack: $(PACKAGE_ROOT)
	@   $(CP) $(TEMPLATE_ROOT)/README.md $(PACKAGE_ROOT)            ;   \
            $(CP) $(TEMPLATE_ROOT)/examples $(PACKAGE_ROOT)/examples    ;   \
            $(CP) $(TEMPLATE_ROOT)/lib $(PACKAGE_ROOT)/lib              ;   \
            $(CP) $(TEMPLATE_ROOT)/package.json $(PACKAGE_ROOT)         ;   \
            $(NPM) pack $(PACKAGE_ROOT)                                 ;   \
            $(RM) $(PACKAGE_ROOT)

###

$(PACKAGE_ROOT):
	@   if [ ! -d $@ ]; then $(MKDIR) $@; fi

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
