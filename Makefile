#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for developing QMachine. I wrote them for
#   use on my laptop (Mac OS X 10.7.4 + Homebrew + MacTeX 2011). MacTeX 2012
#   was released recently, and everything still seems to work. Occasionally,
#   I test it with various Linux distributions, but some targets make use of
#   programs like `launchd` for which I have yet to find suitable replacements.
#   If you're using a Mac, make sure you have installed XCode from the App
#   Store before installing Homebrew, MacTeX, and NPM from their respective
#   websites. At that point, you're mostly done, save for `couchapp`, which is
#   a Python module; the rest can be installed by Homebrew via
#
#       $ brew install closure-compiler couchdb gnu-sed imagemagick node    \
#           phantomjs qrencode yuicompressor
#
#   NOTE: This is a lot of dependencies, to be sure, but not all dependencies
#   are required by each target!
#
#                                                       ~~ (c) SRW, 12 Jul 2012

PROJECT_ROOT    :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))

include $(PROJECT_ROOT)/tools/macros.make

CAT         :=  $(call contingent, gcat cat)
CD          :=  $(call contingent, cd)
CLOSURE     :=  $(call contingent, closure-compiler)            #-  by Google
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
YUICOMP     :=  $(call contingent, yuicompressor)

APPS        :=  $(shell $(LS) templates)

define compile-with-google-closure
    $(CLOSURE) --compilation_level SIMPLE_OPTIMIZATIONS \
        $(1:%=--js %) --js_output_file $(2)
endef

define compile-with-yuicompressor
    $(CAT) $(1) > $(2)                                                  ;   \
    $(YUICOMP) --type js $(2) -o $(2)
endef

define compile-js
    if [ $(words $(1)) -eq 1 ]; then                                        \
        $(call aside, "Optimizing script: $(1) -> $(2)")                ;   \
    else                                                                    \
        $(call aside, "Optimizing scripts: $(1) -> $(2)")               ;   \
    fi                                                                  ;   \
    $(call compile-with-google-closure, $(1), $(2))
endef

define download-url
    $(call aside, 'Retrieving $(notdir $@) ...')                        ;   \
    $(CURL) -s -o $@ $(1)                                               ;   \
    if [ $$? -ne 0 ]; then                                                  \
        if [ -d $(CODEBANK)/lib/JavaScript ]; then                          \
            $(CP) $(CODEBANK)/lib/JavaScript/$(notdir $@) $@            ;   \
        else                                                                \
            $(call alert, 'Unable to retrieve $(notdir $@).')           ;   \
            exit 1                                                      ;   \
        fi                                                              ;   \
    fi
endef

.PHONY: all clean clobber distclean help reset
.SILENT: ;

'': help;

all: $(APPS)

clean: reset

clobber: clean
	@   $(RM) build/ share/

distclean: clobber
	@   $(RM) .d8_history deps/ .v8_history                         ;   \
            for each in $(abspath apps/*); do                               \
                if [ -d $${each} ] && [ -f $${each}/Makefile ]; then        \
                    $(CD) $${each}                                      ;   \
                    $(MAKE) $@                                          ;   \
                fi                                                      ;   \
            done                                                        ;   \
            $(RM) $(abspath apps)

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
            if [ -f Makefile ]; then $(MAKE); fi

###

apps build deps share:
	@   if [ ! -d $@ ]; then $(MKDIR) $@; fi

backend-couchdb local-sandbox: \
    deps/jslint.js \
    deps/json2.js \
    deps/quanah.js \
    share/favicon.ico \
    share/giant-favicon.ico \
    share/q.js \
    share/q-min.js \
    share/touch-icon-ipad.png \
    share/touch-icon-ipad3.png \
    share/touch-icon-iphone.png \
    share/touch-icon-iphone4.png \
    share/web-launch-image-iphone.png \
    share/web-launch-image-iphone4.png

build/q.pdf: build/q.tex | build/
	@   $(CD) build                                                 ;   \
            $(PDFLATEX) q.tex                                           ;   \
            $(PDFCROP) q.pdf q.pdf

build/q.png: build/q.pdf | build/
	@   $(CONVERT) \
                -density 600 \
                -resize 1024x1024 \
                -gravity center \
                -extent 1170x1170 \
                -transparent white \
                -transparent-color '#929292' \
                -quality 100 \
                    $< $@

build/q.tex: src/q.tex | build/
	@   $(CP) $< $@

chrome-hosted-app: \
    share/favicon.ico \
    share/icon-128.png

chrome-packaged-app: \
    share/favicon.ico \
    share/icon-128.png

deps/jslint.js: | deps/
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(call download-url, "$${CROCKHUB}/JSLint/master/jslint.js")

deps/json2.js: | deps/
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(call download-url, "$${CROCKHUB}/JSON-js/master/json2.js")

deps/quanah.js: | deps/
	@   SEANHUB="https://raw.github.com/wilkinson"                  ;   \
            $(call download-url, "$${SEANHUB}/quanah/master/src/quanah.js")

facebook-app: \
    share/facebook-16x16.png \
    share/facebook-75x75.png

ios-native-app: \
    share/favicon.ico \
    share/large-app-icon.png \
    share/native-launch-image-ipad-landscape.png \
    share/native-launch-image-ipad-portrait.png \
    share/native-launch-image-ipad3-landscape.png \
    share/native-launch-image-ipad3-portrait.png \
    share/native-launch-image-iphone.png \
    share/native-launch-image-iphone4.png \
    share/q.js \
    share/touch-icon-ipad.png \
    share/touch-icon-ipad3.png \
    share/touch-icon-iphone.png \
    share/touch-icon-iphone4.png

share/bitbucket.jpg: build/q.png | share/
	@   $(CONVERT) \
                -background white -alpha remove -alpha off \
                -density 96 \
                -resize 35x35 \
                -quality 100 \
                    $< $@

share/dropbox-16.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize 16x16 \
                -quality 100 \
                    $< $@

share/dropbox-64.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize 64x64 \
                -quality 100 \
                    $< $@

share/dropbox-128.png: share/icon-128.png
	@   $(CP) $< $@

share/facebook-16x16.png: build/q.png | share/
	@   $(CONVERT) \
                -background white -alpha remove -alpha off \
                -density 96 \
                -resize 16x16 \
                -quality 100 \
                    $< $@

share/facebook-75x75.png: build/q.png | share/
	@   $(CONVERT) \
                -background white -alpha remove -alpha off \
                -density 96 \
                -resize 75x75 \
                -quality 100 \
                    $< $@

share/favicon.ico: build/q.png | share/
	@   $(CONVERT) -compress Zip -resize 16x16 $< $@

share/giant-favicon.ico: build/q.png | share/
	@   $(CONVERT) $< \
                \( -clone 0 -resize 16x16 \) \
                \( -clone 0 -resize 24x24 \) \
                \( -clone 0 -resize 32x32 \) \
                \( -clone 0 -resize 48x48 \) \
                \( -clone 0 -resize 64x64 \) \
                -delete 0 \
                    $@

share/googlecode.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize 55x55 \
                -quality 100 \
                    $< $@

share/icon-%.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize $*x$* \
                -quality 100 \
                    $< $@

share/large-app-icon.png: share/icon-1024.png | share/
	@   $(CP) $< $@

share/native-launch-image-ipad-landscape.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 1024x748 \
                    $< $@

share/native-launch-image-ipad-portrait.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 768x1004 \
                    $< $@

share/native-launch-image-ipad3-landscape.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 2048x1496 \
                -background '#CCCCCC' -alpha remove -alpha off \
                    $< $@

share/native-launch-image-ipad3-portrait.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 1536x2008 \
                -background '#CCCCCC' -alpha remove -alpha off \
                    $< $@

share/native-launch-image-iphone.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 320x480 \
                    $< $@

share/native-launch-image-iphone4.png: build/q.png | share/
	@   $(CONVERT) \
                -background '#CCCCCC' -alpha remove -alpha off \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 640x960 \
                    $< $@

share/q.js: \
    deps/jslint.js  \
    deps/json2.js   \
    deps/quanah.js  \
    src/qmachine.js | share/
	@   $(CAT) $^ > $@

share/q-min.js: share/q.js | share/
	@   $(call compile-js, $<, $@)

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
                -resize 72x72 \
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
                -resize 144x144 \
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
                -resize 57x57 \
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
                -resize 114x114 \
                -quality 100 \
                -composite \
                -background '#929292' -alpha remove -alpha off \
                    $@


share/web-launch-image-iphone.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 320x460 \
                    $< $@

share/web-launch-image-iphone4.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent 640x920 \
                    $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')                      ;   \
            $(MAKE) help

#-  vim:set syntax=make:
