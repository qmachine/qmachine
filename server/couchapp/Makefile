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
CP          :=  rsync --archive         # 'rsync' is a smarter than 'cp'
CURL        :=  curl -X                 #
BROWSE      :=  gnome-www-browser       # 'gnome-open' also works
COUCHAPP    :=  couchapp                # missing? 'sudo easy_install couchapp'

APP         :=  quanah
URL         :=  "http://localhost:5984/$(APP)"
HOMEPAGE    :=  $(URL)/_design/$(APP)/index.html

FRONTEND    :=  frontend
BACKEND     :=  backend
OTHER       :=  other
JSON        :=  $(FRONTEND)/json2.js
LOGO        :=  $(FRONTEND)/logo.jpg
MATHS       :=  $(FRONTEND)/Maths.js
FAVICON     :=  $(FRONTEND)/favicon.ico

.PHONY: all clean clobber reset run

all: run
	@   $(BROWSE) $(HOMEPAGE)

clean: reset
	@   $(RM) $(OTHER)/*.{aux,log,pdf}

clobber: clean
	@   $(RM) $(APP) $(FAVICON) $(JSON) $(LOGO) $(MATHS)
	@   $(CURL) DELETE $(URL) > /dev/null 2>&1

reset:
	@   clear

run: $(APP) $(FAVICON) $(JSON) $(MATHS)
	@   $(CP) $(BACKEND)/couchapp.json $(APP)/                      ;   \
            $(CP) $(BACKEND)/filters-code.js $(APP)/filters/code.js     ;   \
            $(CP) $(FRONTEND)/* $(APP)/_attachments/                    ;   \
            $(COUCHAPP) push $(APP) $(URL)

###

$(APP):
	@   $(COUCHAPP) generate $(APP)                                 ;   \
            mkdir -p $(APP)/filters                                     ;   \
            $(RM) $(APP)/{_attachments/*,evently,lists,shows,views,vendor}

$(JSON):
	@   $(ECHO) '//' > $@                                           ;   \
            $(CURL) GET http://www.json.org/json2.js >> $@

$(MATHS):
	@   $(CURL) GET http://libjs-maths.googlecode.com/hg/Maths.js > $@

$(FAVICON) $(LOGO): $(OTHER)/favicon.tex
	@   PDF="$(<:%.tex=%.pdf)"                                      ;   \
            pdflatex -output-directory $(OTHER) $<                      ;   \
            pdfcrop --margin 1 $${PDF} $${PDF}                          ;   \
            pdftoppm -scale-to-x 16 -scale-to-y 16 $${PDF} |                \
                ppmtowinicon > $(FAVICON)                               ;   \
            pdftoppm -scale-to-x 128 -scale-to-y 128 $${PDF} |              \
                ppmtojpeg > $(LOGO)

#
