#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for developing QMachine. I wrote them for
#   use on my laptop (Mac OS X 10.8.1 + Homebrew + MacTeX 2012). Occasionally,
#   I test it with various Linux distributions, but some targets make use of
#   programs like `launchd` for which I have yet to find suitable replacements.
#   If you're using a Mac, make sure you have installed XCode from the App
#   Store before installing Homebrew, MacTeX, and NPM from their respective
#   websites. At that point, the following two commands will cover everything:
#
#       $ brew install closure-compiler couchdb gnu-sed imagemagick node \
#           phantomjs qrencode yuicompressor
#
#       $ npm install -g kanso
#
#   For a possible (but not recommended) alternative to the latter, use
#
#       $ sudo easy_install couchapp
#
#   NOTE: This is a lot of dependencies, to be sure, but not all dependencies
#   are required by each target!
#
#                                                       ~~ (c) SRW, 12 Jul 2012
#                                                   ~~ last updated 17 Sep 2012

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

define compile-css
    if [ $(words $(1)) -eq 1 ]; then                                        \
        $(call aside, "Optimizing stylesheet: $(1) -> $(2)")            ;   \
    else                                                                    \
        $(call aside, "Optimizing stylesheets: $(1) -> $(2)")           ;   \
    fi                                                                  ;   \
    $(CAT) $(1) > $(2)                                                  ;   \
    $(YUICOMP) --type css $(2) -o $(2)
endef

define compile-js
    if [ $(words $(1)) -eq 1 ]; then                                        \
        $(call aside, "Optimizing script: $(1) -> $(2)")                ;   \
    else                                                                    \
        $(call aside, "Optimizing scripts: $(1) -> $(2)")               ;   \
    fi                                                                  ;   \
    $(CAT) $(1) > $(2)
endef
#    $(call compile-with-google-closure, $(1), $(2))

define download-url
    $(call aside, 'Retrieving $(notdir $@) ...')                        ;   \
    $(CURL) -s -o $@ $(1)                                               ;   \
    if [ $$? -ne 0 ]; then                                                  \
        if [ -f $(CODEBANK)/lib/JavaScript/$(notdir $@) ]; then             \
            $(CP) $(CODEBANK)/lib/JavaScript/$(notdir $@) $@            ;   \
        elif [ -f $(CODEBANK)/lib/CSS/$(notdir $@) ]; then                  \
            $(CP) $(CODEBANK)/lib/CSS/$(notdir $@) $@                   ;   \
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
	@   for each in $(abspath apps/*); do                               \
                if [ -d $${each} ] && [ -f $${each}/Makefile ]; then        \
                    $(CD) $${each}                                      ;   \
                    $(MAKE) distclean                                   ;   \
                fi                                                      ;   \
            done                                                        ;   \
            $(RM) $(abspath apps)

clobber: clean
	@   $(RM) build/ share/

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
            if [ -f Makefile ]; then $(MAKE); fi

###

apps build deps share:
	@   if [ ! -d $@ ]; then $(MKDIR) $@; fi

backend-couchdb local-sandbox: \
    share/apple-touch-icon-57x57.png \
    share/apple-touch-icon-72x72.png \
    share/apple-touch-icon-114x114.png \
    share/apple-touch-icon-144x144.png \
    share/apple-touch-startup-image-320x460.png \
    share/apple-touch-startup-image-640x920.png \
    share/apple-touch-startup-image-768x1004.png \
    share/apple-touch-startup-image-748x1024.png \
    share/apple-touch-startup-image-1536x2008.png \
    share/apple-touch-startup-image-1496x2048.png \
    share/favicon.ico \
    share/giant-favicon.ico \
    share/homepage.js \
    share/q.js \
    share/q-min.js \
    share/style-min.css

build/q.pdf: build/q.tex | build/
	@   if [ -f ../images/logo.pdf ]; then                              \
                $(CP) ../images/logo.pdf $@                             ;   \
            else                                                            \
                $(CD) build                                             ;   \
                $(PDFLATEX) q.tex                                       ;   \
                $(PDFCROP) q.pdf q.pdf                                  ;   \
            fi

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

deps/jquery.js: | deps/
	@   $(call download-url, "http://code.jquery.com/jquery-latest.js")

deps/jslint.js: | deps/
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(call download-url, "$${CROCKHUB}/JSLint/master/jslint.js")

deps/json2.js: | deps/
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(call download-url, "$${CROCKHUB}/JSON-js/master/json2.js")

deps/meyerweb-reset.css: | deps/
	@   $(call download-url, \
                "http://meyerweb.com/eric/tools/css/reset/reset.css")

deps/quanah.js: | deps/
	@   SEANHUB="https://raw.github.com/wilkinson"                  ;   \
            $(call download-url, "$${SEANHUB}/quanah/master/src/quanah.js")

facebook-app: \
    share/facebook-16x16.png \
    share/facebook-75x75.png

ios-native-app: \
    share/apple-touch-icon-57x57.png \
    share/apple-touch-icon-72x72.png \
    share/apple-touch-icon-114x114.png \
    share/apple-touch-icon-144x144.png \
    share/apple-touch-startup-image-320x460.png \
    share/apple-touch-startup-image-640x920.png \
    share/apple-touch-startup-image-768x1004.png \
    share/apple-touch-startup-image-748x1024.png \
    share/apple-touch-startup-image-1536x2008.png \
    share/apple-touch-startup-image-1496x2048.png \
    share/favicon.ico \
    share/large-app-icon.png \
    share/q.js

share/apple-touch-icon-%.png: build/q.png | share/
	@   $(CONVERT) \
                $< \( +clone \
                    -channel A -morphology EdgeOut Diamond:10 +channel \
                    +level-colors white \
                \) -compose DstOver \
                -background none \
                -density 96 \
                -resize "$*" \
                -quality 100 \
                -composite \
                -background '#929292' -alpha remove -alpha off \
                    $@

share/apple-touch-startup-image-%.png: build/q.png | share/
	@   $(CONVERT) \
                -fill '#CCCCCC' \
                -draw 'color 0,0 reset' \
                -extent "$*" \
                -background '#CCCCCC' -alpha remove -alpha off \
                    $< $@

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

share/google-apps-header.png: build/q.png | share/
	@   $(CONVERT) \
                $< \
                -density 96 \
                -background none \
                -resize 51x51 \
                -quality 100 \
                -gravity center \
                -extent 143x59 \
                -background white -alpha remove -alpha off \
                    $@

share/googlecode.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize 55x55 \
                -quality 100 \
                    $< $@

share/homepage.js: deps/jquery.js share/q.js src/main.js | share/
	@   $(call compile-js, deps/jquery.js share/q.js src/main.js, $@)

share/icon-%.png: build/q.png | share/
	@   $(CONVERT) \
                -background none \
                -density 96 \
                -resize $*x$* \
                -quality 100 \
                    $< $@

share/large-app-icon.png: share/icon-1024.png | share/
	@   $(CP) $< $@

share/q.js: \
    deps/jslint.js  \
    deps/json2.js   \
    deps/quanah.js  \
    src/qmachine.js | share/
	@   $(CAT) $^ > $@

share/q-min.js: share/q.js | share/
	@   $(call compile-js, $<, $@)

share/qr.png: | share/
	@   $(QRENCODE) --margin=1 --size=10 --output=$@ https://qmachine.org

share/style-min.css: src/style.css | share/
	@   $(call compile-css, src/style.css, $@)

###

%:
	@   $(call alert, 'No target "$@" found.')                      ;   \
            $(MAKE) help

#-  vim:set syntax=make:
