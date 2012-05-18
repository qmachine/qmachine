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
DB          := 	qmachine.iriscouch.com:5984/db

COUCHAPP    :=  $(call contingent, couchapp)
CP          :=  $(call contingent, gcp cp) -rf
DATE        :=  $(call contingent, date)
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
	@   $(COUCHAPP) push --quiet                                    ;   \
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
