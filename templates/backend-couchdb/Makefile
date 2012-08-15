#-  GNU Makefile

#-  Makefile ~~
#                                                       ~~ (c) SRW, 18 May 2012
#                                                   ~~ last updated 15 Aug 2012

PROJ_ROOT   :=  $(PWD)/../..#

include $(PROJ_ROOT)/tools/macros.make

DB_DIR      :=  $(PWD)/db
RO_DIR      :=  $(PWD)/read-only
WWW_DIR     :=  $(PWD)/www
APP_DIRS    :=  $(DB_DIR) $(RO_DIR) $(WWW_DIR)

COUCHAPP    :=  $(call contingent, couchapp) --quiet
CP          :=  $(call contingent, gcp cp) -rf
DATE        :=  $(call contingent, date)
MKDIR       :=  $(call contingent, gmkdir mkdir)
RM          :=  $(call contingent, grm rm) -rf

STATIC_CONTENT := \
    $(addprefix $(WWW_DIR)/_attachments/,   \
        apple-touch-icon-57x57.png          \
        apple-touch-icon-72x72.png          \
        apple-touch-icon-114x114.png        \
        apple-touch-icon-144x144.png        \
        cache.manifest                      \
        favicon.ico                         \
        giant-favicon.ico                   \
        homepage.js                         \
        ie.js                               \
        index.html                          \
        q.js                                \
        q-min.js                            \
        robots.txt                          \
        style-min.css                       \
        web-launch-image-iphone.png         \
        web-launch-image-iphone4.png        \
    )

define get-login
    $(strip \
        $(call hilite, "Authenticating for $(1) ...")                   ;   \
        printf '%s' '{"env": {"default": {"db": "$(strip $(2))' > $(3)  ;   \
        $(call read-prompt, "Username: ") && USERNAME="$${REPLY}"       ;   \
        $(call read-secure, "Password: ") && PASSWORD="$${REPLY}"       ;   \
        printf '%s' "://$${USERNAME}:$${PASSWORD}@$(strip $(1))" \
                                                        '"}}}' >> $(3)  ;   \
    )
endef

define stamp-with-epoch-time
    $(DATE) -j -f '%a %b %d %T %Z %Y' "`date`" '+# %s' >> $(1)
endef

.PHONY: all clean clobber distclean reset run
.SILENT: ;

all: run

clean: reset

clobber: clean

distclean: clobber
	@   $(RM) $(APP_DIRS:%=%/.couchapprc)

reset:
	@   $(call contingent, clear)

run: $(STATIC_CONTENT)

###

.PHONY: deploy

deploy: \
    $(APP_DIRS:%=%/.couchappignore) \
    $(APP_DIRS:%=%/.couchapprc)     \
    $(STATIC_CONTENT)
	@   for each in $(APP_DIRS); do                                     \
                $(call aside, "Pushing $${each} ...")                   ;   \
                cd $${each}                                             ;   \
                $(COUCHAPP) push                                        ;   \
            done                                                        ;   \
            $(call hilite, 'Done.')

###

.NOTPARALLEL: $(APP_DIRS:%=%/.couchapprc)

$(APP_DIRS) $(WWW_DIR)/_attachments/:
	@   for each in $@; do                                              \
                if [ ! -f $${each} ]; then                                  \
                    $(MKDIR) $${each}                                   ;   \
                fi                                                      ;   \
            done

$(DB_DIR)/.couchapprc: | $(DB_DIR)/
	@   $(call get-login, qmachine.iriscouch.com:6984/db, https, $@)

$(RO_DIR)/.couchapprc: $(DB_DIR)/.couchapprc | $(RO_DIR)/
	@   $(CP) $< $@

$(STATIC_CONTENT): | $(WWW_DIR)/_attachments/

$(WWW_DIR)/.couchapprc: | $(WWW_DIR)/
	@   $(call get-login, qmachine.iriscouch.com:6984/www, https, $@)

$(WWW_DIR)/_attachments/cache.manifest: $(PROJ_ROOT)/src/cache.manifest
	@   $(CP) $< $@                                                 ;   \
            $(call stamp-with-epoch-time, $@)

$(WWW_DIR)/_attachments/: | $(WWW_DIR)/

$(WWW_DIR)/_attachments/%: $(PROJ_ROOT)/deps/%
	@   $(CP) $< $@

$(WWW_DIR)/_attachments/%: $(PROJ_ROOT)/share/%
	@   $(CP) $< $@

$(WWW_DIR)/_attachments/%: $(PROJ_ROOT)/src/%
	@   $(CP) $< $@

###

$(PWD)/%/.couchappignore: $(PWD)/.couchappignore | $(PWD)/%/
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
