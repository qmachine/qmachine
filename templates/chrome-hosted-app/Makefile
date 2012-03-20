#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for creating the zip file needed to upload
#   Qmachine to the Chrome Web Store as a hosted web app. Most of the process
#   is done manually inside the browser, but automated directions still reduce
#   as much of the command-line tedium as possible.
#
#   NOTE: These directions do _not_ bump the version counter automatically!
#
#                                                       ~~ (c) SRW, 20 Mar 2012

include $(PWD)/../../tools/macros.make

PHANTOM     :=  $(call contingent, phantomjs)
SRC         :=  snapshot.js

SC_SHOT     :=  1280x800.png
SM_TILE     :=  440x280.png

APP         :=  qmachine
MANIFEST    :=  manifest.json
ZIPFILE     :=  $(APP).zip

CONVERT     :=  $(call contingent, convert)
CP          :=  $(call contingent, gcp cp) -rf
MKDIR       :=  $(call contingent, gmkdir mkdir)
OPEN        :=  $(call contingent, gnome-open open)
RM          :=  $(call contingent, rm) -rf
ZIP         :=  $(call contingent, zip)

.PHONY: all clean clobber distclean reset run

all: run

clean: reset
	@   $(RM) $(SC_SHOT) $(SM_TILE) *.png

clobber: clean
	@   $(RM) $(ZIPFILE)

distclean: clobber
	@   $(RM) $(APP) $(SRC)

reset:
	@   $(call contingent, clear)

run: $(SC_SHOT) $(SM_TILE) $(ZIPFILE)

###

$(SC_SHOT): $(SRC)
	@   $(PHANTOM) $(SRC) $(@:%.png=%) $@                           ;   \
            $(CONVERT) +repage -crop $(@:%.png=%) $@ $@

$(SM_TILE): $(SRC)
	@   $(PHANTOM) $(SRC) $(@:%.png=%) $@                           ;   \
            $(CONVERT) +repage -crop $(@:%.png=%) $@ $@                 ;   \
            $(CP) $(@:%.png=%-0.png) $@                                 ;   \
            $(RM) $(@:%.png=%)-*.png

###

$(APP): $(MANIFEST)
	@   if [ ! -d $@ ]; then                                            \
                $(MKDIR) $@                                             ;   \
            fi                                                          ;   \
            $(CP) $(PWD)/../../share/favicon.ico $@                     ;   \
            $(CP) $(PWD)/../../share/icon-128.png $@                    ;   \
            $(CP) $(MANIFEST) $@

$(SRC): $(PWD)/../../tools/snapshot.js
	@   $(CP) $< $@

$(ZIPFILE): $(APP)
	@   $(ZIP) -r $@ $<

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
