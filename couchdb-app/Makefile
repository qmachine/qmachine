#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live workflow for rapid webapp development with CouchDB.
#
#                                                       ~~ (c) SRW, 06 Feb 2012

include $(PWD)/../tools/macros.make

APP         :=  qmachine
#PROTOCOL    :=  http
#URL         :=  http://localhost/
#DB          :=  127.0.0.1:5984/app
PROTOCOL    :=  https
URL         :=  http://qmachine.org
DB          :=  qmachine.couchone.com:6984/app
APPRC       :=  $(PWD)/$(APP)/.couchapprc

COUCHAPP    :=  $(call contingent, couchapp)
CP          :=  $(call contingent, rsync) --archive
OPEN        :=  $(call contingent, gnome-open open)
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

.PHONY: all clean clobber distclean reset run

all: run

clean: reset
	@   $(RM) $(APPRC)

clobber: clean
	@   $(RM) $(APP) $(DATA)

distclean: clobber
	@   cd $(PWD)/_attachments && $(MAKE) -f Makefile distclean

reset:
	@   $(call contingent, clear)

run: $(APPRC) $(APP) webpage
	@   $(CP) $(PWD)/_attachments $(APP)/                           ;   \
            $(CP) $(PWD)/.couchappignore $(APP)/                        ;   \
            $(CP) $(PWD)/couchapp.json $(APP)/                          ;   \
            $(CP) $(PWD)/filters $(APP)/                                ;   \
            $(CP) $(PWD)/rewrites.json $(APP)/                          ;   \
            $(CP) $(PWD)/validate_doc_update.js $(APP)/                 ;   \
            $(RM) $(APP)/_attachments/Makefile                          ;   \
            echo "# $${RANDOM}" >> $(APP)/_attachments/cache.manifest   ;   \
            cd $(APP) && $(COUCHAPP) push -q                            ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(OPEN) $(URL)                                          ;   \
                $(call hilite, "Deployment succeeded.")                 ;   \
            else                                                            \
                $(call alert, "$$?")                                    ;   \
            fi

###

.PHONY: webpage

webpage:
	@   cd $(PWD)/_attachments                                      ;   \
            $(MAKE) -f Makefile distclean                               ;   \
            $(MAKE) -f Makefile browser                                 ;   \
            cd $(PWD)

###

$(APP): | webpage
	@   $(call hilite, 'Generating the app ...')                    ;   \
            $(COUCHAPP) generate $(APP)                                 ;   \
            $(RM) $(APP)/_attachments/* $(APP)/evently $(APP)/filters       \
                $(APP)/lists $(APP)/README.md $(APP)/shows                  \
                $(APP)/updates $(APP)/vendor $(APP)/views

$(APPRC): $(APP)
	@   $(strip $(call hilite, "Deploying to $(DB) ...")            ;   \
            printf '%s' '{"env": {"default": {"db": "$(PROTOCOL)' > $@  ;   \
            $(call read-prompt, "Username: ") && USERNAME="$${REPLY}"   ;   \
            $(call read-secure, "Password: ") && PASSWORD="$${REPLY}"   ;   \
            printf '%s' "://$${USERNAME}:$${PASSWORD}@$(DB)" '"}}}' >> $@  )

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
