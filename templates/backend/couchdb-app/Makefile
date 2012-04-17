#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live workflow for rapid webapp development with CouchDB.
#
#                                                       ~~ (c) SRW, 17 Apr 2012

PROJ_ROOT   :=  $(PWD)/../../../

include $(PROJ_ROOT)/tools/macros.make

APP         :=  qmachine
PROTOCOL    :=  http
URL         :=  http://127.0.0.1:5984/db/_design/$(APP)/
DB          :=  127.0.0.1:5984/db
APPRC       :=  $(PWD)/.couchapprc

COUCHAPP    :=  $(call contingent, couchapp)
CP          :=  $(call contingent, gcp cp) -rf
DATE        :=  $(call contingent, date)
OPEN        :=  $(call contingent, gnome-open open)
RM          :=  $(call contingent, grm rm) -rf
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

distclean: clobber

reset:
	@   $(call contingent, clear)

run: $(APPRC)
	@   $(COUCHAPP) push --quiet                                    ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(OPEN) $(URL)                                          ;   \
                $(call hilite, "Deployment succeeded.")                 ;   \
            else                                                            \
                $(call alert, "$$?")                                    ;   \
            fi

###

$(APPRC):
	@   $(strip $(call hilite, "Deploying to $(DB) ...")            ;   \
            printf '%s' '{"env": {"default": {"db": "$(PROTOCOL)' > $@  ;   \
            $(call read-prompt, "Username: ") && USERNAME="$${REPLY}"   ;   \
            $(call read-secure, "Password: ") && PASSWORD="$${REPLY}"   ;   \
            printf '%s' "://$${USERNAME}:$${PASSWORD}@$(DB)" '"}}}' >> $@  )

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
