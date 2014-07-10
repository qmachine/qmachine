#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live development workflow for QMachine (QM). To get started
#   on Mac OS X 10.9 with your own local sandbox, you will need to install ...
#
#       ... Homebrew using directions from http://brew.sh.
#
#       ... a minimal set of native dependencies by typing
#           $ brew install imagemagick node
#
#   To run QM on localhost, run
#
#           $ make local-sandbox
#
#   QM uses the SQLite bindings by default for convenience because you don't
#   have to turn on any other programs, configure internal ports, etc. If you
#   can't get SQLite to work on your platform, or if you just prefer another
#   database, the current choices are Apache CouchDB, MongoDB, PostgreSQL, and
#   Redis. Then, you can run one of the following:
#
#           $ make local-sandbox db=couch
#           $ make local-sandbox db=mongo
#           $ make local-sandbox db=postgres
#           $ make local-sandbox db=redis
#
#   I prefer the standalone "Apache CouchDB.app" available from the CouchDB
#   website (http://couchdb.apache.org/) over the Homebrew-installed version
#   because it's more convenient. I like the convenience of "Postgres.app"
#   (http://postgresapp.com), but its default configuration is *not* a
#   high-performance one -- in my testing, SQLite is almost as fast. I don't
#   know of any nice launchers for MongoDB or Redis, but Homebrew can install
#   them for you, and it includes directions for launching them.
#
#   Some optional targets may require extra packages to be installed by
#   Homebrew, including
#
#           $ brew install closure-compiler jsmin mongodb qrencode \
#               phantomjs redis yuicompressor
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
#                                                   ~~ last updated 10 Jul 2014

PROJ_ROOT   :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))

include $(PROJ_ROOT)/share/macros.make

BUILD_DIR   :=  $(PROJ_ROOT)/build
CACHE_DIR   :=  $(PROJ_ROOT)/cache
DOCS_DIR    :=  $(PROJ_ROOT)/docs
ICONS_DIR   :=  $(PROJ_ROOT)/icons
SHARE_DIR   :=  $(PROJ_ROOT)/share
SRC_DIR     :=  $(PROJ_ROOT)/src
TEST_DIR    :=  $(PROJ_ROOT)/tests

LOCAL_ADDR  :=  http://localhost:8177
QM_API_LOC  :=  '{"sqlite":"qm.db"}'
QM_API_URL  :=  https://api.qmachine.org
QM_WWW_URL  :=  https://www.qmachine.org

ifeq ("$(strip $(db))", "couch")
    QM_API_LOC  :=  '{"couch":"http://127.0.0.1:5984/db"}'
endif

ifeq ("$(strip $(db))", "mongo")
    QM_API_LOC  :=  '{"mongo":"mongodb://localhost:27017/test"}'
endif

ifeq ("$(strip $(db))", "postgres")
    QM_API_LOC  :=  '{"postgres":"postgres://localhost:5432/$(USER)"}'
endif

ifeq ("$(strip $(db))", "redis")
    QM_API_LOC  :=  '{"redis":"redis://:@127.0.0.1:6379"}'
endif

.PHONY: all check check-versions clean clobber distclean help reset update
.SILENT: ;

'': help;

all: $(shell $(LS) $(SRC_DIR))

check: $(CACHE_DIR)/quanah.js | check-versions
	@   $(PHANTOMJS) --config=$(TEST_DIR)/config.json \
                $(TEST_DIR)/tests.js '$(LOCAL_ADDR)'

check-versions:
	@   $(NODEJS) $(SHARE_DIR)/check-versions.js

clean: reset
	@   $(RM) $(BUILD_DIR)/browser-client/                          ;   \
            $(RM) $(BUILD_DIR)/chrome-hosted-app/                       ;   \
            $(RM) $(BUILD_DIR)/local-sandbox/                           ;   \
            $(RM) $(BUILD_DIR)/rack-app/                                ;   \
            $(RM) $(BUILD_DIR)/ruby-gem/                                ;   \
            $(RM) $(BUILD_DIR)/web-service/                             ;   \
            if [ ! "$$($(LS) -A $(BUILD_DIR))" ]; then                      \
                $(RM) $(BUILD_DIR)                                      ;   \
            fi                                                          ;   \
            $(CD) $(DOCS_DIR)                                           ;   \
            $(MAKE) $@

clobber: clean
	@   $(RM) $(CACHE_DIR)

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

update:
	@   $(GIT) submodule init                                       ;   \
            $(GIT) submodule update

###

.PHONY: browser-client chrome-hosted-app npm-module ruby-gem web-service

browser-client:                                                             \
    $(addprefix $(BUILD_DIR)/browser-client/,                               \
        apple-touch-icon.png                                                \
        browserconfig.xml                                                   \
        cache.manifest                                                      \
        coffeescript.js                                                     \
        favicon.ico                                                         \
        giant-favicon.ico                                                   \
        hits-by-country.json                                                \
        homepage.js                                                         \
        html5shiv.js                                                        \
        icon-128.png                                                        \
        index.html                                                          \
        manifest.webapp                                                     \
        q.js                                                                \
        respond.js                                                          \
        robots.txt                                                          \
        square150x150logo.png                                               \
        sitemap.xml                                                         \
        style-min.css                                                       \
        wiki.png                                                            \
    )
	@   $(call hilite, 'Created $@.')

chrome-hosted-app:                                                          \
    $(addprefix $(BUILD_DIR)/chrome-hosted-app/,                            \
        qmachine.zip                                                        \
        snapshot-1280x800.png                                               \
        snapshot-440x280.png                                                \
    )
	@   $(call hilite, 'Created $@.')

npm-module: | $(BUILD_DIR)/npm-module/
	@   $(CD) $(BUILD_DIR)/npm-module/                              ;   \
            $(NPM) install                                              ;   \
            $(NPM) shrinkwrap                                           ;   \
            $(call hilite, 'Created $@.')

ruby-gem: | $(BUILD_DIR)/ruby-gem/
	@   $(CD) $(BUILD_DIR)/ruby-gem/                                ;   \
            $(GEM) build qm.gemspec

web-service:                                                                \
    $(addprefix $(BUILD_DIR)/web-service/,                                  \
        .gitignore                                                          \
        custom.js                                                           \
        katamari.json                                                       \
        package.json                                                        \
        Procfile                                                            \
        server.js                                                           \
        .slugignore                                                         \
    )
	@   $(call hilite, 'Created $@.')

###

.PHONY: local-sandbox rack-app

local-sandbox:
	@   $(MAKE)                                                         \
                QM_API_STRING=$(strip $(QM_API_LOC))                        \
                QM_API_URL='$(strip $(LOCAL_ADDR))'                         \
                QM_WWW_URL='$(strip $(LOCAL_ADDR))'                         \
                    web-service                                         ;   \
            $(CD) $(BUILD_DIR)                                          ;   \
            if [ ! -d $@/ ]; then                                           \
                $(CP) web-service $@                                    ;   \
            fi                                                          ;   \
            if [ ! -d $@/node_modules/ ]; then                              \
                $(call make-directory, $@/node_modules/)                ;   \
            fi                                                          ;   \
            if [ ! -d $@/node_modules/qm ]; then                            \
                $(CP) npm-module $@/node_modules/qm                     ;   \
            fi                                                          ;   \
            $(CD) $@/                                                   ;   \
            $(NPM) install                                              ;   \
            QM_API_STRING=$(QM_API_LOC) \
                QM_WWW_STRING='"$(BUILD_DIR)/$@/katamari.json"' $(NPM) start

rack-app: | $(BUILD_DIR)/rack-app/
	@   $(MAKE) \
                QM_API_URL='$(strip $(LOCAL_ADDR))'                         \
                QM_WWW_URL='$(strip $(LOCAL_ADDR))'                         \
                    browser-client                                      ;   \
            $(CD) $(BUILD_DIR)                                          ;   \
            if [ ! -d $@/public/ ]; then                                    \
                $(CP) browser-client $@/public                          ;   \
            fi                                                          ;   \
            $(CD) $@/                                                   ;   \
            $(BUNDLE) package                                           ;   \
            $(BUNDLE) exec rackup

###

$(BUILD_DIR):
	@   $(call make-directory, $@)

$(BUILD_DIR)/browser-client: | $(BUILD_DIR)
	@   $(call make-directory, $@)

$(BUILD_DIR)/browser-client/cache.manifest:                                 \
    $(SRC_DIR)/homepage/cache.manifest                                      \
    |   $(BUILD_DIR)/browser-client
	@   $(call timestamp, $<, $@)

$(BUILD_DIR)/browser-client/manifest.webapp:                                \
    $(SRC_DIR)/homepage/manifest.webapp                                     \
    |   $(BUILD_DIR)/browser-client
	@   $(CP) $< $@

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

$(BUILD_DIR)/npm-module: $(SRC_DIR)/npm-module | $(BUILD_DIR)
	@   $(CP) $< $@

$(BUILD_DIR)/npm-module/%: $(PROJ_ROOT)/% | $(BUILD_DIR)/npm-module
	@   $(CP) $< $@

$(BUILD_DIR)/rack-app/: $(SRC_DIR)/rack-app/ | $(BUILD_DIR)
	@   $(CP) $< $@

$(BUILD_DIR)/rack-app/public/: | $(BUILD_DIR)/rack-app/
	@   $(call make-directory, $@)

$(BUILD_DIR)/ruby-gem: | $(BUILD_DIR)
	@   $(CP) $(SRC_DIR)/ruby-gem/ $@

$(BUILD_DIR)/ruby-gem/README.md: | $(BUILD_DIR)/ruby-gem/
	@   $(CP) $(PROJ_ROOT)/README.md $@

$(BUILD_DIR)/web-service: | $(BUILD_DIR)
	@   $(call make-directory, $@)

$(BUILD_DIR)/web-service/.gitignore:                                        \
    $(PROJ_ROOT)/.gitignore                                                 \
    | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(BUILD_DIR)/web-service/katamari.json:                                     \
    browser-client                                                          \
    npm-module                                                              \
    | $(BUILD_DIR)/web-service
	@   $(NODEJS) $(BUILD_DIR)/npm-module/examples/roll-up.js           \
                $(BUILD_DIR)/browser-client $@

$(BUILD_DIR)/web-service/%: $(SHARE_DIR)/% | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(BUILD_DIR)/web-service/%: $(SRC_DIR)/web-service/% | $(BUILD_DIR)/web-service
	@   $(CP) $< $@

$(CACHE_DIR):
	@   $(call make-directory, $@)

$(CACHE_DIR)/bootstrap.css: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/N5U0wB")

$(CACHE_DIR)/bootstrap.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/MfuMZu")

$(CACHE_DIR)/bootstrap-theme.css: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/qPqsDk")

$(CACHE_DIR)/browserconfig.xml:                                             \
    $(SRC_DIR)/homepage/browserconfig.xml                                   \
    |   $(CACHE_DIR)
	@   $(CP) $< $@

$(CACHE_DIR)/coffeescript.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/a6ZyGk")

$(CACHE_DIR)/hits-by-country.json:                                          \
    $(SRC_DIR)/homepage/hits-by-country.json                                \
    |   $(CACHE_DIR)
	@   $(CP) $< $@

$(CACHE_DIR)/homepage.js:                                                   \
    $(CACHE_DIR)/jquery-git1.js                                             \
    $(CACHE_DIR)/bootstrap.js                                               \
    $(CACHE_DIR)/main.js                                                    \
    |   $(CACHE_DIR)
	@   $(call replace-url-macros, $^, $@)                          ;   \
            $(call remove-source-maps, $@)

$(CACHE_DIR)/html5shiv.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/8Ah9dC")

$(CACHE_DIR)/index.html: $(SRC_DIR)/homepage/index.html | $(CACHE_DIR)
	@   $(call replace-url-macros, $<, $@)

$(CACHE_DIR)/jquery-191.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/tiSzW")

$(CACHE_DIR)/jquery-git1.js: | $(CACHE_DIR)
	@   $(call download-url, "https://code.jquery.com/jquery-git1.min.js")

$(CACHE_DIR)/jslint.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/9XuoRL")

$(CACHE_DIR)/json2.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/1MnPH")

$(CACHE_DIR)/main.js: $(SRC_DIR)/homepage/main.js | $(CACHE_DIR)
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
	@   $(call download-url, "http://goo.gl/0C6XzA")

$(CACHE_DIR)/respond.js: | $(CACHE_DIR)
	@   $(call download-url, "http://goo.gl/xZRyTq")

$(CACHE_DIR)/robots.txt: $(SRC_DIR)/homepage/robots.txt | $(CACHE_DIR)
	@   $(call replace-url-macros, $<, $@)

$(CACHE_DIR)/sitemap.xml: $(SRC_DIR)/homepage/sitemap.xml | $(CACHE_DIR)
	@   $(call replace-iso-date, $<, $@-temp)                       ;   \
            $(call replace-url-macros, $@-temp, $@)                     ;   \
            $(RM) $@-temp

$(CACHE_DIR)/style.css: $(SRC_DIR)/homepage/style.css | $(CACHE_DIR)
	@   $(CP) $< $@

$(CACHE_DIR)/style-min.css:                                                 \
    $(CACHE_DIR)/bootstrap.css                                              \
    $(CACHE_DIR)/bootstrap-theme.css                                        \
    $(CACHE_DIR)/style.css                                                  \
    | $(CACHE_DIR)
	@   $(call minify-css, $^, $@)

$(ICONS_DIR):
	@   $(call make-directory, $@)

.SECONDARY:                                                                 \
    $(addprefix $(ICONS_DIR)/,                                              \
        amazon-logo.png                                                     \
        apple-touch-icon.png                                                \
        apple-touch-icon-57x57.png                                          \
        apple-touch-icon-72x72.png                                          \
        apple-touch-icon-76x76.png                                          \
        apple-touch-icon-114x114.png                                        \
        apple-touch-icon-120x120.png                                        \
        apple-touch-icon-144x144.png                                        \
        apple-touch-icon-152x152.png                                        \
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
        google-code.png                                                     \
        google-plus.png                                                     \
        icon-128.png                                                        \
        large-app-icon.png                                                  \
        programmable-web.png                                                \
        qr.png                                                              \
        stashboard-logo.png                                                 \
        wiki.png                                                            \
    )

$(ICONS_DIR)/amazon-logo.png: $(ICONS_DIR)/icon-150.png | $(ICONS_DIR)
	@   $(CP) $< $@

$(ICONS_DIR)/apple-touch-icon.png: \
    $(ICONS_DIR)/apple-touch-icon-152x152.png \
    | $(ICONS_DIR)
	@   $(CP) $< $@

$(ICONS_DIR)/apple-touch-icon-%.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, , $<,                               \
                \( +clone                                                   \
                    -channel A -morphology EdgeOut Diamond:10 +channel      \
                    +level-colors white                                     \
                \) -compose DstOver -composite                              \
                canvas:'#F2F2F2'                                            \
                -background none                                            \
                -density 96                                                 \
                -resize "$*"                                                \
                -quality 100                                                \
                -composite                                                  \
                -background '#F2F2F2'                                       \
                -alpha off                                                  \
            )

$(ICONS_DIR)/apple-touch-startup-image-%.png: | $(ICONS_DIR)
	@   $(call generate-image-from, , -size "$*" canvas:'#EEEEEE')

$(ICONS_DIR)/bitbucket.jpg: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                -background white                                           \
                -alpha off                                                  \
                -density 96                                                 \
                -resize 112x112                                             \
                -quality 100                                                \
                -gravity center                                             \
                -extent 128x128                                             \
                -background white                                           \
                -alpha off                                                  \
            )

$(ICONS_DIR)/dropbox-%.png: $(ICONS_DIR)/icon-%.png | $(ICONS_DIR)
	@   $(CP) $< $@

$(ICONS_DIR)/facebook-%.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                -background white                                           \
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
                -flatten                                                    \
                -alpha off                                                  \
            )

$(ICONS_DIR)/google-code.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, $<,                                 \
                -background none                                            \
                -density 96                                                 \
                -resize 55x55                                               \
                -quality 100                                                \
            )

$(ICONS_DIR)/google-plus.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, , $<,                               \
                -density 96                                                 \
                -background none                                            \
                -resize 320x320                                             \
                -quality 100                                                \
                -gravity center                                             \
                -extent 512x512                                             \
                -background white                                           \
                -flatten                                                    \
                -alpha off                                                  \
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
                -transparent-color '#F2F2F2'                                \
                -quality 100                                                \
            )

$(ICONS_DIR)/programmable-web.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, , $<,                               \
                -density 96                                                 \
                -background none                                            \
                -resize 250x250                                             \
                -quality 100                                                \
                -gravity center                                             \
                -extent 300x250                                             \
            )

$(ICONS_DIR)/qr.png: | $(ICONS_DIR)
	@   $(QRENCODE) --margin=1 --size=10 --output=$@ $(QM_WWW_URL)

$(ICONS_DIR)/square150x150logo.png: $(ICONS_DIR)/icon-150.png | $(ICONS_DIR)
	@   $(CP) $< $@

$(ICONS_DIR)/stashboard-logo.png: $(ICONS_DIR)/logo.png | $(ICONS_DIR)
	@   $(call generate-image-from, , $<,                               \
                -density 96                                                 \
                -background none                                            \
                -resize 182x182                                             \
                -quality 100                                                \
                -gravity center                                             \
                -extent 246x182                                             \
            )

$(ICONS_DIR)/wiki.png: $(ICONS_DIR)/icon-135.png | $(ICONS_DIR)
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
