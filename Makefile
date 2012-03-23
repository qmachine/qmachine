#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 23 Mar 2012

include $(PWD)/tools/macros.make

CAT         :=  $(call contingent, gcat cat)
CD          :=  $(call contingent, cd)
CONVERT     :=  $(call contingent, convert)                     #-  ImageMagick
CP          :=  $(call contingent, gcp cp) -rf
CURL        :=  $(call contingent, curl)
GIT         :=  $(call contingent, git)
LS          :=  $(call contingent, gls ls) 2>/dev/null
MKDIR       :=  $(call contingent, gmkdir mkdir)
PDFCROP     :=  $(call contingent, pdfcrop)                     #-  TeX Live
PDFLATEX    :=  $(call contingent, pdflatex) -no-shell-escape   #-  TeX Live
QRENCODE    :=  $(call contingent, qrencode) --8bit --level=H
RM          :=  $(call contingent, grm rm) -rf
SED         :=  $(call contingent, gsed sed)
SORT        :=  $(call contingent, gsort sort)
XARGS       :=  $(call contingent, xargs)

APPS    :=  $(shell $(LS) templates)

.PHONY: all clean clobber distclean help reset
.SILENT: ;

'': help;

all: $(APPS)

clean: reset

clobber: clean
	@   $(RM) apps/ build/ share/

distclean: clobber
	@   $(RM) .d8_history deps/ .v8_history

help:
	@   printf '%s\n' 'Usage: $(MAKE) [options] [target] ...'       ;   \
            printf '%s\n' '  where "high-level" targets include'        ;   \
            $(SED) -n 's/^.PHONY:\([^$$]*\)$$/\1/p' $(MAKEFILE_LIST) |      \
                $(XARGS) printf '    %s\n' $(APPS) | $(SORT)

reset:
	@   $(call contingent, clear)

###

.NOTPARALLEL: $(APPS)
.PHONY: $(APPS)

$(APPS): | apps/ share/
	@   $(CP) templates/$@ apps/$@                                  ;   \
            $(CD) apps/$@                                               ;   \
            $(MAKE)

###

apps build deps share:
	@   if [ ! -d $@ ]; then $(MKDIR) $@; fi

build/q.png: build/q.tex | build/
	@   $(CD) build                                                 ;   \
            $(PDFLATEX) q.tex                                           ;   \
            $(PDFCROP) q.pdf q.pdf                                      ;   \
            $(CONVERT) \
                -density 8192 \
                -resize 1024x1024 \
                -gravity center \
                -extent 1024x1024 \
                -transparent white \
                -transparent-color '#929292' \
                -quality 100 \
                    q.pdf q.png

build/q.tex: src/q.tex | build/
	@   $(CP) $< $@

chrome-hosted-app: \
    share/favicon.ico \
    share/icon-128.png

chrome-packaged-app: \
    share/favicon.ico \
    share/icon-128.png

couchdb-app: \
    deps/jslint.js \
    deps/json2.js \
    deps/quanah.js \
    share/favicon.ico \
    share/launch-image-iphone.png \
    share/launch-image-iphone4.png \
    share/main.js \
    share/touch-icon-ipad.png \
    share/touch-icon-ipad3.png \
    share/touch-icon-iphone.png \
    share/touch-icon-iphone4.png

deps/node-sqlite3: | deps/
	@   REPO="https://github.com/developmentseed/node-sqlite3.git"  ;   \
            if [ ! -d $@ ]; then                                            \
                $(GIT) clone $${REPO} $@                                ;   \
            else                                                            \
                $(CD) $@                                                ;   \
                $(GIT) pull                                             ;   \
            fi

deps/jslint.js: | deps/
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(CURL) -o $@ $${CROCKHUB}/JSLint/master/jslint.js

deps/json2.js: | deps/
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(CURL) -o $@ $${CROCKHUB}/JSON-js/master/json2.js

deps/quanah.js: | deps/
	@   SEANHUB="https://raw.github.com/wilkinson"                 ;   \
            $(CURL) -o $@ $${SEANHUB}/quanah/master/src/quanah.js

facebook-app: \
    share/facebook-16x16.png \
    share/facebook-75x75.png

nodejs-client: \
    deps/node-sqlite3 \
    share/main.js

share/bitbucket.jpg: build/q.png | share/
	@   $(CONVERT) \
                -background white -alpha remove -alpha off \
                -density 96 \
                -resize 31x31 \
                -gravity center \
                -extent 35x35 \
                -quality 100 \
                    $< $@

share/facebook-16x16.png: build/q.png | share/
	@   $(CONVERT) \
                -background white -alpha remove -alpha off \
                -density 96 \
                -resize 14x14 \
                -gravity center \
                -extent 16x16 \
                -quality 100 \
                    $< $@

share/facebook-75x75.png: build/q.png | share/
	@   $(CONVERT) \
                -background white -alpha remove -alpha off \
                -density 96 \
                -resize 66x66 \
                -gravity center \
                -extent 75x75 \
                -quality 100 \
                    $< $@

share/favicon.ico: build/q.png | share/
	@   $(CONVERT) -compress Zip -resize 16x16 $< $@

share/googlecode.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize 48x48 \
                -gravity center \
                -extent 55x55 \
                -quality 100 \
                    $< $@

share/icon-128.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize 112x112 \
                -gravity center \
                -extent 128x128 \
                -quality 100 \
                    $< $@

share/launch-image-iphone.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 320x460 \
                    $< $@
share/launch-image-iphone4.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 640x920 \
                    $< $@

share/main.js: \
    deps/jslint.js  \
    deps/json2.js   \
    deps/quanah.js  \
    src/qmachine.js | share/
	@   $(CAT) $^ > $@

share/qr.png: | share/
	@   $(QRENCODE) --margin=1 --size=10 --output=$@ http://qmachine.org

share/touch-icon-ipad.png: build/q.png | share/
	@   $(CONVERT) \
                $< \( +clone \
                    -channel A -morphology EdgeOut Diamond:10 +channel \
                    +level-colors white \
                \) -compose DstOver \
                -background none \
                -density 96 \
                -resize 63x63 \
                -gravity center \
                -extent 72x72 \
                -quality 100 \
                -composite \
                -background '#929292' -alpha remove -alpha off \
                    $@

share/touch-icon-ipad3.png: build/q.png | share/
	@   $(CONVERT) \
                $< \( +clone \
                    -channel A -morphology EdgeOut Diamond:10 +channel \
                    +level-colors white \
                \) -compose DstOver \
                -background none \
                -density 96 \
                -resize 126x126 \
                -gravity center \
                -extent 144x144 \
                -quality 100 \
                -composite \
                -background '#929292' -alpha remove -alpha off \
                    $@

share/touch-icon-iphone.png: build/q.png | share/
	@   $(CONVERT) \
                $< \( +clone \
                    -channel A -morphology EdgeOut Diamond:10 +channel \
                    +level-colors white \
                \) -compose DstOver \
                -background none \
                -density 96 \
                -resize 50x50 \
                -gravity center \
                -extent 57x57 \
                -quality 100 \
                -composite \
                -background '#929292' -alpha remove -alpha off \
                    $@

share/touch-icon-iphone4.png: build/q.png | share/
	@   $(CONVERT) \
                $< \( +clone \
                    -channel A -morphology EdgeOut Diamond:10 +channel \
                    +level-colors white \
                \) -compose DstOver \
                -background none \
                -density 96 \
                -resize 100x100 \
                -gravity center \
                -extent 114x114 \
                -quality 100 \
                -composite \
                -background '#929292' -alpha remove -alpha off \
                    $@

###

%:
	@   $(call alert, 'No target "$@" found.')                      ;   \
            $(MAKE) help

#-  vim:set syntax=make:
