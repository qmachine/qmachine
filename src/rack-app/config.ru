#-  Rack configuration file

#-  config.ru ~~
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 17 Jul 2014

require 'rubygems'
require 'bundler'

Bundler.require

QM::launch_service({
    avar_ttl:           86400, # seconds
    enable_api_server:  true,
    enable_CORS:        true,
    enable_web_server:  true,
    hostname:           '0.0.0.0',
    persistent_storage: {
        mongo: 'mongodb://localhost:27017/test'
        #sqlite: 'qm.db'
    },
    port:               ENV['PORT'] || 8177,
    public_folder:      'public'
})

#-  vim:set syntax=ruby:
