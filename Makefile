#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live development workflow for QMachine (QM). To get started
#   on Mac OS X 10.8 "Mountain Lion" with your own local sandbox, you will need
#   to install ...
#
#       ... Homebrew using directions from http://mxcl.github.com/homebrew/.
#
#       ... a minimal set of native dependencies by typing
#           $ brew install imagemagick node
#
#       ... Node Package Manager (NPM) using directions from https://npmjs.org.
#
#   Then, to launch QM on localhost using SQLite for persistent storage, run
#
#           $ make local-sandbox
#
#   QMachine also supports CouchDB, MongoDB, PostgreSQL, and Redis for storage,
#   but I'm not providing workflow targets for those variants right now because
#   SQLite, as an embedded database, is much more convenient. I am leaving the
#   "local-couch" target as-is rather than deleting it, but it is deprecated at
#   the moment because I am mad at CouchDB. Some optional targets may require
#   extra packages to be installed by Homebrew, including
#
#           $ brew install closure-compiler jsmin mongodb qrencode \
#               phantomjs redis yuicompressor
#
#   I prefer the standalone "CouchDB Server.app" available from the CouchDB
#   website (http://couchdb.apache.org/) over the Homebrew-installed version
#   because it's more convenient. I also prefer Heroku's "Postgres.app"
#   (http://postgresapp.com) over the version that ships with Mountain Lion.
#   I use Heroku's platform-as-a-service (PaaS) for deployment, and this
#   workflow does use the "Heroku Toolbelt" to build some of its targets.
#   Please note that I have no disclosures; I'm just documenting my tools for
#   the sake of scientific reproducibility.
#
#   Of course, if you are reading this and you represent a company interested
#   in donating resources that will help me take QMachine to that proverbial
#   "next level", then by all means contact me! I will consider all such offers
#   and acknowledge your generosity in all ways tasteful and appropriate.
#
#   For a long time, icon generation from LaTeX source code was included as an
#   extra touch, but folks complained too much about the extra dependency on
#   MacTeX 2012. Consequently, the workflow now generates a green placeholder
#   directly from ImageMagick which can be overridden by your own image file
#   if you create an "icons/logo.pdf" file beforehand.
#
#   Thanks for stopping by :-)
#
#                                                       ~~ (c) SRW, 06 Feb 2012
#                                                   ~~ last updated 12 Jan 2013

PROJ_ROOT   :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))

include $(PROJ_ROOT)/share/macros.make

BUILD_DIR   :=  $(PROJ_ROOT)/build
CACHE_DIR   :=  $(PROJ_ROOT)/cache
ICONS_DIR   :=  $(PROJ_ROOT)/icons
SHARE_DIR   :=  $(PROJ_ROOT)/share
SRC_DIR     :=  $(PROJ_ROOT)/src
TEST_DIR    :=  $(PROJ_ROOT)/tests
VAR_DIR     :=  $(PROJ_ROOT)/var

HEROKU_APP  :=  qmachine
LOCAL_COUCH :=  http://localhost:5984
LOCAL_NODE  :=  http://localhost:8177
MOTHERSHIP  :=  https://$(strip $(HEROKU_APP)).herokuapp.com
PLISTS      :=  $(addprefix $(VAR_DIR)/com.QM., couchdb.plist nodejs.plist)
QM_API_URL  :=  $(MOTHERSHIP)
QM_WWW_URL  :=  $(MOTHERSHIP)

.PHONY: all check clean clobber distclean help reset
.SILENT: ;

'': help;

all: $(shell $(LS) $(SRC_DIR))

check: local-sandbox
	@   $(PHANTOMJS) --config=$(TEST_DIR)/config.json $(TEST_DIR)/tests.js

clean: reset
	@   for each in $(PLISTS); do                                       \
                if [ -f "$${each}" ]; then                                  \
                    $(LAUNCHCTL) unload -w $${each} >/dev/null 2>&1     ;   \
                fi                                                      ;   \
            done                                                        ;   \
            $(RM) $(VAR_DIR)

clobber: clean
	@   $(RM) $(BUILD_DIR)/browser-client/                          ;   \
            $(RM) $(BUILD_DIR)/chrome-hosted-app/                       ;   \
            $(RM) $(BUILD_DIR)/web-service/                             ;   \
            $(RM) $(CACHE_DIR)

distclean: clobber
	@   $(RM) $(BUILD_DIR) $(PROJ_ROOT)/.*_history                  ;   \
            if [ -f "$(ICONS_DIR)/logo.pdf" ]; then                         \
                $(CP) $(ICONS_DIR)/logo.pdf $(PROJ_ROOT)/logo.pdf       ;   \
                $(RM) $(ICONS_DIR)                                      ;   \
                $(call make-directory, $(ICONS_DIR))                    ;   \
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
        apple-touch-startup-image-640x1096.png                              \
        apple-touch-startup-image-768x1004.png                              \
        apple-touch-startup-image-748x1024.png                              \
        apple-touch-startup-image-1536x2008.png                             \
        apple-touch-startup-image-1496x2048.png                             \
        cache.manifest                                                      \
        coffeescript.js                                                     \
        favicon.ico                                                         \
        fluidicon.png                                                       \
        giant-favicon.ico                                                   \
        homepage.js                                                         \
        html5shiv.js                                                        \
        ie.js                                                               \
        index.html                                                          \
        q.js                                                                \
        robots.txt                                                          \
        sitemap.xml                                                         \
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

local-couch:
	@   API_STR='{"couch":"$(strip $(LOCAL_COUCH))/'                ;   \
            $(MAKE)                                                         \
                COUCHDB_URL="$(strip $(LOCAL_COUCH))"                       \
                MOTHERSHIP="$(strip $(LOCAL_NODE))"                         \
                QM_API_STRING=$${API_STR}'db/_design/app"}'                 \
                QM_WWW_STRING='$(VAR_DIR)/nodejs/katamari.json'             \
                    $(PLISTS)                                               \
                    $(VAR_DIR)/couchdb.ini                                  \
                    $(VAR_DIR)/nodejs/katamari.json                         \
                    $(VAR_DIR)/nodejs/node_modules                          \
                    $(VAR_DIR)/nodejs/server.js                             \
                    web-service                                         ;   \
            for each in $(PLISTS); do                                       \
                $(LAUNCHCTL) load -w $${each}                           ;   \
            done                                                        ;   \
            $(CD) $(BUILD_DIR)/web-service                              ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(call hilite, 'Running on $(strip $(LOCAL_NODE)) ...') ;   \
                $(call open-in-browser, $(strip $(LOCAL_NODE)))         ;   \
            else                                                            \
                $(call alert, 'Service is not running.')                ;   \
            fi

local-sandbox:
	@   $(MAKE)                                                         \
                MOTHERSHIP="$(strip $(LOCAL_NODE))"                         \
                QM_API_STRING='{"sqlite":"qm.db"}'                          \
                QM_WWW_STRING='$(VAR_DIR)/nodejs/katamari.json'             \
                    browser-client                                          \
                    $(VAR_DIR)/com.QM.nodejs.plist                          \
                    $(VAR_DIR)/nodejs/katamari.json                         \
                    $(VAR_DIR)/nodejs/node_modules                          \
                    $(VAR_DIR)/nodejs/server.js                         ;   \
            $(LAUNCHCTL) load -w $(VAR_DIR)/com.QM.nodejs.plist         ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(call hilite, 'Running on $(strip $(LOCAL_NODE)) ...') ;   \
                $(call open-in-browser, $(strip $(LOCAL_NODE)))         ;   \
            else                                                            \
                $(call alert, 'Service is not running.')                ;   \
            fi

npm-package: $(BUILD_DIR)/npm-package/README.md
	@   $(CD) $(dir $<)                                             ;   \
            $(NPM) install                                              ;   \
            $(NPM) shrinkwrap                                           ;   \
            $(call hilite, 'Created $@.')

web-service:                                                                \
    $(addprefix $(BUILD_DIR)/web-service/,                                  \
        .gitignore                                                          \
        katamari.json                                                       \
        package.json                                                        \
        Procfile                                                            \
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
                $(SHARE_DIR)/snapshot.js $(QM_WWW_URL) $* $@            ;   \
            $(CONVERT) -crop $* $@ $@                                   ;   \
            if [ -f $(@:%.png=%-0.png) ]; then                              \
                $(CP) $(@:%.png=%-0.png) $@                             ;   \
                $(RM) $(@:%.png=%)-*.png                                ;   \
            fi

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

$(BUILD_DIR)/web-service/katamari.json:                                     \
    browser-client                                                          \
    npm-package                                                             \
    | $(BUILD_DIR)/web-service
	@   $(NODEJS) $(BUILD_DIR)/npm-package/examples/roll-up.js          \
                $(BUILD_DIR)/browser-client $@

$(BUILD_DIR)/web-service/%: $(SHARE_DIR)/% | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(BUILD_DIR)/web-service/%: $(SRC_DIR)/web-service/% | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(CACHE_DIR):
	@   $(call make-directory, $@)

$(CACHE_DIR)/homepage.js:                                                   \
    $(CACHE_DIR)/jquery-172.js                                              \
    $(CACHE_DIR)/bootstrap.js                                               \
    $(CACHE_DIR)/q.js                                                       \
    $(CACHE_DIR)/main.js                                                    \
    |   $(CACHE_DIR)
	@   $(call replace-url-macros, $^, $@)

$(CACHE_DIR)/ie.js: $(SRC_DIR)/browser-client/ie.js | $(CACHE_DIR)
	@   $(call replace-url-macros, $<, $@)

$(CACHE_DIR)/index.html: $(SRC_DIR)/browser-client/index.html | $(CACHE_DIR)
	@   $(call replace-url-macros, $<, $@)

$(CACHE_DIR)/bootstrap.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/cyijk")

$(CACHE_DIR)/bootstrap.css: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/1uok3")

$(CACHE_DIR)/bootstrap-responsive.css: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/Zfw2I")

$(CACHE_DIR)/coffeescript.js: | $(CACHE_DIR)
	@   $(call download-url, "http://git.io/2OUH7Q")

$(CACHE_DIR)/html5shiv.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/4p5Is")

$(CACHE_DIR)/jquery-172.js: | $(CACHE_DIR)
	@   $(call download-url, "http://code.jquery.com/jquery-1.7.2.js")

$(CACHE_DIR)/jslint.js: | $(CACHE_DIR)
	@   $(call download-url, "http://git.io/6pCWog")

$(CACHE_DIR)/json2.js: | $(CACHE_DIR)
	@   $(call download-url, "http://git.io/aClKMA")

$(CACHE_DIR)/main.js: $(SRC_DIR)/browser-client/main.js | $(CACHE_DIR)
	@   $(call replace-url-macros, $<, $@)

$(CACHE_DIR)/q.js:                                                          \
    $(CACHE_DIR)/quanah.js                                                  \
    $(CACHE_DIR)/qmachine.js                                                \
    $(CACHE_DIR)/jslint.js                                                  \
    $(CACHE_DIR)/json2.js                                                   \
    |   $(CACHE_DIR)
	@   $(call replace-url-macros, $^, $@)

$(CACHE_DIR)/qmachine.js: $(SRC_DIR)/browser-client/qmachine.js | $(CACHE_DIR)
	@   $(call replace-url-macros, $<, $@)

$(CACHE_DIR)/quanah.js: | $(CACHE_DIR)
	@   $(call download-url, "http://git.io/5rxl6Q")

$(CACHE_DIR)/robots.txt: $(SRC_DIR)/browser-client/robots.txt | $(CACHE_DIR)
	@   $(call replace-url-macros, $<, $@)

$(CACHE_DIR)/sitemap.xml: $(SRC_DIR)/browser-client/sitemap.xml | $(CACHE_DIR)
	@   $(call replace-iso-date, $<, $@-temp)                       ;   \
            $(call replace-url-macros, $@-temp, $@)                     ;   \
            $(RM) $@-temp

$(CACHE_DIR)/style.css: $(SRC_DIR)/browser-client/style.css | $(CACHE_DIR)
	@   $(CP) $< $@

$(CACHE_DIR)/style-min.css:                                                 \
    $(CACHE_DIR)/style.css                                                  \
    $(CACHE_DIR)/bootstrap.css                                              \
    $(CACHE_DIR)/bootstrap-responsive.css                                   \
    | $(CACHE_DIR)
	@   $(call minify-css, $^, $@)

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
        apple-touch-startup-image-640x1096.png                              \
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

$(ICONS_DIR)/apple-touch-startup-image-%.png:                               \
    $(ICONS_DIR)/logo.png                                                   \
    | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                    -fill '#EEEEEE'                                         \
                    -draw 'color 0,0 reset'                                 \
                    -extent "$*"                                            \
                    -background '#EEEEEE'                                   \
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
	@   $(QRENCODE) --margin=1 --size=10 --output=$@ $(QM_WWW_URL)

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
