#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for creating the zip file needed to upload
#   Quanah to the Chrome Web Store as a hosted web app. Most of the process is
#   done manually inside the browser, but this reduces the command-line tedium.
#
#                                                       ~~ (c) SRW, 03 Sep 2011

include ../tools/macros.make

PHANTOM :=  $(call contingent, phantomjs)
SRC     :=  $(wildcard *.js)

SC_SHOT :=  1280x800.jpg
SM_TILE :=  480x240.png

ZIPFILE :=  quanah.zip

OPEN    :=  $(call contingent, gnome-open open)
RM      :=  $(call contingent, rm) -rf
ZIP     :=  $(call contingent, zip)

.PHONY: all clean clobber reset run

all: run

clean: reset
	@   $(RM) $(SC_SHOT) $(SM_TILE)

clobber: clean
	@   $(RM) $(ZIPFILE)

reset:
	@   $(call contingent, clear)

run: $(SC_SHOT) $(SM_TILE) $(ZIPFILE)

###

$(SC_SHOT):
	@   $(PHANTOM) $(SRC) 1280x800 $@

$(SM_TILE):
	@   $(PHANTOM) $(SRC) 480x240 $@

###

#-  NOTE: I still need to make sure this updates the version information ...

$(ZIPFILE):
	@   $(ZIP) -r $@ $(@:%.zip=%)

#-  vim:set syntax=make:
