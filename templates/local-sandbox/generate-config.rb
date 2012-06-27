#-  Ruby source code

#-  generate-config.rb ~~
#                                                       ~~ (c) SRW, 26 Jun 2012

require "optparse"

def main

    optparse = OptionParser.new do |opts|

        opts.banner = "Usage: ruby #{$0} [options] [files]"

        opts.on_tail("-h", "--help", "display this message ;-)") do
            puts opts
            exit
        end

    end

  # Destructively parse the input arguments.

    optparse.parse!

  # Assume anything remaining is a filename.

    ARGV.each do |filename|

        basename = File.basename(filename)

        project_root = ENV['PWD']

        username = ENV['USER']

        case File.basename(filename)

        when 'couchdb.ini'
            content = <<-EOF.gsub(/^ {16}/, '')
                [couchdb]
                database_dir = #{project_root}/var/couchdb
                view_index_dir = #{project_root}/var/couchdb
                uri_file = #{project_root}/var/couchdb/couch.uri

                [httpd]
                bind_address = 127.0.0.1
                port = 5984

                [log]
                file = #{project_root}/var/couchdb/couch.log
                include_sasl = true
                level = info
            EOF
            File::open(filename, "w") { |f| f.write(content) }

        when 'com.srw.couchdb.plist'
            content = <<-EOF.gsub(/^ {16}/, '')
                <?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN"
                    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
                <plist version="1.0">
                  <dict>
                    <key>EnvironmentVariables</key>
                    <dict>
                      <key>HOME</key>
                      <string>~</string>
                      <key>DYLD_LIBRARY_PATH</key>
                      <string>/opt/local/lib:$DYLD_LIBRARY_PATH</string>
                    </dict>
                    <key>KeepAlive</key>
                    <false/>
                    <key>Label</key>
                    <string>com.srw.couchdb</string>
                    <key>ProgramArguments</key>
                    <array>
                      <string>#{%x{which couchdb}.chomp}</string>
                      <string>-a</string>
                      <string>#{project_root}/var/couchdb.ini</string>
                      <string>-p</string>
                      <string>#{project_root}/var/couchdb/couch.pid</string>
                    </array>
                    <key>RunAtLoad</key>
                    <true/>
                    <key>StandardOutPath</key>
                    <string>#{project_root}/var/couchdb/stdout.txt</string>
                    <key>StandardErrorPath</key>
                    <string>#{project_root}/var/couchdb/stderr.txt</string>
                    <key>UserName</key>
                    <string>#{username}</string>
                  </dict>
                </plist>
            EOF
            File::open(filename, "w") { |f| f.write(content) }

        when 'com.srw.nodejs.plist'
            content = <<-EOF.gsub(/^ {16}/, '')
                <?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
                    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
                <plist version="1.0">
                  <dict>
                    <key>KeepAlive</key>
                    <false/>
                    <key>Label</key>
                    <string>com.srw.nodejs</string>
                    <key>ProgramArguments</key>
                    <array>
                      <string>#{%x{which node}.chomp}</string>
                      <string>server.js</string>
                    </array>
                    <key>RunAtLoad</key>
                    <true/>
                    <key>StandardOutPath</key>
                    <string>#{project_root}/var/nodejs/stdout.txt</string>
                    <key>StandardErrorPath</key>
                    <string>#{project_root}/var/nodejs/stderr.txt</string>
                    <key>UserName</key>
                    <string>#{username}</string>
                    <key>WorkingDirectory</key>
                    <string>#{project_root}/var/nodejs/</string>
                  </dict>
                </plist>
            EOF
            File::open(filename, "w") { |f| f.write(content) }

        else

            puts "No instructions for #{filename} ..."

        end

    end

    return

end

main

#-  vim:set syntax=ruby:
