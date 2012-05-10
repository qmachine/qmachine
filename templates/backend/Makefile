#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 09 May 2012

PROJ_ROOT   :=  $(PWD)/../..#

include $(PROJ_ROOT)/tools/macros.make

WWWDIR  :=  $(PWD)/www/_attachments

DISPOSABLE  := \
    $(WWWDIR)/cache.manifest \
    $(WWWDIR)/favicon.ico \
    $(WWWDIR)/ie.js \
    $(WWWDIR)/index.html \
    $(WWWDIR)/main.js \
    $(WWWDIR)/print.css \
    $(WWWDIR)/q.js \
    $(WWWDIR)/q-min.js \
    $(WWWDIR)/robots.txt \
    $(WWWDIR)/screen.css \
    $(WWWDIR)/touch-icon-ipad.png \
    $(WWWDIR)/touch-icon-ipad3.png \
    $(WWWDIR)/touch-icon-iphone.png \
    $(WWWDIR)/touch-icon-iphone4.png \
    $(WWWDIR)/web-launch-image-iphone.png \
    $(WWWDIR)/web-launch-image-iphone4.png

CP          :=  $(call contingent, gcp cp) -rf
DATE        :=  $(call contingent, date)
MKDIR       :=  $(call contingent, gmkdir mkdir)
RM          :=  $(call contingent, grm rm) -rf

define stamp-with-epoch-time
    $(DATE) -j -f '%a %b %d %T %Z %Y' "`date`" '+# %s' >> $(1)
endef

.PHONY: all clean clobber distclean reset run
.SILENT: ;

all: run

clean: reset

clobber: clean

distclean: clobber
	@   $(RM) $(DISPOSABLE)

reset:
	@   $(call contingent, clear)

run: $(DISPOSABLE)

###

$(DISPOSABLE): | $(WWWDIR)

$(WWWDIR):
	@   if [ ! -f $@ ]; then $(MKDIR) $@; fi

$(WWWDIR)/cache.manifest: $(PROJ_ROOT)/src/cache.manifest
	@   $(CP) $< $@                                                 ;   \
            $(call stamp-with-epoch-time, $@)

$(WWWDIR)/%: $(PROJ_ROOT)/share/%
	@   $(CP) $< $@

$(WWWDIR)/%: $(PROJ_ROOT)/src/%
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
