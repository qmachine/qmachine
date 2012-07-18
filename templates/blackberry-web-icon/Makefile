#-  GNU Makefile

#-  Makefile ~~
#
#   See also: http://goo.gl/ZZo9d.
#
#                                                       ~~ (c) SRW, 16 Jul 2012

include $(PWD)/../../tools/macros.make

CURL    :=  $(call contingent, curl)
RM      :=  $(call contingent, grm rm) -rf

UNZIP   :=  $(call contingent, unzip)
ZIPURL  :=  http://www.blackberry.com/knowledgecentersupport/kmsupport/developerknowledgebase/zip/WebIcon.zip

.PHONY: all clean clobber distclean reset run
.SILENT: ;

all: run

clean: reset

clobber: clean
	@   $(RM) WebIcon.zip

distclean: clobber
	@   $(RM) docs/ examples/ images/ src/

reset:
	@   $(call contingent, clear)

run: src/
	@   $(call aside, '(blackberry-web-icon placeholder)')

###

.NOTPARALLEL: docs/ examples/ images/ src/

docs/ examples/ images/ src/: WebIcon.zip
	@   $(UNZIP) WebIcon.zip

WebIcon.zip:
	@   $(CURL) -o $@ $(ZIPURL)

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
