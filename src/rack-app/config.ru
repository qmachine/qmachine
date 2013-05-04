#\ -p 8177
#-  Rack configuration file

#-  config.ru ~~
#
#   This is a self-contained Rack app that pairs Sinatra's convenient DSL with
#   SQLite to implement both the API- and web-server components of QMachine. It
#   does lack a few features, however, such as eviction of expired rows in the
#   database. A lot of safety code is absent, too. But hey, what do you expect
#   from an implementation that only contains 93 lines of source code?!
#
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 04 May 2013

require 'rubygems'
require 'bundler'

Bundler.require

configure do
    enable :api_server
    mime_type :appcache, 'text/cache-manifest'
    mime_type :webapp, 'application/x-web-app-manifest+json'
    enable :web_server
    #set :public_folder, File.join(File.dirname(__FILE__), 'public')
end

error do
    hang_up
end

helpers do
    def hang_up
        halt [444, {'Content-Type' => 'text/plain'}, ['']]
    end
    def db_query(sql)
        db = SQLite3::Database.open('qm.db')
        x = db.execute(sql)
        db.close
        return x
    end
end

not_found do
    hang_up
end

if settings.api_server? then

    get '/box/:box' do
        hang_up unless (params[:key] or params[:status])
        if params[:key] then
            x = db_query <<-sql
                SELECT body FROM avars
                    WHERE box_key = '#{params[:box]}&#{params[:key]}'
                sql
            y = (x.length == 0) ? '{}' : x[0][0]
        elsif params[:status] then
            x = db_query <<-sql
                SELECT key FROM avars
                    WHERE box_status = '#{params[:box]}&#{params[:status]}'
                sql
            y = (x.length == 0) ? '[]' : (x.map { |x| x[0] }).to_json
        end
        [200, {'Content-Type' => 'application/json'}, [y]]
    end

    post '/box/:box' do
        hang_up unless params[:key]
        body = request.body.read
        exp_date = ((Time.new).to_i + 86400) * 1000
        x = JSON.parse(body)
        hang_up unless params[:key] == x['key']
        bk, bs = "#{x['box']}&#{x['key']}", "#{x['box']}&#{x['status']}"
        if x['status'] then
            db_query <<-sql
                INSERT OR REPLACE INTO avars
                    (body, box_key, box_status, exp_date, key)
                VALUES ('#{body}', '#{bk}', '#{bs}', #{exp_date}, '#{x['key']}')
            sql
        else
            db_query <<-sql
                INSERT OR REPLACE INTO avars (body, box_key, exp_date)
                VALUES ('#{body}', '#{bk}', #{exp_date})
            sql
        end
        [201, {'Content-Type' => 'text/plain'}, ['']]
    end

end

if settings.web_server? then

    get '/' do
        send_file(File.join(settings.public_folder, 'index.html'))
    end

else

    get '/*' do
        hang_up
    end

end

begin
    db = SQLite3::Database.open('qm.db')
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

run Sinatra::Application

#-  vim:set syntax=ruby:
