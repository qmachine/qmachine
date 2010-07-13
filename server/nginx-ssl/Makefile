# Makefile

# This Makefile contains instructions to transform a clean install of Ubuntu
# Lucid on a Rackspace server into a minimal test mule for CouchDB over SSL. It
# requires that 'make' be run as 'root' user; I know this is unusual, but when
# you create a new machine on Rackspace, the email you receive contains only the
# IP of the new machine and the root user's password. In other cases, YMMV.

# This installer utilizes "Sean's Trick" for using Makefiles to organize related
# shell scripts in order to simplify issues like permissions and dependency
# checking. The syntax is not pure 'bash' scripting, but rather a hybrid that
# additionally takes advantage of idiosyncratic expansion rules in 'make'. Other
# build systems like 'ant' or 'scons' may merit a look in the future, but the
# decision here to use 'make' is based on the probability of preinstallation.
#                                                           -- SRW, 02 Jun 2010

SHELL   :=  bash

APT_GET :=  apt-get --assume-yes
CP      :=  rsync                       # 'rsync' can be used as 'cp'++
CURL    :=  curl

PKGS    :=  couchdb nginx rsync
DEVPKGS :=  dpkg-dev emacs23-nox vim-nox

KEY     :=  quanah.key
DUP     :=  $(KEY:%.key=%.dup)
CRT     :=  $(KEY:%.key=%.crt)
CSR     :=  $(KEY:%.key=%.csr)

SSH_CFG :=  /etc/ssh/sshd_config
NGX_CFG :=  /etc/nginx/sites-available/default
NGX_WEB	:=  http://quanah.googlecode.com/hg/server/nginx-default

define start-message
    echo -e "\e[1;32mBeginning task '$@'...\e[1;0m";
endef

define exit-message
    echo -e "\e[1;32mCompleted task '$@'.\n\e[1;0m";
endef

define get-ip-address
`curl www.whatismyip.com/automation/n09230945.asp`
endef

.PHONY: all apply_settings create_admin disallow_root_login install_pkgs    \
             reboot update

# Although I've arranged the routines alphabetically, the execution order is
#   update                  Explanation ?
#   create_admin            Explanation ?
#   install_pkgs            Explanation ?
#   apply_settings          Explanation ?
#   disallow_root_login     Explanation ?
#   reboot                  Explanation ?
#

all: reboot

apply_settings: install_pkgs $(CRT) $(KEY)
	@   $(start-message)
	@   # No changes have been made to /etc/couchdb/local.ini .
	@   $(CP) $(CRT) /etc/ssl/certs/
	@   $(CP) $(KEY) /etc/ssl/private/
	@   $(CURL) $(NGX_WEB) -o $(NGX_CFG)
	@   sed -i "s/EXTERNALDOMAIN/$(get-ip-address)/" $(NGX_CFG)
	@   sed -i "s/MYCERTIFICATE/$(CRT)/" $(NGX_CFG)
	@   sed -i "s/MYKEY/$(KEY)/" $(NGX_CFG)
	@   $(exit-message)

create_admin: update
	@   $(start-message)
	@   echo -n "Enter new UNIX username: "                         ;   \
            read NAME                                                   ;   \
            adduser $${NAME}                                            ;   \
            adduser $${NAME} sudo
	@   $(exit-message)

disallow_root_login: apply_settings
	@   $(start-message)
	@   sed -i 's/PermitRootLogin/#PermitRootLogin/' $(SSH_CFG)
	@   echo "PermitRootLogin no" >> $(SSH_CFG)
	@   $(exit-message)

install_pkgs: create_admin
	@   $(start-message)
	@   $(APT_GET) install $(PKGS)
	@   $(exit-message)

reboot: disallow_root_login
	@   $(start-message)
	@   $(RM) $(CRT) $(CSR) $(DUP) $(KEY)
	@   reboot

update:
	@   $(start-message)
	@   $(APT_GET) update
	@   $(APT_GET) upgrade
	@   $(exit-message)

###

$(CRT): $(CSR) $(KEY) $(DUP)
	@   openssl rsa -in $(DUP) -out $(KEY)
	@   openssl x509 -req -days 365 -in $(CSR) -signkey $(KEY) -out $@

$(CSR) $(KEY):
	@   openssl req -new -nodes -keyout $(KEY) -out $(CSR)

# The next rule (and all that use $(DUP)), comes from the questionable idea that
# it is convenient and safe to remove the passphrase from the key ??? I am able
# to generate the $(CRT) programmatically anyway, but according to this article,
#   http://articles.slicehost.com/2007/12/19/ ...
#       ubuntu-gutsy-self-signed-ssl-certificates-and-nginx ,
# there are actually advantages to using this weird method of doing things? It
# doesn't make sense to me, and any input here would be greatly appreciated.

$(DUP): $(KEY)
	@   $(CP) $< $@

