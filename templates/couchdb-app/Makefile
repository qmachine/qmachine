#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live workflow for rapid webapp development with CouchDB.
#
#                                                       ~~ (c) SRW, 05 Apr 2012

PROJ_ROOT   :=  $(PWD)/../../

include $(PROJ_ROOT)/tools/macros.make

APP         :=  qmachine
PROTOCOL    :=  https
URL         :=  http://qmachine.org/
DB          :=  quanah.iriscouch.com:6984/app
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

define stamp-with-epoch-time
    $(DATE) -j -f '%a %b %d %T %Z %Y' "`date`" '+# %s' >> $(1)
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
	@   $(CP) $(PROJ_ROOT)/share/favicon.ico _attachments/          ;   \
            $(CP) $(PROJ_ROOT)/share/main.js _attachments/              ;   \
            $(CP) $(PROJ_ROOT)/share/touch-icon-i*.png _attachments/    ;   \
            $(CP) $(PROJ_ROOT)/share/web-launch-i*.png _attachments/    ;   \
            $(CP) $(PROJ_ROOT)/src/ie.js _attachments/                  ;   \
            $(CP) $(PROJ_ROOT)/src/index.html _attachments/             ;   \
            $(CP) $(PROJ_ROOT)/src/*.css _attachments/                  ;   \
            $(call stamp-with-epoch-time, _attachments/cache.manifest)  ;   \
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
