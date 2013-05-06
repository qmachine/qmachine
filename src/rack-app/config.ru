#-  Rack configuration file

#-  config.ru ~~
#
#   This is a self-contained Rack app that uses Sinatra's domain-specific
#   language in tandem with SQLite to implement a teaching version of QMachine.
#   The idea here is to pack most of the functionality of the original Node.js
#   codebase into a single file that reads like pseudo-code.
#
#   Of course, there are some caveats. This version succeeds in abbreviating
#   the original codebase, but it lacks a few features such as CORS support.
#   The code can also be hard to modify if you're unfamiliar with Sinatra's
#   DSL, because Ruby's scoping rules are very different from JavaScript's, and
#   Sinatra makes things even "worse", to be honest. My advice here is, don't
#   think too hard about it. Just enjoy it.
#
#   I do plan to merge this program with the Ruby gem in the future. For now,
#   though, it serves its purpose -- with only 100 lines of source code ;-)
#
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 06 May 2013

require 'rubygems'
require 'bundler'

Bundler.require

configure do

  # QMachine options

    set :avar_ttl,              86400
    set :enable_api_server,     true
    set :enable_web_server,     true
    set :persistent_storage,    'qm.db'
    set :port,                  8177
    set :public_folder,         'public'

  # Sinatra options needed by QMachine

    mime_type :appcache, 'text/cache-manifest'
    mime_type :webapp, 'application/x-web-app-manifest+json'

end

error do
  # This "route" handles errors that occur as part of the server-side code.
    hang_up
end

helpers do
  # This block defines subfunctions for use inside the route definitions.

    def db_query(sql)
      # This helper method helps DRY out the code for database queries, and it
      # also ensures that expired rows are always evicted from the database.
        db = SQLite3::Database.open(settings.persistent_storage)
        db.execute("DELETE FROM avars WHERE (exp_date < #{nowplus(0)})")
        x = db.execute(sql)
        db.close
        return x
    end

    def hang_up
      # This helper method "hangs up" on a request by sending a nondescript 444
      # response back to the client. This convention was inspired by Nginx.
        halt [444, {'Content-Type' => 'text/plain'}, ['']]
    end

    def nowplus(dt)
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

  # First, we set up "routes" to handle incoming GET and POST requests.

    get '/box/:box' do
      # This route responds to API calls that "read" from persistent storage,
      # such as when checking for new tasks to run or downloading results.
        hang_up unless (params[:key] or params[:status])
        if params[:key] then
          # This arm runs when a client requests the value of a specific avar.
            x = db_query <<-sql
                SELECT body FROM avars
                    WHERE box_key = '#{params[:box]}&#{params[:key]}'
                sql
            y = (x.length == 0) ? '{}' : x[0][0]
        elsif params[:status] then
          # This arm runs when a client requests a task queue.
            x = db_query <<-sql
                SELECT key FROM avars
                    WHERE box_status = '#{params[:box]}&#{params[:status]}'
                sql
            y = (x.length == 0) ? '[]' : (x.map {|x| x[0]}).to_json
        end
        [200, {'Content-Type' => 'application/json'}, [y]]
    end

    post '/box/:box' do
      # This route responds to API calls that "write" to persistent storage,
      # such as when uploading results or submitting new tasks.
        hang_up unless params[:key]
        body, ed = [request.body.read, nowplus(settings.avar_ttl)]
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

  # Then, we make sure that the database is ready.

    begin
        db = SQLite3::Database.open(settings.persistent_storage)
        db.execute <<-sql
            CREATE TABLE IF NOT EXISTS avars (
                body TEXT NOT NULL,
                box_key TEXT NOT NULL,
                box_status TEXT,
                exp_date INTEGER NOT NULL,
                key TEXT,
                PRIMARY KEY (box_key)
            )
            sql
    rescue SQLite3::Exception => err
        puts "Exception occured: #{err}"
    ensure
        db.close if db
    end

end

if settings.enable_web_server? then

    get '/' do
      # This route enables a static index page to be served from the public
      # directory.
        send_file(File.join(settings.public_folder, 'index.html'))
    end

else

    get '/*' do
      # This route terminates all incoming requests with extreme prejudice.
      # It does not interfere with the API server's routes, even though it's
      # greedy, because it has been defined later and therefore has lower
      # precedence.
        hang_up
    end

end

Sinatra::Application.run! unless __FILE__ == $0

#-  vim:set syntax=ruby:
