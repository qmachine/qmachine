#-  Ruby source code

#-  server.rb ~~
#
#   This Ruby app launches a QM API server and a web server for anything placed
#   in the "public" folder.
#
#   See https://docs.qmachine.org/en/latest/ruby.html for more information.
#
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 23 Jan 2015

require 'rubygems'
require 'bundler'

Bundler.require

options = {
    enable_api_server:  true,
    enable_cors:        true,
    enable_web_server:  true,
    persistent_storage: {
        mongo:          'mongodb://localhost:27017/test'
    },
    worker_procs:       2
}

if (ENV['QM_API_STRING']) then
    options['persistent_storage'] = JSON.parse(ENV['QM_API_STRING'])
end

if (ENV['TRAVIS'] == 'true') then
    options['worker_procs'] = 1
end

QM.launch_service(options)

#-  vim:set syntax=ruby:
