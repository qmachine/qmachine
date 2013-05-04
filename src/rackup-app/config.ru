#\ -p 8177
#-  Rackup configuration file

#-  config.ru ~~
#                                                       ~~ (c) SRW, 24 Apr 2013
#                                                   ~~ last updated 04 May 2013

require 'rubygems'
require 'bundler'

Bundler.require

configure do
    set :show_exceptions, false
end

error do
    [444, {'Content-Type' => 'text/plain'}, ['']]
end

not_found do
    [444, {'Content-Type' => 'text/plain'}, ['']]
end

get '/box/:box' do

    if params[:key] then

        db = SQLite3::Database.open 'qm.db'
        x = db.execute <<-sql
            SELECT body FROM avars
                WHERE box_key = '#{params[:box]}&#{params[:key]}'
            sql
        db.close

        [
            200,
            {'Content-Type' => 'application/json'},
            [(x.length == 0) ? '{}' : x[0][0]]
        ]

    elsif params[:status] then

        db = SQLite3::Database.open 'qm.db'
        x = db.execute <<-sql
            SELECT key FROM avars
                WHERE box_status = '#{params[:box]}&#{params[:status]}'
            sql
        db.close

        [
            200,
            {'Content-Type' => 'application/json'},
            [(x.length == 0) ? '[]' : (x.map { |x| x[0] }).to_json]
        ]

    else

        [444, {'Content-Type' => 'text/plain'}, ['']]

    end

end

get '/' do
    send_file(File.join(File.dirname(__FILE__), 'public', 'index.html'))
end

post '/box/:box' do

    if params[:key] then

        x = request.body.read
        y = JSON.parse(x)

        db = SQLite3::Database.open 'qm.db'

        if y['status'] then

            db.execute <<-sql
                INSERT OR REPLACE INTO avars
                    (body, box_key, box_status, exp_date, key)
                VALUES (
                    '#{x}',
                    '#{y['box']}&#{y['key']}',
                    '#{y['box']}&#{y['status']}',
                    0,
                    '#{y['key']}'
                )
            sql

        else

            db.execute <<-sql
                INSERT OR REPLACE INTO avars (body, box_key, exp_date)
                VALUES ('#{x}', '#{y['box']}&#{y['key']}', 0)
            sql

        end

        db.close

        [201, {'Content-Type' => 'text/plain'}, ['']]

    else

        [444, {'Content-Type' => 'text/plain'}, ['']]

    end

end

begin
    db = SQLite3::Database.open 'qm.db'
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
rescue SQLite3::Exception => e
    puts "Exception occured: #{e}"
ensure
    db.close if db
end

run Sinatra::Application

#-  vim:set syntax=ruby:
