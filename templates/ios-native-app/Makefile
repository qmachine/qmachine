#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 12 Jul 2012
#                                                   ~~ last updated 15 Aug 2012

PROJ_ROOT   :=  $(PWD)/../../

include $(PROJ_ROOT)/tools/macros.make

CP  :=  $(call contingent, gcp cp) -rf

RESOURCES :=  \
    apple-touch-icon-57x57.png \
    apple-touch-icon-72x72.png \
    apple-touch-icon-114x114.png \
    apple-touch-icon-144x144.png \
    Default.png \
    Default@2x.png \
    Default-Landscape-ipad.png \
    Default-Landscape@2x-ipad.png \
    Default-Portrait-ipad.png \
    Default-Portrait@2x-ipad.png \
    favicon.ico \
    homepage.js \
    index.html \
    large-app-icon.png \
    q.js \
    style-min.css

CP      :=  $(call contingent, gcp cp) -rf
RM      :=  $(call contingent, grm rm) -rf

.PHONY: all clean clobber distclean reset run
.SILENT: ;

all: run

clean: reset

clobber: clean

distclean: clobber

reset:
	@   $(call contingent, clear)

run: $(RESOURCES)
	@   $(call aside, '(ios-native-app placeholder)')

###

Default.png: $(PROJ_ROOT)/share/native-launch-image-iphone.png
	@   $(CP) $< $@

Default@2x.png: $(PROJ_ROOT)/share/native-launch-image-iphone4.png
	@   $(CP) $< $@

Default-Landscape-ipad.png: \
    $(PROJ_ROOT)/share/native-launch-image-ipad-landscape.png
	@   $(CP) $< $@

Default-Landscape@2x-ipad.png: \
    $(PROJ_ROOT)/share/native-launch-image-ipad3-landscape.png
	@   $(CP) $< $@

Default-Portrait-ipad.png: \
    $(PROJ_ROOT)/share/native-launch-image-ipad-portrait.png
	@   $(CP) $< $@

Default-Portrait@2x-ipad.png: \
    $(PROJ_ROOT)/share/native-launch-image-ipad3-portrait.png
	@   $(CP) $< $@

###

%: $(PROJ_ROOT)/share/%
	@   $(CP) $< $@

%: $(PROJ_ROOT)/src/%
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
