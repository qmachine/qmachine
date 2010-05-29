# Makefile

# The goal of this Makefile is to use "Sean's Trick" (see below) to transform a
# clean install of Ubuntu Lucid on a Rackspace server into a minimal test mule
# for CouchDB that uses SSL, as requested by Jonas. As a bonus, the system
# changes encoded herein represent an idempotent operation, so that executing
# these instructions repeatedly will always result in a correct configuration.
# (The inverise operation exists but its implementation is left to the reader.)
#
# "Sean's Trick" is to use a Makefile to structure a group of related shell
# scripts (bash scripts almost always). One advantage versus writing functions
# inside of shell scripts is that we get automatic prerequisite / dependency
# checking for free, and additionally, a Makefile doesn't require executable
# permissions -- it's merely the input to the 'make' and nothing more. I use
# these to leave myself "live directions" because a well-commented Makefile is
# infinitely more convenient and meaningful than a README file. I've been using
# this "trick" for over a year now, and it's my "one click" method: '$ make'.
#
#                                                           -- SRW, 19 May 2010

SHELL   :=  bash

APT_GET :=  apt-get --assume-yes        # hopefully this is equivalent ...

PKGS    :=  couchdb nginx
DEVPKGS :=  dpkg-dev emacs23-nox vim-nox

KEY     :=  myssl.key
DUP     :=  $(KEY:%.key=%.dup)
CSR     :=  $(KEY:%.key=%.csr)
CRT     :=  $(KEY:%.key=%.crt)

SSH_CFG :=  ./sshd_config               # /etc/ssh/sshd_config
NGX_CFG :=  /etc/nginx/sites-available/default-test # ultimately , .../default
NGX_WEB :=  http://quanah.googlecode.com/hg/server/nginx-default

define start-message
    echo -e "\e[1;32mBeginning task '$@'...\e[1;0m";
endef

define exit-message
    echo -e "\e[1;32mCompleted task '$@'.\n\e[1;0m";
endef

.PHONY: all apply_settings create_admin disallow_root_login \
            fetch_config_files install_pkgs reboot source update

# Although I've arranged the routines alphabetically, the execution order is
#   update                  Explanation ?
#   create_admin            Explanation ?
#   install_pkgs            Explanation ?
#   fetch_config_files      Explanation ?
#   apply_settings          Explanation ?
#   disallow_root_login     Explanation ?
#   reboot                  Explanation ?
#
#   source                  optional -- just another service I provide ;-)
#

all: reboot

apply_settings: install_pkgs $(CRT) $(KEY) $(NGX_CFG)
	@   $(start-message)
	@   #see changes to /etc/nginx/sites-available/default
	@   #no changes have been made to to /etc/couchdb/local.ini ...
	@   #cp $(CRT) /etc/ssl/certs/
	@   #cp $(KEY) /etc/ssl/private/
	@   $(exit-message)

create_admin: update
	@   $(start-message)
	@   #echo -n "Enter new UNIX username: "                         ;   \
            #read NAME                                                   ;   \
            #adduser $${NAME}                                            ;   \
            #adduser $${NAME} sudo
	@   $(exit-message)

disallow_root_login: apply_settings
	@   $(start-message)
	@   sed -i 's/PermitRootLogin/#PermitRootLogin/' $(SSH_CFG)
	@   echo "PermitRootLogin no" >> $(SSH_CFG)
	@   $(exit-message)

fetch_config_files: install_pkgs
	@   $(start-message)
	@   ###
	@   $(exit-message)

install_pkgs: create_admin
	@   $(start-message)
	@   $(APT_GET) install $(PKGS)
	@   $(exit-message)

reboot: disallow_root_login
	@   $(start-message)
	@   #reboot

source: update
	@   $(start-message)
	@   $(APT_GET) install $(DEVPKGS)
	@   $(APT_GET) source $(PKGS)
	@   $(exit-message)

update:
	@   $(start-message)
	@   $(APT_GET) update
	@   $(APT_GET) upgrade
	@   $(exit-message)

###

$(CRT): $(DUP) $(KEY)
	@   openssl rsa -in $(DUP) -out $(KEY)
	@   openssl x509 -req -days 365 -in $(CSR) -signkey $(KEY) -out $@

$(DUP): $(KEY)
	@   cp $< $@

$(NGX_CFG):
	@   curl $(NGX_WEB) -o $(NGX_CFG)

%.csr: %.key
	@   openssl req -new -key $< -out $@

%.key:
	@   openssl genrsa -des3 -out $@ 1024
