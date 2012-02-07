#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for testing JavaScript programs :-)
#
#                                                       ~~ (c) SRW, 06 Feb 2012

include ../../tools/macros.make

JS      :=  v8 js jsc d8 node nodejs narwhal-jsc rhino ringo narwhal    \
                couchjs phantomjs #avmshell
ALLJS   :=  $(call available, $(sort $(JS)))
USEJS   :=  $(strip $(call contingent, $(JS)))
JSLIBS  :=  libs.js
QUANAH  :=  quanah.js
SRCJS   :=  $(JSLIBS) $(QUANAH) fs.js demo.js
EXEJS   :=  main.js
HTML    :=  index.html

CAT     :=  $(call contingent, cat)
CLOSURE :=  $(call contingent, closure)
CP      :=  $(call contingent, rsync cp)
CURL    :=  $(call contingent, curl) #-sS
OPEN    :=  $(call contingent, gnome-open open)
RM      :=  $(call contingent, rm) -rf
TIME    :=  $(call contingent, time)
TOUCH   :=  $(call contingent, touch)
WEBPAGE :=  $(call contingent, webpage) #-  a personal Ruby script

define compile-js
    $(call aside, 'Processing $(2) ...')                                ;   \
    $(CLOSURE) --compilation_level SIMPLE_OPTIMIZATIONS \
        --js $(1) --js_output_file $(2)
endef

define fetch-url
    $(call hilite, 'Fetching "$(strip $(2))" ...')                      ;   \
    $(CURL) -o $(2) $(1)
endef

.PHONY: all clean clobber distclean reset run
.INTERMEDIATE: jslint.js json2.js
.SILENT: ;

all: run

clean: reset
	@   $(RM) $(EXEJS) results1.out results2.out time-data.out

clobber: clean
	@   $(RM) $(filter-out $(SRCJS), $(wildcard *.js))

distclean: clobber
	@   $(RM) .d8_history .v8_history libs.js

reset:
	@   $(call contingent, clear)

run: quick

###

.PHONY: benchmark browse browser check quick

benchmark: $(EXEJS)
	@   $(RM) time-data.out                                         ;   \
            for each in $(ALLJS); do                                        \
                $(call aside, $${each})                                 ;   \
                for i in 1 2 3; do                                          \
                    echo $${each} >>time-data.out 2>&1                  ;   \
                    ($(TIME) $${each} $(EXEJS) >/dev/null 2>&1)             \
                                                >>time-data.out 2>&1    ;   \
                done                                                    ;   \
            done                                                        ;   \
            $(call hilite, '(analysis placeholder)')

browse: browser
	@   $(OPEN) $(HTML)

browser: $(EXEJS) $(HTML)

check: $(EXEJS)
	@   $(RM) results1.out results2.out                             ;   \
            for each in $(ALLJS); do                                        \
                $(call aside, $${each})                                 ;   \
                if [ ! -f results1.out ]; then                              \
                    $${each} $(EXEJS) 2>&1 >results1.out                ;   \
                    if [ $$? -eq 0 ]; then                                  \
                        $(call hilite, 'Success.')                      ;   \
                    else                                                    \
                        $(call alert, 'Failure (execution).')           ;   \
                    fi                                                  ;   \
                    sort results1.out -o results1.out                   ;   \
                else                                                        \
                    $${each} $(EXEJS) 2>&1 >results2.out                ;   \
                    if [ $$? -eq 0 ]; then                                  \
                        sort results2.out -o results2.out               ;   \
                        diff results1.out results2.out 2>&1 >/dev/null  ;   \
                        if [ $$? -eq 0 ]; then                              \
                            $(call hilite, 'Success.')                  ;   \
                        else                                                \
                            $(call alert, 'Failure (different output).');   \
                        fi                                              ;   \
                    else                                                    \
                        $(call alert, 'Failure (execution).')           ;   \
                    fi                                                  ;   \
                fi                                                      ;   \
            done

quick:
	@   QUICK_JS_FILE="$${RANDOM}-$(strip $(EXEJS))"                ;   \
            $(CAT) $(filter-out $(JSLIBS), $(SRCJS)) > $${QUICK_JS_FILE};   \
            $(call aside, $(USEJS))                                     ;   \
            $(TIME) $(USEJS) $${QUICK_JS_FILE}                          ;   \
            if [ $$? -eq 0 ]; then                                          \
                $(call hilite, 'Success.')                              ;   \
            else                                                            \
                $(call alert, 'Failure.')                               ;   \
            fi                                                          ;   \
            $(RM) $${QUICK_JS_FILE}

###

$(EXEJS): $(SRCJS)
	@   $(CAT) $^ > $@

$(HTML): | $(EXEJS)
	@   $(WEBPAGE) -o $@ $(EXEJS)

$(JSLIBS): jslint.js json2.js
	@   TEMP_JS_FILE="$${RANDOM}-$(JSLIBS)"                         ;   \
            $(CAT) $^ > $${TEMP_JS_FILE}                                ;   \
            $(call compile-js, $${TEMP_JS_FILE}, $(JSLIBS))             ;   \
            $(RM) $${TEMP_JS_FILE}

###

#-  NOTE: I cache a few JavaScript frameworks and libraries in a directory on
#   my personal machine, and I highly recommend it for rapid development. If
#   you don't have the same personal settings, though, these directions will
#   still fall back to our trusty friend 'curl' :-)

jslint.js:
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            if [ -f $(CODEBANK)/lib/JavaScript/jslint.js ]; then            \
                $(CP) $(CODEBANK)/lib/JavaScript/jslint.js $@           ;   \
            else                                                            \
                $(CURL) -o $@ $${CROCKHUB}/JSLint/master/jslint.js      ;   \
            fi

json2.js:
	@   CROCKHUB="https://raw.github.com/douglascrockford"          ;   \
            if [ -f $(CODEBANK)/lib/JavaScript/json2.js ]; then             \
                $(CP) $(CODEBANK)/lib/JavaScript/json2.js $@            ;   \
            else                                                            \
                $(CURL) -o $@ $${CROCKFORD}/JSON-js/master/json2.js     ;   \
            fi 

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
