#-  Rack configuration file

#-  config.ru ~~
#
#   This is a self-contained Rack app that uses Sinatra's domain-specific
#   language in tandem with SQLite to implement a teaching version of QMachine.
#   The idea here is to pack most of the functionality of the original Node.js
#   codebase into a single file that reads like pseudo-code.
#
#   Of course, there are some caveats. This version succeeds in abbreviating
#   the original codebase, but it doesn't support all of the original options
#   yet, and it may or may not be vulnerable to SQL injection attacks. The
#   code can also be hard to modify if you're unfamiliar with Sinatra, because
#   Ruby's scoping rules are very different from JavaScript's, and Sinatra's
#   DSL makes things even "worse", to be honest. My advice here is, don't think
#   too hard about it. Just enjoy it.
#
#   I do plan to merge this program with the Ruby gem in the future, which is
#   why the database schema matches the Node.js implementation's, which is not
#   as straight-forward as it could be. For now, though, it serves its purpose,
#   and it does so in just 94 lines of source code ;-)
#
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 07 Jun 2013

require 'rubygems'
require 'bundler'

Bundler.require

configure do

  # QMachine options

    set avar_ttl:               86400,
        enable_api_server:      true,
        enable_CORS:            true,
        enable_web_server:      true,
        hostname:               '0.0.0.0',
        persistent_storage:     'qm.db',
        port:                   ENV['PORT'] || 8177,
        public_folder:          'public'

  # Sinatra mappings and options needed by QMachine -- leave these alone ;-)

    mime_type appcache: 'text/cache-manifest'
    mime_type webapp: 'application/x-web-app-manifest+json'
    set bind: :hostname, run: false, static: :enable_web_server

  # See also: http://www.sinatrarb.com/configuration.html

end

error do
  # This "route" handles errors that occur as part of the server-side code.
    hang_up
end

helpers do
  # This block defines subfunctions for use inside the route definitions.

    def db_query(sql)
      # This helper method helps DRY out the code for database queries, and it
      # does so in an incredibly robust and inefficient way -- by creating the
      # table and evicting expired rows before every single query.
        begin
            db = SQLite3::Database.open(settings.persistent_storage)
            db.execute_batch <<-sql
                CREATE TABLE IF NOT EXISTS avars (
                    body TEXT NOT NULL,
                    box_key TEXT NOT NULL PRIMARY KEY,
                    box_status TEXT,
                    exp_date INTEGER NOT NULL,
                    key TEXT
                );
                DELETE FROM avars WHERE (exp_date < #{now_plus(0)})
                sql
          # We have to execute the query code `sql` separately because the
          # `db.execute_batch` function always returns `nil`, which prevents
          # us from being able to retrieve the results of the query.
            x = db.execute(sql)
        rescue SQLite3::Exception => err
            puts "Exception occured: #{err}"
        ensure
            db.close if db
        end
        return x
    end

    def hang_up
      # This helper method "hangs up" on a request by sending a nondescript 444
      # response back to the client. This convention was inspired by Nginx.
        halt [444, {'Content-Type' => 'text/plain'}, ['']]
    end

    def now_plus(dt)
      # This helper method computes a date, in milliseconds, which is `dt`
      # seconds in the future.
        (1000 * (Time.now.to_f + dt)).to_i
    end

end

not_found do
  # This "route" handles requests that didn't match.
    hang_up
end

if settings.enable_api_server? then

  # Here, we set up "routes" to handle incoming GET and POST requests.

    get '/box/:box' do
      # This route responds to API calls that "read" from persistent storage,
      # such as when checking for new tasks to run or downloading results.
        hang_up unless (params[:key] or params[:status])
        cross_origin if settings.enable_CORS == true
        if params[:key] then
          # This arm runs when a client requests the value of a specific avar.
            bk = "#{params[:box]}&#{params[:key]}"
            x = db_query("SELECT body FROM avars WHERE box_key = '#{bk}'")
            y = (x.length == 0) ? '{}' : x[0][0]
        elsif params[:status] then
          # This arm runs when a client requests a task queue.
            bs = "#{params[:box]}&#{params[:status]}"
            x = db_query("SELECT key FROM avars WHERE box_status = '#{bs}'")
            y = (x.length == 0) ? '[]' : (x.map {|x| x[0]}).to_json
        end
        [200, {'Content-Type' => 'application/json'}, [y]]
    end

    post '/box/:box' do
      # This route responds to API calls that "write" to persistent storage,
      # such as when uploading results or submitting new tasks.
        hang_up unless params[:key]
        cross_origin if settings.enable_CORS == true
        body, ed = [request.body.read, now_plus(settings.avar_ttl)]
        x = JSON.parse(body)
        hang_up unless params[:key] == x['key']
        bk, bs = "#{x['box']}&#{x['key']}", "#{x['box']}&#{x['status']}"
        if x['status'] then
          # This arm runs only when a client writes a task description.
            db_query <<-sql
                INSERT OR REPLACE INTO avars
                    (body, box_key, box_status, exp_date, key)
                VALUES ('#{body}', '#{bk}', '#{bs}', #{ed}, '#{x['key']}')
                sql
        else
          # This arm runs when a client is writing a "regular avar".
            db_query <<-sql
                INSERT OR REPLACE INTO avars (body, box_key, exp_date)
                VALUES ('#{body}', '#{bk}', #{ed})
                sql
        end
        [201, {'Content-Type' => 'text/plain'}, ['']]
    end

end

if settings.enable_web_server? then

    get '/' do
      # This route enables a static index page to be served from the public
      # folder, if and only if QM's web server has been enabled.
        send_file(File.join(settings.public_folder, 'index.html'))
    end

end

Sinatra::Application.run!

#-  vim:set syntax=ruby:
