#-  GNU Makefile

#-  Makefile ~~
#   This contains live instructions for building the Quanah 1.0 :-D
#                                                           ~~ SRW, 15 Nov 2010

SHELL   :=  bash

COUCHAPP:=  couchapp
APP     :=  quanah
DB      :=  localhost:5984/testing
#DB      :=  sean.couchone.com/dmz
#DB      :=  quanah.couchone.com/app
APPRC   :=  $(APP)/.couchapprc

CP      :=  rsync --archive
ECHO    :=  echo -en
HILITE  :=  hilite
RM      :=  rm -rf

.PHONY: all clean clobber reset run

all: run

clean: reset
	@   $(RM) $(APPRC)

clobber: clean
	@   $(RM) $(APP) $(DATA)

reset:
	@   clear

run: $(APPRC) $(APP)
	@   $(CP) _attachments $(APP)/                                  ;   \
            $(CP) filters $(APP)/                                       ;   \
            $(CP) rewrites.json $(APP)/                                 ;   \
            cd $(APP) && $(COUCHAPP) push -bq

###

$(APP):
	@   $(COUCHAPP) generate $(APP)                                 ;   \
            $(RM) $(APP)/_attachments/* README.md                       ;   \
            $(RM) $(APP)/{evently,lists,shows,updates,vendor,views}

$(APPRC): $(APP)
	@   $(HILITE) "--- $(DB) ---"                                   ;   \
            $(ECHO) '{"env": {"default": {"db": "http://' > $@          ;   \
            read -p "Username: " -e USERNAME                            ;   \
            read -p "Password: " -s PASSWORD && $(ECHO) '\n'            ;   \
            $(ECHO) "$${USERNAME}:$${PASSWORD}@$(DB)\"}}}" >> $@

#-  vim:set syntax=make:
