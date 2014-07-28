#-  Rack configuration file

#-  config.ru ~~
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 28 Jul 2014

require 'rubygems'
require 'bundler'

Bundler.require

options = {
    avar_ttl:           86400, # seconds
    enable_api_server:  true,
    enable_CORS:        true,
    enable_web_server:  true,
    hostname:           '0.0.0.0',
    persistent_storage: {
        #mongo: 'mongodb://localhost:27017/test'
        #sqlite: 'qm.db'
    },
    port:               ENV['PORT'] || 8177,
    public_folder:      'public',
    trafficlog_storage: {
        #mongo: 'mongodb://localhost:27017/test'
    }
}

if (ENV['QM_API_STRING']) then
    options[:persistent_storage] = JSON.parse(ENV['QM_API_STRING'])
end

if (ENV['QM_LOG_STRING']) then
    options[:trafficlog_storage] = JSON.parse(ENV['QM_LOG_STRING'])
end

QM::launch_service(options)

#-  vim:set syntax=ruby:
