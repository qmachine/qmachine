# Makefile

# This constitutes a set of "live directions" for creating a CouchDB application
# using 'couchapp', the Python utility recommended by the O'Reilly "Relax" book.
# Everything has been written and tested on an Ubuntu Lucid localhost CouchDB,
# version 0.10 (default installed by 'aptitude'). I was also interested in using
# 'node.couchapp.js' to construct Quanah, right up until this worked, haha. It
# could be simpler to use, since it would allow everything to be written in JS,
# but for now I have no plans to pursue that route.
#                                                           -- SRW, 07 Jul 2010

SHELL       :=  bash                    #
ECHO        :=  echo -en                # use explicit formatting (ie, '\n')
RM          :=  rm -rf                  # delete folders as well as files
CP          :=  rsync --archive         # 'rsync' is smarter than 'cp'
CURL        :=  curl -X                 #
COUCHAPP    :=  couchapp                # if missing, sudo easy_install couchapp

APP         :=  quanah
URL         :=  quanah.couchone.com:5984/app
HOMEPAGE    :=  $(URL)/_design/$(APP)/index.html

FRONTEND    :=  frontend
BACKEND     :=  backend
OTHER       :=  other

FAVICON     :=  $(FRONTEND)/favicon.ico
LOGO        :=  $(FRONTEND)/logo.jpg
JSON        :=  $(FRONTEND)/json2.js
STDLIB      :=  $(FRONTEND)/stdlib.js
MATHS       :=  $(FRONTEND)/Maths.js

.PHONY: all clean clobber reset run

all: run

clean: reset
	@   $(RM) $(OTHER)/*.{aux,log,pdf}

clobber: clean
	@   $(RM) $(APP) $(JSON) $(MATHS) $(STDLIB)

reset:
	@   clear

run: $(APP) $(FAVICON) $(JSON) $(MATHS)
	@   $(CP) $(BACKEND)/*.json $(APP)/                             ;   \
            $(CP) $(BACKEND)/filters-code.js $(APP)/filters/code.js     ;   \
            $(CP) $(BACKEND)/update-create.js $(APP)/updates/create.js  ;   \
            $(CP) $(FRONTEND)/* $(APP)/_attachments/                    ;   \
            $(ECHO) "Username: " && read USER                           ;   \
            $(ECHO) "Password: " && read -s PASSWD                      ;   \
            $(ECHO) "\n"                                                ;   \
            $(COUCHAPP) push -bq $(APP) "http://$${USER}:$${PASSWD}@$(URL)"

###

$(APP):
	@   $(COUCHAPP) generate $(APP)                                 ;   \
            mkdir -p $(APP)/filters $(APP)/updates                      ;   \
            $(RM) $(APP)/{_attachments/*,evently,lists,shows,views,vendor}

$(JSON):
	@   $(ECHO) '//' > $@                                           ;   \
            $(CURL) GET http://www.json.org/json2.js >> $@

$(MATHS): $(STDLIB)
	@   $(CURL) GET http://libjs-maths.googlecode.com/hg/Maths.js > $@

$(STDLIB): $(JSON)
	@   $(CURL) GET http://libjs-maths.googlecode.com/hg/stdlib.js > $@

###
# The following directions were used on Ubuntu Linux to create the logo and
# favicon from scratch, programmatically. Since they aren't guaranteed to work
# in other environments, the images themeselves are stored in this repository
# along with the original source file (other/favicon.tex). This problem will be
# addressed at a future date.

$(FAVICON) $(LOGO): $(OTHER)/favicon.tex
	@   PDF="$(<:%.tex=%.pdf)"                                      ;   \
            pdflatex -output-directory $(OTHER) $<                      ;   \
            pdfcrop --margin 1 $${PDF} $${PDF}                          ;   \
            pdftoppm -scale-to-x 16 -scale-to-y 16 $${PDF} |                \
                ppmtowinicon > $(FAVICON)                               ;   \
            pdftoppm -scale-to-x 128 -scale-to-y 128 $${PDF} |              \
                ppmtojpeg > $(LOGO)

#
