#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 17 Apr 2012

PROJ_ROOT   :=  $(PWD)/../..#

include $(PROJ_ROOT)/tools/macros.make

DISPOSABLE  := \
    public_html/cache.appcache \
    public_html/cache.manifest \
    public_html/favicon.ico \
    public_html/ie.js \
    public_html/index.html \
    public_html/print.css \
    public_html/q.js \
    public_html/robots.txt \
    public_html/screen.css \
    public_html/touch-icon-ipad.png \
    public_html/touch-icon-ipad3.png \
    public_html/touch-icon-iphone.png \
    public_html/touch-icon-iphone4.png \
    public_html/web-launch-image-iphone.png \
    public_html/web-launch-image-iphone4.png

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
	@   $(call aside, '(backend-node.js-couchdb placeholder)')

###

public_html/:
	@   if [ ! -f $@ ]; then $(MKDIR) $@; fi

public_html/cache.appcache: $(PROJ_ROOT)/src/cache.appcache | public_html/
	@   $(CP) $< $@                                                 ;   \
            $(call stamp-with-epoch-time, $@)

public_html/q.js: $(PROJ_ROOT)/share/main.js | public_html/
	@   $(CP) $< $@

public_html/%: $(PROJ_ROOT)/share/% | public_html/
	@   $(CP) $< $@

public_html/%: $(PROJ_ROOT)/src/% | public_html/
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
