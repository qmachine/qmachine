#-  POSIX shell script

#-  config.sh ~~
#
#   I wanted to include all of this directly in the Makefile, but escaping a
#   heredoc is even more painful than escaping regular shell script. Since the
#   whole point of a heredoc is to make things easy for the programmer, it
#   doesn't make a lot of sense to try and embed it into the Makefile anyway.
#
#                                                       ~~ (c) SRW, 29 Jun 2012
#                                                   ~~ last updated 12 Nov 2012

#-  First, we'll enable strict adherence to the POSIX standard.

if test -n "${ZSH_VERSION+set}" && (emulate sh) >/dev/null 2>&1; then
    emulate sh;
elif test -n "${BASH_VERSION+set}" && (set -o posix) >/dev/null 2>&1; then
    set -o posix;
fi

generate_config() {
  # This function needs documentation.
    target_file=$1;
    shift;
    sed 's/^[ ]\{4,4\}//g' $* > ${target_file};
    return $?;
}

PROJ_ROOT="${PROJ_ROOT:=${PWD}}";

generate_config ${COUCHDB_INI:=/dev/null} <<-EOF
    [couchdb]
    database_dir = ${PROJ_ROOT}/var/couchdb
    view_index_dir = ${PROJ_ROOT}/var/couchdb
    uri_file = ${PROJ_ROOT}/var/couchdb/couch.uri

    [httpd]
    bind_address = 127.0.0.1
    port = 5984

    [log]
    file = ${PROJ_ROOT}/var/couchdb/couch.log
    include_sasl = true
    level = info
EOF

generate_config ${COUCHDB_PLIST:=/dev/null} <<-EOF
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
        <string>com.QM.couchdb</string>
        <key>ProgramArguments</key>
        <array>
          <string>${COUCHDB}</string>
          <string>-a</string>
          <string>${PROJ_ROOT}/var/couchdb.ini</string>
          <string>-p</string>
          <string>${PROJ_ROOT}/var/couchdb/couch.pid</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
        <key>StandardOutPath</key>
        <string>${PROJ_ROOT}/var/couchdb/stdout.txt</string>
        <key>StandardErrorPath</key>
        <string>${PROJ_ROOT}/var/couchdb/stderr.txt</string>
        <key>UserName</key>
        <string>${USERNAME}</string>
      </dict>
    </plist>
EOF

generate_config ${NODEJS_PLIST:=/dev/null} <<-EOF
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
        "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
      <dict>
        <key>EnvironmentVariables</key>
        <dict>
          <key>QM_API_STRING</key>
          <string>${QM_API_STRING}</string>
          <key>QM_WWW_STRING</key>
          <string>${QM_WWW_STRING}</string>
        </dict>
        <key>KeepAlive</key>
        <false/>
        <key>Label</key>
        <string>com.QM.nodejs</string>
        <key>ProgramArguments</key>
        <array>
          <string>${NODEJS}</string>
          <string>server.js</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
        <key>StandardOutPath</key>
        <string>${PROJ_ROOT}/var/nodejs/stdout.txt</string>
        <key>StandardErrorPath</key>
        <string>${PROJ_ROOT}/var/nodejs/stderr.txt</string>
        <key>UserName</key>
        <string>${USERNAME}</string>
        <key>WorkingDirectory</key>
        <string>${PROJ_ROOT}/var/nodejs/</string>
      </dict>
    </plist>
EOF

#-  vim:set syntax=sh:
