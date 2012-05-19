#-  Bash source code

#-  relaunch-qmachine.sh ~~
#                                                       ~~ (c) SRW, 19 May 2012

sudo service monit stop

sudo stop qmachine

sudo cp qmachine.conf /etc/init/qmachine.conf

sudo cp qmachine.monit /etc/monit.d/qmachine

sudo start qmachine

sudo service monit start

#-  vim:set syntax=sh:
