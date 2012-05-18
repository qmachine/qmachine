#-  GNU Makefile

#-  Makefile ~~
#
#   This contains a live workflow for rapid webapp development with CouchDB.
#
#                                                       ~~ (c) SRW, 17 May 2012

PROJ_ROOT   :=  $(PWD)/../../../

include $(PROJ_ROOT)/tools/macros.make

APP         :=  read-only
DB          := 	qmachine.iriscouch.com:5984/db
PROTOCOL    :=  http

COUCHAPP    :=  $(call contingent, couchapp) --quiet
CP          :=  $(call contingent, gcp cp) -rf
RM          :=  $(call contingent, grm rm) -rf

.PHONY: all clean clobber distclean reset run

all: run

clean: reset
	@   $(RM) .couchapprc

clobber: clean

distclean: clobber
	@   $(RM) .couchappignore

reset:
	@   $(call contingent, clear)

run: .couchappignore .couchapprc
	@   $(COUCHAPP) push                                            ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(call hilite, "Deployment succeeded.")                 ;   \
            else                                                            \
                $(call alert, "$$?")                                    ;   \
            fi

###

.couchapprc:
	@   $(strip $(call hilite, "Enter credentials for $(DB) ...")   ;   \
            printf '%s' '{"env": {"default": {"db": "$(PROTOCOL)' > $@  ;   \
            $(call read-prompt, "Username: ") && USERNAME="$${REPLY}"   ;   \
            $(call read-secure, "Password: ") && PASSWORD="$${REPLY}"   ;   \
            printf '%s' "://$${USERNAME}:$${PASSWORD}@$(DB)" '"}}}' >> $@   )

.couchappignore: ../.couchappignore
	@   $(CP) $< $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
