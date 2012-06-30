#-  GNU Makefile

#-  macros.make ~~
#
#   This contains GNU Make macros written with POSIX-compatible shell scripts.
#   These definitions are included in every Makefile in this project directory;
#   in general, I recommend that you not edit these unless you actually know
#   what you are doing. That said, if you know what you're doing and you are
#   better at it than I am, then _please_ send me a pull request :-)
#
#                                                       ~~ (c) SRW, 29 Jun 2012

SHELL   :=  sh

#-  According to GNU Make's manual, different 'make' programs have incompatible
#   suffix lists and implicit rules, and that fact can sometimes create
#   confusion and/or misbehavior. Thus, we'll clear implicit rules by default
#   and require that the suffix list be defined explicitly in each makefile.

.SUFFIXES: ;

#-  These macros colorize text output without disturbing the background color.

define gray-printf
    printf '\033[1;30m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define grey-printf
    printf '\033[1;30m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define red-printf
    printf '\033[1;31m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define green-printf
    printf '\033[1;32m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define yellow-printf
    printf '\033[1;33m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define blue-printf
    printf '\033[1;34m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define magenta-printf
    printf '\033[1;35m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define cyan-printf
    printf '\033[1;36m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define white-printf
    printf '\033[1;37m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

#-  Now, define some human-readable output commands for shell scripting.

define alert
    $(call red-printf, '--> Error: %s\n', $(strip $(1))) >&2
endef

define aside
    $(call gray-printf, '--> %s\n', $(strip $(1)))
endef

define hilite
    $(call cyan-printf, '--> %s\n', $(strip $(1)))
endef

#-  Finally, define some of my favorite convenience macros :-)

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

define read-prompt
    printf '%s' $(1)                                                    ;   \
    read REPLY
endef

define read-secure
    $(call contingent, stty) -echo                                      ;   \
    $(call read-prompt, $(1))                                           ;   \
    $(call contingent, stty) echo                                       ;   \
    printf '\n' ''
endef

#-  vim:set syntax=make:
