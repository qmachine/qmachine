#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live workflow for rapid webapp development with CouchDB.
#
#                                                       ~~ (c) SRW, 15 Mar 2012

include $(PWD)/../../tools/macros.make

APP         :=  qmachine
#PROTOCOL    :=  http
#URL         :=  http://localhost/
#DB          :=  127.0.0.1:5984/sandbox
PROTOCOL    :=  https
URL         :=  http://qmachine.org
DB          :=  qmachine.couchone.com:6984/app
APPRC       :=  $(PWD)/.couchapprc

COUCHAPP    :=  $(call contingent, couchapp)
CP          :=  $(call contingent, gcp cp) -rf
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
	@   $(CP) $(PWD)/../../share/favicon.ico $(PWD)/_attachments    ;   \
            $(CP) $(PWD)/../../share/main.js $(PWD)/_attachments        ;   \
            $(CP) $(PWD)/../../src/index.html $(PWD)/_attachments       ;   \
            $(CP) $(PWD)/../../src/*.css $(PWD)/_attachments            ;   \
            echo "# $${RANDOM}" >> $(PWD)/_attachments/cache.manifest   ;   \
            $(COUCHAPP) push --quiet                                    ;   \
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
