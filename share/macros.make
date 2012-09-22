#-  GNU Makefile

#-  macros.make ~~
#
#   This contains lots of useful definitions I have written for GNU Makefiles.
#   I have gathered them so I can include them in other Makefiles conveniently
#   and "traceably". This helps me considerably in debugging, both by storing
#   the already-debugged forms and also by storing things at a fixed filepath.
#
#   NOTE: Documentation has been removed but will be added again later (maybe).
#
#                                                       ~~ (c) SRW, 18 Sep 2012

SHELL   :=  sh
ECHO    :=  echo -e

.SUFFIXES: ;

define alert
    $(call red-printf, 'Error: %s\n', $(strip $(1))) >&2
endef

define aside
    $(call gray-printf, '--> %s\n', $(strip $(1)))
endef

define available
    $(shell \
        for each in $(1); do                                                \
            command -v $${each} >/dev/null 2>&1                         ;   \
            if [ $$? -eq 0 ]; then                                          \
                command -v $${each}                                     ;   \
            fi                                                          ;   \
        done                                                                \
    )
endef

define compile-css
    if [ $(words $(1)) -eq 1 ]; then                                        \
        $(call aside, "Optimizing stylesheet: $(1) -> $(2)")            ;   \
    else                                                                    \
        $(call aside, "Optimizing stylesheets: $(1) -> $(2)")           ;   \
    fi                                                                  ;   \
    $(CAT) $(1) > $(2)                                                  ;   \
    $(YUICOMP) --type css $(2) -o $(2)
endef

define compile-js
    if [ $(words $(1)) -eq 1 ]; then                                        \
        $(call aside, "Optimizing script: $(1) -> $(2)")                ;   \
    else                                                                    \
        $(call aside, "Optimizing scripts: $(1) -> $(2)")               ;   \
    fi                                                                  ;   \
    $(call compile-with-google-closure, $(1), $(2))
endef

define compile-with-cat
    $(CAT) $(1) > $(2)
endef

define compile-with-google-closure
    $(CLOSURE) --compilation_level SIMPLE_OPTIMIZATIONS \
        $(1:%=--js %) --js_output_file $(2)
endef

define compile-with-yuicompressor
    $(CAT) $(1) > $(2)                                                  ;   \
    $(YUICOMP) --type js $(2) -o $(2)
endef

define contingent
    $(shell \
        contingent() {                                                      \
            for each in $$@; do                                             \
                command -v $${each} >/dev/null 2>&1                     ;   \
                if [ $$? -eq 0 ]; then                                      \
                    command -v $${each}                                 ;   \
                    return $$?                                          ;   \
                fi                                                      ;   \
            done                                                        ;   \
            printf 'echo "\033[1;31m(%s)\033[1;0m"' '$(firstword $(1))' ;   \
            return 1                                                    ;   \
        }                                                               ;   \
        contingent $(1)                                                     \
    )
endef

define cyan-printf
    printf '\033[1;36m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define download-url
    $(call aside, 'Retrieving $(notdir $@) ...')                        ;   \
    $(CURL) -s -o $@ $(1)                                               ;   \
    if [ $$? -ne 0 ]; then                                                  \
        if [ -f $(CODEBANK)/lib/JavaScript/$(notdir $@) ]; then             \
            $(CP) $(CODEBANK)/lib/JavaScript/$(notdir $@) $@            ;   \
        elif [ -f $(CODEBANK)/lib/CSS/$(notdir $@) ]; then                  \
            $(CP) $(CODEBANK)/lib/CSS/$(notdir $@) $@                   ;   \
        else                                                                \
            $(call alert, 'Unable to retrieve $(notdir $@).')           ;   \
            exit 1                                                      ;   \
        fi                                                              ;   \
    fi
endef

define generate-image-from
    $(call aside, 'Generating $(notdir $@) ...')                        ;   \
    $(CONVERT) $(2) $(3) $(1) $@
endef

define gray-printf
    printf '\033[1;30m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define hilite
    $(call cyan-printf, '--> %s\n', $(strip $(1)))
endef

define make-directory
    if [ ! -d "$@" ]; then $(MKDIR) "$@"; fi
endef

define open-in-browser
    $(strip $(foreach page, $(1),                                           \
        browser="$(call contingent, \
            gnome-www-browser gnome-open x-www-browser open)"           ;   \
        $(if $(filter http%,$(page)),                                       \
            $${browser} $(page),                                            \
            if [ -f $(page) ]; then                                         \
                $${browser} $(page)                                     ;   \
            fi                                                          ;   \
        )                                                                   \
    ))
endef

define red-printf
    printf '\033[1;31m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define replace-mothership
    $(SED) -e 's|MOTHERSHIP|$(strip $(MOTHERSHIP))|g' $(1) > $(2)
endef

define show-usage-info
    printf '%s\n' 'Usage: $(MAKE) [options] [target] ...'               ;   \
    printf '%s\n' '  where "high-level" targets include'                ;   \
    $(SED) -n 's/^.PHONY:\([^$$]*\)$$/\1/p' $(MAKEFILE_LIST) | \
        $(XARGS) printf '    %s\n' $(APPS) | $(SORT)
endef

define timestamp
    $(CP) $(1) $(2)                                                     ;   \
    $(DATE) -j -f '%a %b %d %T %Z %Y' "`date`" '+# %s' >> $(2)
endef

CAT         :=  $(call contingent, gcat cat)
CD          :=  $(call contingent, cd)
CLOSURE     :=  $(call contingent, closure-compiler)
CONVERT     :=  $(call contingent, convert)
COUCHDB     :=  $(call contingent, couchdb)
CP          :=  $(call contingent, gcp cp) -rf
CURL        :=  $(call contingent, curl)
DATE        :=  $(call contingent, date)
HEROKU      :=  $(call contingent, heroku)
KANSO       :=  $(call contingent, kanso)
LAUNCHCTL   :=  $(call contingent, launchctl)
LN          :=  $(call contingent, gln ln) -fs
LS          :=  $(call contingent, gls ls) 2>/dev/null
MKDIR       :=  $(call contingent, gmkdir mkdir)
NODEJS      :=  $(call contingent, nodejs node)
NPM         :=  $(call contingent, npm)
PHANTOMJS   :=  $(call contingent, phantomjs)
QRENCODE    :=  $(call contingent, qrencode) --8bit --level=H
RM          :=  $(call contingent, grm rm) -rf
SED         :=  $(call contingent, gsed sed)
SORT        :=  $(call contingent, gsort sort) -u
XARGS       :=  $(call contingent, xargs)
YUICOMP     :=  $(call contingent, yuicompressor)
ZIP         :=  $(call contingent, zip)

USERNAME    :=  $(shell $(call contingent, whoami))

#-  vim:set syntax=make:
