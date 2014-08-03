#-  Rack configuration file

#-  config.ru ~~
#
#   See https://docs.qmachine.org/en/latest/ruby.html for more information.
#
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 03 Aug 2014

require 'rubygems'
require 'bundler'

Bundler.require

options = {
    enable_web_server:  true,
    public_folder:      'public'
}

if (ENV['PORT']) then
    options[:port] = ENV['PORT']
end

if (ENV['QM_API_STRING']) then
    options[:enable_api_server] = true
    options[:enable_CORS] = true
    options[:persistent_storage] = JSON.parse(ENV['QM_API_STRING'])
end

if (ENV['QM_LOG_STRING']) then
    options[:trafficlog_storage] = JSON.parse(ENV['QM_LOG_STRING'])
end

QM::launch_service(options)

#-  vim:set syntax=ruby:
