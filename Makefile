#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live development workflow for QMachine. To get started on
#   Mac OS X 10.8 "Mountain Lion", you will need to install ...
#
#       ... Homebrew using directions from http://mxcl.github.com/homebrew/.
#
#       ... a minimal set of native dependencies by typing
#           $ brew install couchdb imagemagick node phantomjs
#
#       ... Node Package Manager (NPM) using directions from https://npmjs.org.
#
#       ... Kanso (if you want to use the CouchDB backend) by typing
#           $ npm install -g kanso
#
#       ... as many of the optional dependencies as you desire by typing
#           $ brew install closure-compiler jsmin qrencode yuicompressor
#
#   For a long time, icon generation from LaTeX source code was included as an
#   extra touch, but folks complained too much about the extra dependency on
#   MacTeX 2012. Consequently, the workflow now generates a green placeholder
#   directly from ImageMagick which can be overridden by your own image file
#   if you provide one. If you want to deploy to your own Heroku instance, you
#   will need to install their "Heroku Toolbelt".
#
#   Thanks for stopping by :-)
#
#                                                       ~~ (c) SRW, 22 Oct 2012

PROJ_ROOT       :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))

include $(PROJ_ROOT)/share/macros.make

BUILD_DIR       :=  $(PROJ_ROOT)/build
CACHE_DIR       :=  $(PROJ_ROOT)/cache
ICONS_DIR       :=  $(PROJ_ROOT)/icons
SHARE_DIR       :=  $(PROJ_ROOT)/share
SRC_DIR         :=  $(PROJ_ROOT)/src
VAR_DIR         :=  $(PROJ_ROOT)/var

HEROKU_APP      :=  qmachine
LOCAL_COUCH     :=  http://localhost:5984
LOCAL_NODE      :=  http://localhost:8177
MOTHERSHIP      :=  https://$(strip $(HEROKU_APP)).herokuapp.com
PLISTS          :=  $(addprefix $(VAR_DIR)/com.QM., couchdb.plist nodejs.plist)

.PHONY: all clean clobber distclean help reset
.SILENT: ;

'': help;

all: $(shell $(LS) $(SRC_DIR))

clean: reset
	@   if [ -d "$(BUILD_DIR)/web-service/packages" ]; then             \
                $(CP) $(BUILD_DIR)/web-service/packages/ $(PROJ_ROOT)   ;   \
                $(RM) $(BUILD_DIR)                                      ;   \
                $(MKDIR) $(BUILD_DIR)                                   ;   \
                $(MKDIR) $(BUILD_DIR)/web-service                       ;   \
                $(CP) $(PROJ_ROOT)/packages $(BUILD_DIR)/web-service    ;   \
                $(RM) $(PROJ_ROOT)/packages                             ;   \
            else                                                            \
                $(RM) $(BUILD_DIR)                                      ;   \
            fi                                                          ;   \
            for each in $(PLISTS); do                                       \
                if [ -f "$${each}" ]; then                                  \
                    $(LAUNCHCTL) unload -w $${each} >/dev/null 2>&1     ;   \
                fi                                                      ;   \
            done

clobber: clean
	@   $(RM) $(CACHE_DIR) $(VAR_DIR)

distclean: clobber
	@   $(RM) $(PROJ_ROOT)/.d8_history $(PROJ_ROOT)/.v8_history     ;   \
            if [ -f "$(ICONS_DIR)/logo.pdf" ]; then                         \
                $(CP) $(ICONS_DIR)/logo.pdf $(PROJ_ROOT)/logo.pdf       ;   \
                $(RM) $(ICONS_DIR)                                      ;   \
                $(MKDIR) $(ICONS_DIR)                                   ;   \
                $(CP) $(PROJ_ROOT)/logo.pdf $(ICONS_DIR)                ;   \
                $(RM) $(PROJ_ROOT)/logo.pdf                             ;   \
            else                                                            \
                $(RM) $(ICONS_DIR)                                      ;   \
            fi

help:
	@   $(call show-usage-info)

reset:
	@   $(call contingent, clear)

###

.PHONY: browser-client chrome-hosted-app local-sandbox npm-package web-service

browser-client:                                                             \
    $(addprefix $(BUILD_DIR)/browser-client/,                               \
        apple-touch-icon-57x57.png                                          \
        apple-touch-icon-72x72.png                                          \
        apple-touch-icon-114x114.png                                        \
        apple-touch-icon-144x144.png                                        \
        apple-touch-startup-image-320x460.png                               \
        apple-touch-startup-image-640x920.png                               \
        apple-touch-startup-image-768x1004.png                              \
        apple-touch-startup-image-748x1024.png                              \
        apple-touch-startup-image-1536x2008.png                             \
        apple-touch-startup-image-1496x2048.png                             \
        cache.manifest                                                      \
        favicon.ico                                                         \
        fluidicon.png                                                       \
        giant-favicon.ico                                                   \
        homepage.js                                                         \
        ie.js                                                               \
        index.html                                                          \
        q.js                                                                \
        q-min.js                                                            \
        robots.txt                                                          \
        style-min.css                                                       \
    )
	@   $(call hilite, 'Created $@.')

chrome-hosted-app:                                                          \
    $(addprefix $(BUILD_DIR)/chrome-hosted-app/,                            \
        qmachine.zip                                                        \
        snapshot-1280x800.png                                               \
        snapshot-440x280.png                                                \
    )
	@   $(call hilite, 'Created $@.')

local-sandbox:
	@   $(MAKE)                                                         \
                COUCHDB_URL="$(strip $(LOCAL_COUCH))"                       \
                MOTHERSHIP="$(strip $(LOCAL_NODE))"                         \
                    $(PLISTS)                                               \
                    $(VAR_DIR)/couchdb.ini                                  \
                    $(VAR_DIR)/nodejs/node_modules                          \
                    $(VAR_DIR)/nodejs/server.js                             \
                    web-service                                         ;   \
            $(CP) $(BUILD_DIR)/browser-client                               \
                $(VAR_DIR)/nodejs/public_html                           ;   \
            for each in $(PLISTS); do                                       \
                $(LAUNCHCTL) load -w $${each}                           ;   \
            done                                                        ;   \
            $(CD) $(BUILD_DIR)/web-service                              ;   \
            COUCHDB_URL="$(strip $(LOCAL_COUCH))" $(KANSO) push db      ;   \
            COUCHDB_URL="$(strip $(LOCAL_COUCH))" $(KANSO) push www     ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(call hilite, 'Running on $(strip $(LOCAL_NODE)) ...') ;   \
                $(call open-in-browser, $(strip $(LOCAL_NODE)))         ;   \
            else                                                            \
                $(call alert, 'Service is not running.')                ;   \
            fi

npm-package: $(BUILD_DIR)/npm-package/README.md
	@   $(CD) $(dir $<)                                             ;   \
            $(NPM) install                                              ;   \
            $(call hilite, 'Created $@.')

web-service:                                                                \
    $(addprefix $(BUILD_DIR)/web-service/,                                  \
        couchdb-apps/                                                       \
        deploy.sh                                                           \
        .gitignore                                                          \
        .kansorc                                                            \
        kanso.json                                                          \
        packages/                                                           \
        package.json                                                        \
        Procfile                                                            \
        public_html/                                                        \
        server.js                                                           \
        .slugignore                                                         \
    )
	@   $(call hilite, 'Created $@.')

###

$(BUILD_DIR):
	@   $(call make-directory, $@)

$(BUILD_DIR)/browser-client: | $(BUILD_DIR)
	@   $(call make-directory, $@)

$(BUILD_DIR)/browser-client/cache.manifest:                                 \
    $(SRC_DIR)/browser-client/cache.manifest                                \
    |   $(BUILD_DIR)/browser-client
	@   $(call timestamp, $<, $@)

$(BUILD_DIR)/browser-client/%.js:                                           \
    $(CACHE_DIR)/%.js                                                       \
    |   $(BUILD_DIR)/browser-client
	@   $(call minify-js, $<, $@)

$(BUILD_DIR)/browser-client/%: $(CACHE_DIR)/% | $(BUILD_DIR)/browser-client
	@   $(CP) $< $@

$(BUILD_DIR)/browser-client/%: $(ICONS_DIR)/% | $(BUILD_DIR)/browser-client
	@   $(CP) $< $@

$(BUILD_DIR)/chrome-hosted-app: | $(BUILD_DIR)
	@   $(call make-directory, $@)

$(BUILD_DIR)/chrome-hosted-app/qmachine: | $(BUILD_DIR)/chrome-hosted-app
	@   $(call make-directory, $@)

$(BUILD_DIR)/chrome-hosted-app/qmachine/manifest.json:                      \
    $(SRC_DIR)/chrome-hosted-app/manifest.json                              \
    |   $(BUILD_DIR)/chrome-hosted-app/qmachine
	@   $(CP) $< $@

$(BUILD_DIR)/chrome-hosted-app/qmachine.zip:                                \
    $(BUILD_DIR)/chrome-hosted-app/qmachine/favicon.ico                     \
    $(BUILD_DIR)/chrome-hosted-app/qmachine/icon-128.png                    \
    $(BUILD_DIR)/chrome-hosted-app/qmachine/manifest.json                   \
    |   $(BUILD_DIR)/chrome-hosted-app/qmachine
	@   $(CD) $(dir $@)                                             ;   \
            $(ZIP) -r $@ qmachine

$(BUILD_DIR)/chrome-hosted-app/qmachine/%:                                  \
    $(ICONS_DIR)/%                                                          \
    |   $(BUILD_DIR)/chrome-hosted-app/qmachine
	@   $(CP) $< $@

$(BUILD_DIR)/chrome-hosted-app/snapshot-%.png:                              \
    $(SHARE_DIR)/snapshot.js                                                \
    $(SRC_DIR)/chrome-hosted-app/phantomjs-config.json                      \
    |   $(BUILD_DIR)/chrome-hosted-app
	@   $(PHANTOMJS)                                                    \
                --config=$(SRC_DIR)/chrome-hosted-app/phantomjs-config.json \
                $(SHARE_DIR)/snapshot.js $(MOTHERSHIP) $* $@

$(BUILD_DIR)/npm-package: $(SRC_DIR)/npm-package | $(BUILD_DIR)
	@   $(CP) $< $@

$(BUILD_DIR)/npm-package/%: $(PROJ_ROOT)/% | $(BUILD_DIR)/npm-package
	@   $(CP) $< $@

$(BUILD_DIR)/web-service: | $(BUILD_DIR)
	@   $(call make-directory, $@)

$(BUILD_DIR)/web-service/.gitignore:                                        \
    $(PROJ_ROOT)/.gitignore                                                 \
    | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(BUILD_DIR)/web-service/packages:                                          \
    $(BUILD_DIR)/web-service/kanso.json                                     \
    |   $(BUILD_DIR)/web-service
	@   TMPURL="$(strip $(COUCHDB_URL))"                            ;   \
            if [ "$${TMPURL}" = "" ]; then                                  \
                TMPURL="$(strip $(shell $(HEROKU) config:get                \
                    COUCHDB_URL --app $(HEROKU_APP)))"                  ;   \
            fi                                                          ;   \
            COUCHDB_URL="$${TMPURL}" $(KANSO) install $(BUILD_DIR)/web-service

$(BUILD_DIR)/web-service/public_html: browser-client | $(BUILD_DIR)/web-service
	@   $(CP) $(BUILD_DIR)/browser-client/ $@

$(BUILD_DIR)/web-service/%: $(SHARE_DIR)/% | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(BUILD_DIR)/web-service/%: $(SRC_DIR)/web-service/% | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(CACHE_DIR):
	@   $(call make-directory, $@)

$(CACHE_DIR)/homepage.js:                                                   \
    $(CACHE_DIR)/jquery.js                                                  \
    $(CACHE_DIR)/q.js                                                       \
    $(CACHE_DIR)/main.js                                                    \
    |   $(CACHE_DIR)
	@   $(call replace-mothership, $^, $@)

$(CACHE_DIR)/ie.js: $(SRC_DIR)/browser-client/ie.js | $(CACHE_DIR)
	@   $(call replace-mothership, $<, $@)

$(CACHE_DIR)/index.html: $(SRC_DIR)/browser-client/index.html | $(CACHE_DIR)
	@   $(call replace-mothership, $<, $@)

$(CACHE_DIR)/jquery.js: | $(CACHE_DIR)
	@   $(call download-url, "http://code.jquery.com/jquery-latest.js")

$(CACHE_DIR)/jslint.js: | $(CACHE_DIR)
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(call download-url, "$${CROCKHUB}/JSLint/master/jslint.js")

$(CACHE_DIR)/json2.js: | $(CACHE_DIR)
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            $(call download-url, "$${CROCKHUB}/JSON-js/master/json2.js")

$(CACHE_DIR)/main.js: $(SRC_DIR)/browser-client/main.js | $(CACHE_DIR)
	@   $(call replace-mothership, $<, $@)

$(CACHE_DIR)/meyerweb-reset.css: | $(CACHE_DIR)
	@   $(call download-url, \
                "http://meyerweb.com/eric/tools/css/reset/reset.css")

$(CACHE_DIR)/q.js:                                                          \
    $(CACHE_DIR)/quanah.js                                                  \
    $(CACHE_DIR)/qmachine.js                                                \
    $(CACHE_DIR)/jslint.js                                                  \
    $(CACHE_DIR)/json2.js                                                   \
    |   $(CACHE_DIR)
	@   $(call replace-mothership, $^, $@)

$(CACHE_DIR)/q-min.js: $(CACHE_DIR)/q.js | $(CACHE_DIR)
	@   $(call compile-js, $<, $@)

$(CACHE_DIR)/qmachine.js: $(SRC_DIR)/browser-client/qmachine.js | $(CACHE_DIR)
	@   $(call replace-mothership, $<, $@)

$(CACHE_DIR)/quanah.js: | $(CACHE_DIR)
	@   SEANHUB="https://raw.github.com/wilkinson"                  ;   \
            $(call download-url, "$${SEANHUB}/quanah/master/src/quanah.js")

$(CACHE_DIR)/robots.txt: $(SRC_DIR)/browser-client/robots.txt | $(CACHE_DIR)
	@   $(CP) $< $@

$(CACHE_DIR)/style.css: $(SRC_DIR)/browser-client/style.css | $(CACHE_DIR)
	@   $(CP) $< $@

$(CACHE_DIR)/style-min.css: $(CACHE_DIR)/style.css | $(CACHE_DIR)
	@   $(call minify-css, $<, $@)

$(ICONS_DIR):
	@   $(call make-directory, $@)

.SECONDARY:                                                                 \
    $(addprefix $(ICONS_DIR)/,                                              \
        apple-touch-icon-57x57.png                                          \
        apple-touch-icon-72x72.png                                          \
        apple-touch-icon-114x114.png                                        \
        apple-touch-icon-144x144.png                                        \
        apple-touch-startup-image-320x460.png                               \
        apple-touch-startup-image-320x460.png                               \
        apple-touch-startup-image-640x920.png                               \
        apple-touch-startup-image-768x1004.png                              \
        apple-touch-startup-image-748x1024.png                              \
        apple-touch-startup-image-1536x2008.png                             \
        apple-touch-startup-image-1496x2048.png                             \
        bitbucket.jpg                                                       \
        dropbox-16.png                                                      \
        dropbox-64.png                                                      \
        dropbox-128.png                                                     \
        facebook-16x16.png                                                  \
        facebook-75x75.png                                                  \
        favicon.ico                                                         \
        fluidicon.png                                                       \
        giant-favicon.ico                                                   \
        google-apps-header.png                                              \
        googlecode.png                                                      \
        icon-128.png                                                        \
        large-app-icon.png                                                  \
        qr.png                                                              \
    )

$(ICONS_DIR)/apple-touch-icon-%.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, , $<,                               \
                \( +clone                                                   \
                    -channel A -morphology EdgeOut Diamond:10 +channel      \
                    +level-colors white                                     \
                \) -compose DstOver                                         \
                -background none                                            \
                -density 96                                                 \
                -resize "$*"                                                \
                -quality 100                                                \
                -composite                                                  \
                -background '#929292'                                       \
                -alpha remove                                               \
                -alpha off                                                  \
            )

$(ICONS_DIR)/apple-touch-startup-image-%.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                    -fill '#CCCCCC'                                         \
                    -draw 'color 0,0 reset'                                 \
                    -extent "$*"                                            \
                    -background '#CCCCCC'                                   \
                    -alpha remove                                           \
                    -alpha off                                              \
            )

$(ICONS_DIR)/bitbucket.jpg: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                -background white                                           \
                -alpha remove                                               \
                -alpha off                                                  \
                -density 96                                                 \
                -resize 112x112                                             \
                -quality 100                                                \
                -gravity center                                             \
                -extent 128x128                                             \
                -background white                                           \
                -alpha remove                                               \
                -alpha off                                                  \
            )

$(ICONS_DIR)/dropbox-%.png: $(ICONS_DIR)/icon-%.png | $(ICONS_DIR)
	@   $(CP) $< $@

$(ICONS_DIR)/facebook-%.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                -background white                                           \
                -alpha remove                                               \
                -alpha off                                                  \
                -density 96                                                 \
                -resize "$*"                                                \
                -quality 100                                                \
            )

$(ICONS_DIR)/favicon.ico: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<, -compress Zip -resize 16x16)

$(ICONS_DIR)/fluidicon.png: $(ICONS_DIR)/icon-512.png | $(ICONS_DIR)
	@   $(CP) $< $@ 

$(ICONS_DIR)/giant-favicon.ico: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, , $<,                               \
                \( -clone 0 -resize 16x16 \)                                \
                \( -clone 0 -resize 24x24 \)                                \
                \( -clone 0 -resize 32x32 \)                                \
                \( -clone 0 -resize 48x48 \)                                \
                \( -clone 0 -resize 64x64 \)                                \
                -delete 0                                                   \
            )

$(ICONS_DIR)/google-apps-header.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, , $<,                               \
                -density 96                                                 \
                -background none                                            \
                -resize 51x51                                               \
                -quality 100                                                \
                -gravity center                                             \
                -extent 143x59                                              \
                -background white                                           \
                -alpha remove                                               \
                -alpha off                                                  \
            )

$(ICONS_DIR)/googlecode.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                -background none                                            \
                -density 96                                                 \
                -resize 55x55                                               \
                -quality 100                                                \
            )

$(ICONS_DIR)/icon-%.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                -background none                                            \
                -density 96                                                 \
                -resize "$*x$*"                                             \
                -quality 100                                                \
            )

$(ICONS_DIR)/large-app-icon.png: $(ICONS_DIR)/icon-1024.png | $(ICONS_DIR)
	@   $(CP) $< $@

$(ICONS_DIR)/logo.png: | $(ICONS_DIR)
	@   if [ -f "$(ICONS_DIR)/logo.pdf" ]; then                         \
                SOURCE_FILE="$(ICONS_DIR)/logo.pdf"                     ;   \
            else                                                            \
                SOURCE_FILE='xc:#00704A'                                ;   \
            fi                                                          ;   \
            $(call generate-image-from, $${SOURCE_FILE},                    \
                -density 600                                                \
                -resize 1024x1024                                           \
                -gravity center                                             \
                -extent 1170x1170                                           \
                -transparent white                                          \
                -transparent-color '#929292'                                \
                -quality 100                                                \
            )

$(ICONS_DIR)/qr.png: | $(ICONS_DIR)
	@   $(QRENCODE) --margin=1 --size=10 --output=$@ $(MOTHERSHIP)

$(VAR_DIR):
	@   $(call make-directory, $@)

$(VAR_DIR)/couchdb: | $(VAR_DIR)
	@   $(call make-directory, $@)

$(VAR_DIR)/couchdb.ini: $(SHARE_DIR)/config.sh | $(VAR_DIR)
	@   COUCHDB_INI="$(strip $@)"                                       \
            PROJ_ROOT="$(strip $(PROJ_ROOT))"                               \
                $(SHELL) $<

$(VAR_DIR)/com.QM.couchdb.plist: $(SHARE_DIR)/config.sh | $(VAR_DIR)
	@   COUCHDB="$(strip $(COUCHDB))"                                   \
            COUCHDB_PLIST="$(strip $@)"                                     \
            PROJ_ROOT="$(strip $(PROJ_ROOT))"                               \
            USERNAME="$(strip $(USERNAME))"                                 \
                $(SHELL) $<

$(VAR_DIR)/com.QM.nodejs.plist: $(SHARE_DIR)/config.sh | $(VAR_DIR)/
	@   NODEJS="$(strip $(NODEJS))"                                     \
            NODEJS_PLIST="$(strip $@)"                                      \
            PROJ_ROOT="$(strip $(PROJ_ROOT))"                               \
            USERNAME="$(strip $(USERNAME))"                                 \
                $(SHELL) $<

$(VAR_DIR)/nodejs: | $(VAR_DIR)
	@   $(call make-directory, $@)

$(VAR_DIR)/nodejs/node_modules:                                             \
    npm-package                                                             \
    $(VAR_DIR)/nodejs/package.json                                          \
    | $(VAR_DIR)/nodejs
	@   $(call make-directory, $@)                                  ;   \
            $(LN) $(BUILD_DIR)/npm-package $@/qm                        ;   \
            $(CD) $(VAR_DIR)/nodejs                                     ;   \
            $(NPM) install

$(VAR_DIR)/nodejs/%: $(BUILD_DIR)/web-service/% | $(VAR_DIR)/nodejs
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
