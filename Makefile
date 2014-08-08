#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live development workflow for QMachine (QM). To get started
#   with your own local sandbox, check out
#
#       https://docs.qmachine.org/en/latest/local-sandbox.html
#
#   Some optional targets may require extra packages to be installed by
#   Homebrew, including
#
#           $ brew install closure-compiler jsmin mongodb qrencode \
#               phantomjs redis yuicompressor
#
#   Icons are generated from an "icons/logo.pdf" file, but it no such file is
#   present, a green placeholder image will be created using ImageMagick. In
#   the future, the use of ImageMagick may be replaced by simply downloading
#   icons from the QM homepage (https://www.qmachine.org).
#
#   Thanks for stopping by :-)
#
#                                                       ~~ (c) SRW, 06 Feb 2012
#                                                   ~~ last updated 08 Aug 2014

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
QM_API_URL  :=  https://api.qmachine.org
QM_WWW_URL  :=  https://www.qmachine.org

db          :=  mongo

ifeq ("$(strip $(db))", "couch")
    QM_API_STRING   :=  '{"couch":"http://127.0.0.1:5984/db"}'
else ifeq ("$(strip $(db))", "mongo")
    QM_API_STRING   :=  '{"mongo":"mongodb://localhost:27017/test"}'
else ifeq ("$(strip $(db))", "postgres")
    QM_API_STRING   :=  '{"postgres":"postgres://localhost:5432/$(USER)"}'
else ifeq ("$(strip $(db))", "redis")
    QM_API_STRING   :=  '{"redis":"redis://:@127.0.0.1:6379"}'
else ifeq ("$(strip $(db))", "sqlite")
    QM_API_STRING   :=  '{"sqlite":"qm.db"}'
endif

.PHONY: all check check-versions clean clobber distclean help reset update
.SILENT: ;

'': help;

all: check-versions chrome-hosted-app homepage npm-module ruby-gem testpage

check: $(CACHE_DIR)/quanah.js | check-versions
	@   $(PHANTOMJS) --config=$(TEST_DIR)/config.json \
                $(TEST_DIR)/tests.js '$(LOCAL_ADDR)'

check-versions:
	@   $(NODEJS) $(SHARE_DIR)/check-versions.js

clean: reset
	@   $(RM) $(BUILD_DIR)/                                         ;   \
            $(CD) $(DOCS_DIR)                                           ;   \
            $(MAKE) $@                                                  ;   \
            $(RM) $(DOCS_DIR)/_static/favicon.ico

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

.PHONY: chrome-hosted-app homepage npm-module ruby-gem testpage

chrome-hosted-app:                                                          \
    $(addprefix $(BUILD_DIR)/chrome-hosted-app/,                            \
        qmachine.zip                                                        \
        snapshot-1280x800.png                                               \
        snapshot-440x280.png                                                \
    )
	@   $(call hilite, 'Created $@.')

homepage:                                                                   \
    $(addprefix $(BUILD_DIR)/homepage/,                                     \
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
        qm.js                                                               \
        respond.js                                                          \
        robots.txt                                                          \
        square150x150logo.png                                               \
        sitemap.xml                                                         \
        style-min.css                                                       \
        wiki.png                                                            \
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

testpage:                                                                   \
    $(addprefix $(BUILD_DIR)/testpage/,                                     \
        coffeescript.js                                                     \
        index.html                                                          \
        main.js                                                             \
        qm.js                                                               \
    )
	@   $(call hilite, 'Created $@.')

###

.PHONY: node-app ruby-app

node-app: | $(BUILD_DIR)/node-app/
	@   $(MAKE)                                                         \
                QM_API_STRING=$(strip $(QM_API_STRING))                     \
                QM_API_URL='$(strip $(LOCAL_ADDR))'                         \
                QM_WWW_URL='$(strip $(LOCAL_ADDR))'                         \
                    homepage                                            ;   \
            $(CD) $(BUILD_DIR)/node-app/                                ;   \
            $(NPM) install                                              ;   \
            $(NODEJS) node_modules/qm/examples/roll-up.js \
                ../homepage katamari.json                               ;   \
            $(call run-procfile, \
                QM_API_STRING=$(strip $(QM_API_STRING)) \
                QM_WWW_STRING='"$(BUILD_DIR)/$@/katamari.json"')

ruby-app: | $(BUILD_DIR)/ruby-app/
	@   $(MAKE) \
                QM_API_URL='$(strip $(LOCAL_ADDR))'                         \
                QM_WWW_URL='$(strip $(LOCAL_ADDR))'                         \
                    homepage                                            ;   \
            $(CD) $(BUILD_DIR)                                          ;   \
            if [ ! -d $@/public/ ]; then                                    \
                $(CP) homepage $@/public                                ;   \
            fi                                                          ;   \
            $(CD) $@/                                                   ;   \
            $(BUNDLE) package --all                                     ;   \
            $(call run-procfile, \
                QM_API_STRING=$(strip $(QM_API_STRING)))

###

$(BUILD_DIR):
	@   $(call make-directory, $@)

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

$(BUILD_DIR)/homepage: | $(BUILD_DIR)
	@   $(call make-directory, $@)

$(BUILD_DIR)/homepage/cache.manifest:                                       \
    $(SRC_DIR)/homepage/cache.manifest                                      \
    |   $(BUILD_DIR)/homepage
	@   $(call timestamp, $<, $@)

$(BUILD_DIR)/homepage/%.js: $(CACHE_DIR)/%.js | $(BUILD_DIR)/homepage
	@   $(call minify-js, $<, $@)

$(BUILD_DIR)/homepage/%: $(CACHE_DIR)/% | $(BUILD_DIR)/homepage
	@   $(CP) $< $@

$(BUILD_DIR)/homepage/%: $(ICONS_DIR)/% | $(BUILD_DIR)/homepage
	@   $(CP) $< $@

$(BUILD_DIR)/homepage/manifest.webapp:                                      \
    $(SRC_DIR)/homepage/manifest.webapp                                     \
    |   $(BUILD_DIR)/homepage
	@   $(CP) $< $@

$(BUILD_DIR)/node-app/: $(SRC_DIR)/node-app/ | $(BUILD_DIR)
	@   $(CP) $< $@

$(BUILD_DIR)/npm-module: $(SRC_DIR)/npm-module | $(BUILD_DIR)
	@   $(CP) $< $@

$(BUILD_DIR)/npm-module/%: $(PROJ_ROOT)/% | $(BUILD_DIR)/npm-module
	@   $(CP) $< $@

$(BUILD_DIR)/ruby-app/: $(SRC_DIR)/ruby-app/ | $(BUILD_DIR)
	@   $(CP) $< $@

$(BUILD_DIR)/ruby-gem: | $(BUILD_DIR)
	@   $(CP) $(SRC_DIR)/ruby-gem/ $@

$(BUILD_DIR)/ruby-gem/README.md: | $(BUILD_DIR)/ruby-gem/
	@   $(CP) $(PROJ_ROOT)/README.md $@

$(BUILD_DIR)/testpage: | $(BUILD_DIR)
	@   $(call make-directory, $@)

$(BUILD_DIR)/testpage/coffeescript.js:                                      \
    $(CACHE_DIR)/coffeescript.js                                            \
    | $(BUILD_DIR)/testpage/
	@   $(CP) $< $@

$(BUILD_DIR)/testpage/qm.js: $(CACHE_DIR)/qm.js | $(BUILD_DIR)/testpage/
	@   $(CP) $< $@

$(BUILD_DIR)/testpage/%: $(SRC_DIR)/testpage/% | $(BUILD_DIR)/testpage/
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

$(CACHE_DIR)/qm.js:                                                         \
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
