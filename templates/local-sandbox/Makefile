#-  GNU Makefile

#-  Makefile ~~
#
#   This is a specialized version of my personal web development workflow. In
#   particular, it assumes you are using the latest stable releases of Apache
#   CouchDB and Node.js on Mac OS X Lion, with various other programs installed
#   via Homebrew. At the moment, I am testing with
#
#       -   Apache CouchDB 1.2.0,
#       -   Node.js 0.8 (+ NPM 1.1.32),
#       -   Mac OS X 10.7.4.
#
#                                                       ~~ (c) SRW, 27 Jun 2012

TEMPLATE_ROOT   :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))
PROJECT_ROOT    :=  $(realpath $(TEMPLATE_ROOT)/../../)
VARDIR          :=  $(abspath $(TEMPLATE_ROOT)/var)

BCLIENT         :=  $(VARDIR)/couchapp-browser-client
STORAGE         :=  $(VARDIR)/couchapp-storage
WWWDIR          :=  $(abspath $(TEMPLATE_ROOT)/browser-client/_attachments)

include $(PROJECT_ROOT)/tools/macros.make

CD              :=  $(call contingent, cd)
COUCHAPP        :=  $(call contingent, couchapp) --quiet
CP              :=  $(call contingent, gcp cp) -rf
DATE            :=  $(call contingent, date)
LAUNCHCTL       :=  $(call contingent, launchctl)
MKDIR           :=  $(call contingent, gmkdir mkdir)
NODEJS          :=  $(call contingent, nodejs node)
NPM             :=  $(call contingent, npm)
OPEN            :=  $(call contingent, gnome-open open curl)
RM              :=  $(call contingent, grm rm) -rf
RUBY            :=  $(call contingent, ruby)
SED             :=  $(call contingent, gsed sed)

COUCH_HOST      :=  localhost:5984
NODE_HOST       :=  localhost:8124
HOMEPAGE        :=  http://$(strip $(NODE_HOST))
SERVICES        :=  couchdb nodejs
PLISTS          :=  $(SERVICES:%=$(VARDIR)/com.srw.%.plist)
SERVDIRS        :=  $(SERVICES:%=$(VARDIR)/%/)

STATIC_CONTENT := \
    $(addprefix $(WWWDIR)/, \
        cache.manifest                  \
        favicon.ico                     \
        giant-favicon.ico               \
        ie.js                           \
        index.html                      \
        main.js                         \
        print.css                       \
        q.js                            \
        q-min.js                        \
        robots.txt                      \
        screen.css                      \
        touch-icon-ipad.png             \
        touch-icon-ipad3.png            \
        touch-icon-iphone.png           \
        touch-icon-iphone4.png          \
        web-launch-image-iphone.png     \
        web-launch-image-iphone4.png    )

define get-login
    $(strip \
        $(call hilite, "Authenticating for $(1) ...")                   ;   \
        DATABASE="$(strip $(2))://"                                     ;   \
        $(call read-prompt, "Username: ") &&                                \
            DATABASE="$${DATABASE}$${REPLY}:"                           ;   \
        $(call read-secure, "Password: ") &&                                \
            DATABASE="$${DATABASE}$${REPLY}@$(strip $(1))"              ;   \
        curl -X PUT $${DATABASE}                                        ;   \
        printf '{"env": {"default": {"db": "%s"}}}' $${DATABASE} > $(3)     )
endef

define replace-hostname
    for each in $(1); do                                                    \
        $(SED) 's/qmachine.org/$(strip $(NODE_HOST))/g' $${each} -i      ;   \
    done
endef

define timestamp
    for each in $(1); do                                                    \
        $(DATE) -j -f '%a %b %d %T %Z %Y' "`date`" '+# %s' >> $${each}  ;   \
    done
endef

.PHONY: all clean clobber distclean reset run

all: run

clean: reset stop

clobber: clean
	@   $(RM) $(PLISTS)

distclean: clobber
	@   $(RM) $(VARDIR)/

reset:
	@   $(call contingent, clear)

run: browser-client

###

.PHONY: browser-client deploy preflight start stop

browser-client: | deploy start
	@   $(OPEN) $(HOMEPAGE)

deploy: $(SERVICES:%=%-inflight) | start

preflight: $(SERVICES:%=%-preflight) $(SERVDIRS)

start: $(PLISTS) preflight
	@   for each in $(PLISTS); do                                       \
                $(LAUNCHCTL) load -w $${each} >/dev/null 2>&1           ;   \
            done

stop: $(PLISTS)
	@   for each in $(PLISTS); do                                       \
                $(LAUNCHCTL) unload -w $${each} >/dev/null 2>&1         ;   \
            done

###

$(PLISTS) $(SERVDIRS): | $(VARDIR)/

$(PLISTS): $(TEMPLATE_ROOT)/generate-config.rb
	@   $(RUBY) $< $@

$(SERVDIRS) $(VARDIR)/ $(WWWDIR)/:
	@   for each in $@; do                                              \
                if [ ! -d $${each} ]; then                                  \
                    $(MKDIR) $${each}                                   ;   \
                fi                                                      ;   \
            done

###

.PHONY: couchdb-inflight couchdb-preflight
.NOTPARALLEL: couchdb-inflight

couchdb-inflight: \
    $(BCLIENT)/.couchappignore  \
    $(BCLIENT)/.couchapprc      \
    $(STORAGE)/.couchappignore  \
    $(STORAGE)/.couchapprc
	@   for each in $(VARDIR)/couchapp-*; do                            \
                $(CD) $${each}                                          ;   \
                $(call aside, "Pushing $${each} ...")                   ;   \
                $(COUCHAPP) push                                        ;   \
            done

couchdb-preflight: $(BCLIENT) $(STORAGE) $(VARDIR)/couchdb.ini
	@   $(call replace-hostname, $(BCLIENT)/_attachments/*.js)      ;   \
            $(call timestamp, $(BCLIENT)/_attachments/*.manifest)

$(BCLIENT): $(TEMPLATE_ROOT)/browser-client | $(STATIC_CONTENT) $(VARDIR)/
	@   if [ ! -d $@ ]; then $(CP) $< $@; fi

$(BCLIENT)/.couchapprc: | $(BCLIENT) start
	@   $(call get-login, $(strip $(COUCH_HOST))/www, http, $@)

$(STATIC_CONTENT): | $(WWWDIR)/

$(STORAGE): $(TEMPLATE_ROOT)/storage | $(VARDIR)/
	@   if [ ! -d $@ ]; then $(CP) $< $@; fi

$(STORAGE)/.couchapprc: | $(STORAGE) start
	@   $(call get-login, $(strip $(COUCH_HOST))/db, http, $@)

$(VARDIR)/couchdb.ini: $(TEMPLATE_ROOT)/generate-config.rb | $(VARDIR)/
	@   $(RUBY) $< $@

$(VARDIR)/%/.couchappignore: $(TEMPLATE_ROOT)/.couchappignore | $(VARDIR)/%/
	@   $(CP) $< $@

$(WWWDIR)/%: $(PROJECT_ROOT)/share/% | $(WWWDIR)/
	@   $(CP) $< $@

$(WWWDIR)/%: $(PROJECT_ROOT)/src/% | $(WWWDIR)/
	@   $(CP) $< $@

###

.PHONY: nodejs-client nodejs-inflight nodejs-preflight

nodejs-client: $(VARDIR)/nodejs/client.js | start deploy
	@   $(NODEJS) $<

nodejs-inflight: ;

nodejs-preflight: \
    $(VARDIR)/nodejs/node_modules  \
    $(VARDIR)/nodejs/server.js

$(TEMPLATE_ROOT)/%/node_modules/: $(TEMPLATE_ROOT)/%/package.json
	@   $(CD) $(TEMPLATE_ROOT)/$*                                   ;   \
            $(NPM) install

$(VARDIR)/nodejs/node_modules/: \
    $(TEMPLATE_ROOT)/nodejs-client/node_modules \
    $(TEMPLATE_ROOT)/server/node_modules

$(VARDIR)/nodejs/node_modules/: | $(VARDIR)/nodejs/
	@   if [ ! -d $@ ]; then                                            \
                $(MKDIR) $@                                             ;   \
            fi                                                          ;   \
            for each in $^; do                                              \
                $(CP) $${each}/* $@                                     ;   \
            done

$(VARDIR)/nodejs/%: $(TEMPLATE_ROOT)/nodejs-client/% | $(VARDIR)/nodejs/
	@   $(CP) $< $@

$(VARDIR)/nodejs/%: $(TEMPLATE_ROOT)/server/% | $(VARDIR)/nodejs/
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
