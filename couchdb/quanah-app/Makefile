#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for building Quanah 2.0, which has been
#   thoroughly reworked in order to take advantage of Web Chassis :-)
#
#   NOTE: I have included many of the same macros I use in Web Chassis, which
#   means I will have to review open-source licenses before I release this!
#
#                                                       ~~ (c) SRW, 20 Aug 2011

SHELL   :=  sh

define gray-printf
    printf '\033[1;30m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define grey-printf
    printf '\033[1;30m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define red-printf
    printf '\033[1;31m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define green-printf
    printf '\033[1;32m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define yellow-printf
    printf '\033[1;33m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define blue-printf
    printf '\033[1;34m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define magenta-printf
    printf '\033[1;35m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define cyan-printf
    printf '\033[1;36m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define white-printf
    printf '\033[1;37m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define alert
    $(call red-printf, '--> ERROR: %s\n', $(strip $(1))) >&2
endef

define aside
    $(call gray-printf, '--> %s\n', $(strip $(1)))
endef

define hilite
    $(call cyan-printf, '--> %s\n', $(strip $(1)))
endef

define available
    $(shell \
        for each in $(1); do                                                \
            command -v $${each} >/dev/null 2>&1                         ;   \
            if [ $$? -eq 0 ]; then                                          \
                command -v $${each}                                     ;   \
            fi                                                          ;   \
        done                                                                \
    )
endef

define contingent
    $(shell \
        contingent() {                                                      \
            for each in $$@; do                                             \
                command -v $${each} >/dev/null 2>&1                     ;   \
                if [ $$? -eq 0 ]; then                                      \
                    command -v $${each}                                 ;   \
                    return $$?                                          ;   \
                fi                                                      ;   \
            done                                                        ;   \
            printf 'echo "\033[1;31m(%s)\033[1;0m"' '$(firstword $(1))' ;   \
            return 1                                                    ;   \
        }                                                               ;   \
        contingent $(1)                                                     \
    )
endef

APP         :=  quanah
DB          :=  localhost:5984/testing
#DB         :=  sean.couchone.com/dmz
#DB         :=  quanah.couchone.com/app
APPRC       :=  $(APP)/.couchapprc

COUCHAPP    :=  $(call contingent, couchapp)
CP          :=  $(call contingent, rsync) --archive
RM          :=  $(call contingent, rm) -rf
STTY        :=  $(call contingent, stty)

define read-prompt
    printf '%s' $(1)                                                    ;   \
    read REPLY
endef

define read-secure
    $(STTY) -echo                                                       ;   \
    $(call read-prompt, $(1))                                           ;   \
    $(STTY) echo                                                        ;   \
    printf '\n' ''
endef

.PHONY: all clean clobber reset run

all: run

clean: reset
	@   $(RM) $(APPRC)

clobber: clean
	@   $(RM) $(APP) $(DATA)

reset:
	@   $(call contingent, clear)

run: $(APPRC) $(APP)
	@   $(CP) _attachments $(APP)/                                  ;   \
            $(CP) couchapp.json $(APP)/                                 ;   \
            $(CP) .couchappignore $(APP)/                               ;   \
            $(CP) filters $(APP)/                                       ;   \
            $(CP) rewrites.json $(APP)/                                 ;   \
            $(CP) validate_doc_update.js $(APP)/                        ;   \
            cd $(APP) && $(COUCHAPP) push -bq                           ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(call hilite, "Deployment succeeded.")                 ;   \
            else                                                            \
                $(call alert, "$$?")                                    ;   \
            fi

###

$(APP):
	@   $(call hilite, "Generating the app ...")                    ;   \
            $(COUCHAPP) generate $(APP)                                 ;   \
            $(RM) $(APP)/_attachments/* $(APP)/evently $(APP)/lists         \
                $(APP)/README.md $(APP)/shows $(APP)/updates                \
                $(APP)/vendor $(APP)/views

$(APPRC): $(APP)
	@   $(strip $(call hilite, "Deploying to $(DB) ...")            ;   \
            printf '%s' '{"env": {"default": {"db": "http://' > $@      ;   \
            $(call read-prompt, "Username: ") && USERNAME="$${REPLY}"   ;   \
            $(call read-secure, "Password: ") && PASSWORD="$${REPLY}"   ;   \
            printf '%s' "$${USERNAME}:$${PASSWORD}@$(DB)" '"}}}' >> $@  )

#-  vim:set syntax=make:
