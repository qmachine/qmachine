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

include ../tools/macros.make

APP         :=  quanah
DB          :=  localhost:5984/app
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
