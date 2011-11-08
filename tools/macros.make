#-  GNU Makefile

#-  macros.make ~~
#
#   This contains GNU Make macros written with POSIX-compatible shell scripts.
#   These definitions are included in every Makefile in this project directory;
#   in general, I recommend that you not edit these unless you absolutely must!
#
#                                                       ~~ (c) SRW, 03 Sep 2011

SHELL   :=  sh

.SUFFIXES: ;

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

define alert
    $(call red-printf, '--> ERROR: %s\n', $(strip $(1))) >&2
endef

define aside
    $(call gray-printf, '--> %s\n', $(strip $(1)))
endef

define hilite
    $(call cyan-printf, '--> %s\n', $(strip $(1)))
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

#-  vim:set syntax=make:
