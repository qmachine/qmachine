#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for building and deploying Quanah to a
#   CouchDB instance as a "CouchApp". I have tried to maintain as much POSIX
#   compatibility as possible, but because I mainly use Mac or GNOME-based
#   Linux distributions, there are some non-standard calls hidden here. I have
#   included macros that should help highlight where these prerequisites have
#   not been met. The Python-based "couchapp" program is also required, but I
#   may add directions at some point for using the Ruby-based "soca" instead.
#
#                                                       ~~ (c) SRW, 31 Oct 2011

include ../tools/macros.make

APP         :=  quanah
#URL         :=  http://localhost
#DB          :=  localhost:5984/app
URL         :=  https://quanah-testing.couchone.com
DB          :=  quanah-testing.ic.ht:6984/app
#URL         :=  https://quanah.couchone.com
#DB          :=  quanah.ic.ht:5984/app
#DB          :=  quanah.ic.ht:5984/app   #-  quanah.couchone.com:5984/app ... ?
APPRC       :=  $(APP)/.couchapprc

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
            echo "# $${RANDOM}" >> $(APP)/_attachments/cache.manifest   ;   \
            cd $(APP) && $(COUCHAPP) push -q                            ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(OPEN) $(URL)                                          ;   \
                $(call hilite, "Deployment succeeded.")                 ;   \
            else                                                            \
                $(call alert, "$$?")                                    ;   \
            fi

###

$(APP):
	@   $(call hilite, "Generating the app ...")                    ;   \
            $(COUCHAPP) generate $(APP)                                 ;   \
            $(RM) $(APP)/_attachments/* $(APP)/evently $(APP)/filters       \
                $(APP)/lists $(APP)/README.md $(APP)/shows                  \
                $(APP)/updates $(APP)/vendor $(APP)/views

$(APPRC): $(APP)
	@   $(strip $(call hilite, "Deploying to $(DB) ...")            ;   \
            printf '%s' '{"env": {"default": {"db": "https://' > $@     ;   \
            $(call read-prompt, "Username: ") && USERNAME="$${REPLY}"   ;   \
            $(call read-secure, "Password: ") && PASSWORD="$${REPLY}"   ;   \
            printf '%s' "$${USERNAME}:$${PASSWORD}@$(DB)" '"}}}' >> $@  )

#-  vim:set syntax=make:
