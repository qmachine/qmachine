#-  Ruby source code

#-  webpage.rb ~~
#
#   This script generates an HTML document in the current working directory.
#   It will embed any stylesheets, images, or otherwise that are specified as
#   command-line arguments, based on file extension. It does not attempt to
#   create optimized, ready-to-deploy webpages, but they are valid HTML 5. I
#   wrote this program because I find myself using the web browser increasingly
#   as a development tool for tasks not traditionally reserved for the browser,
#   such as viewing image files output by Gnuplot or R. When those situations
#   arise, I end up hacking together a project-specific PHP script or something
#   when I really should just have a dedicated script that I can tune for all
#   problems in order to maintain some level of consistency, at the very least.
#   It also keeps me from having to go hunt for small advances over the usual
#   scripts, because all the advances will be contained herein :-)
#
#   NOTE: I would like to add the ability not only to embed HTML pages in other
#   HTML pages using iframes, but also to allow the user to click on the iframe
#   to load the source URL as a standalone webpage.
#
#   NOTE: This implementation of Ruby will be deprecated soon in favor of a JS
#   version that uses the Web Chassis framework directly. This version is kind
#   of flaky anyway due to name changes and such.
#
#                                                       ~~ (c) SRW, 18 Aug 2011

require "optparse"

def main

    options = {
        :files      =>  [],
        :output     =>  "index.html",
        :verbose    =>  false
    }

    optparse = OptionParser.new do |opts|

        opts.banner = "Usage: webpage [options] [files]"

        opts.on_tail("-h", "--help", "display this message ;-)") do
            puts opts
            exit
        end

        opts.on("-o", "--output WEBPAGE", "specify the output file") do |f|
            options[:output] = f
        end

        opts.on("-q", "--silent", "silence stdout logging") do
            options[:verbose] = false
        end

        opts.on("-v", "--verbose", "print lots of garbage to stdout") do
            options[:verbose] = true
        end

    end

  # Destructively parse the input arguments.

    optparse.parse!

  # Assume that all remaining uncaught arguments should be interpreted as paths
  # to files that should be embedded; ensure that these exist before storing.

    ARGV.delete_if { |x| options[:files] << x if FileTest.file?(x); true }

  # Print stuff out so I can double-check it while I'm still debugging ...

    content = webpage(options)
    puts content if options[:verbose]

  # Write the generated contents to file :-)

    File::open(options[:output], "w") { |f| f.write(content) }

end

def today
    months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    time = Time.now
    day = (time.day < 10) ? "0#{time.day}" : time.day
    month = months[time.month - 1]
    year = time.year
    return [day, month, year].join(' ');
end

def webpage(options)

    f = {
        :favicon    =>  nil,
        :css        =>  [],
        :imgs       =>  {},             #-  NOTE: This one is a hash.
        :js         =>  [],
        :swf        =>  [],
        :other      =>  []
    }

    options[:files].each do |filename|
        extension = /([^.]*)$/.match(filename)[0]
        name = File.basename(filename, File.extname(filename))
        case extension
            when "css"
                f[:css] << %{<link rel="stylesheet" href="#{filename}"/>}
            when "gif", "jpg", "jpeg", "pdf", "png", "svg"
                if f[:imgs].has_key?(name) then
                    f[:imgs][name] << filename
                else
                    f[:imgs][name] = [filename]
                end
            when "html"
                if filename != options[:output] then
                    if f[:imgs].has_key?(name) then
                        f[:imgs][name] << filename
                    else
                        f[:imgs][name] = [filename]
                    end
                end
            when "ico"
                f[:favicon] = %{<link rel="shortcut icon" href="#{filename}"/>}
            when "js"
                if (File.basename(filename) == "web-chassis.js") then
                    f[:chassis] = filename
                    #f[:elevate] = %{<script src="#{filename}"></script>}
                else
                    f[:js] << filename
                    #f[:js] << %{<script src="#{filename}"></script>}
                end
            when "swf"
                f[:swf] << [
                    %{<object width="800" height="600">},
                    %{<param name="movie" value="#{filename}">},
                    %{<embed src="#{filename}" width="800" height="600">},
                    %{</embed></object>}
                ].join("")
            else #:other
                f[:other] << filename
        end
    end

  # Now, we need to filter the images for fallbacks -- if the same basename has
  # been given for SVG and PNG, for example, choose SVG and set up a fallback.

    f[:imgs].each_pair do |key, val|
        val.sort! do |a, b|
            order = [".html", ".svg", ".pdf", ".png", ".gif", ".jpeg", ".jpg"]
            metric = lambda { |x| order.index(File.extname(x)) }
            metric.call(a) <=> metric.call(b)
        end
    end

    f[:imgs] = f[:imgs].values.map do |filename, fallback|
        fallback = fallback || "n/a"
        caption = filename
        puts "Fallback: #{fallback}" if fallback != "n/a"
        extension = /([^.]*)$/.match(filename)[0].to_sym
      # Please note that none of these rules actually _use_ the fallback yet!
        case extension
            when :gif
                img = %{<img src="#{filename}" alt="(#{filename})"/>}
            when :html
                img = %{<iframe src="#{filename}"></iframe>}
            when :jpg
                img = %{<img src="#{filename}" alt="(#{filename})"/>}
            when :pdf
                img = %{<object data="#{filename}" type="application/pdf" } +
                    'width="700" height="700" alt="(embedded PDF)"></object>'
            when :png
                img = %{<img src="#{filename}" alt="(#{filename})"/>}
            when :svg
                img = %{<img src="#{filename}" alt="(#{filename})"}
            else
                img = %{<a href="#{filename}">(click to view)</a>}
        end
        "<figure><figcaption>#{caption}</figcaption>#{img}</figure>"
    end

  # Then, we'll need a default layout if no stylesheets were specified.

    if f[:css].length == 0 then
        f[:css] = [(<<-EOF
    <style>
        body {
            background-color: #CCCCCC;
            color: black;
            font-family: Georgia, serif;
            font-size: 12pt;
            margin: 1in;
            text-align: center;
        }
        a {
            border-bottom: 1px dotted;
            color: black;
            text-decoration: none;
        }
        a:hover {
            color: blue;
        }
        canvas {
            border: 1px solid black;
        }
        div {
            margin-bottom: 1em;
            margin-top: 1em;
            text-align: justify;
        }
        figcaption {
            font-weight: bold;
        }
        figure {
            text-align: center;
        }
        figure img[src$=".png"] {
            background-color: white;
        }
        figure img[src$=".svg"] {
            background-color: white;
        }
        footer {}
        header {}
        iframe {
            height: 75%;
            width: 100%;
        }
        noscript {
            color: red;
            font-size: 200%;
            text-align: center;
        }
        pre {
            text-align: left;
        }
        textarea {
            font-family: Courier, monospace;
            font-size: 12pt;
            text-align: left;
        }
        .mono {
            font-family: Courier, monospace;
        }
    </style>
    EOF
        ).strip()]
    end

    manana = <<-EOF
<script id="manana">
        this.manana = function () {
            "use strict";
            if (typeof window.console !== 'object') {
                (function (form) {
                    var runButton, textarea;
                    runButton = document.createElement("input");
                    textarea  = document.createElement("textarea");
                    runButton.onclick = function () {
                        try {
                            eval(textarea.value);
                        } catch (err) {
                            alert(err);
                        } finally {
                         // Uncomment this to refresh the page automatically.
                         //location.reload(true);
                        }
                    };
                    runButton.type = "button";
                    runButton.value = "Run";
                    textarea.autofocus = true;
                    textarea.cols = 80;
                    textarea.rows = 24;
                    form.appendChild(textarea);
                    form.appendChild(document.createElement("br"));
                    form.appendChild(document.createElement("br"));
                    form.appendChild(runButton);
                    document.body.appendChild(form);
                }(document.createElement("form")));
            } else {
                (function (div) {
                    div.innerHTML += "Check the developer console for output.";
                    document.body.appendChild(div);
                }(document.createElement("div")));
            }
            chassis(function (q, global) {
                "use strict";
                var scripts, me;
                me = document.getElementById("manana");
                scripts = [
                #{
                    padding = '",' + "\n" + (" " * 20) + '"'
                    ('    "' + f[:js].join(padding) + '"') if f[:js].length > 0
                }
                ];
                while (scripts.length > 0) {
                    q.load(scripts.shift());
                }
                delete global.manana;                   //- deletes function
                me.parentNode.removeChild(me);          //- deletes script
            });
        }
    </script>
    EOF

  # Finally, we generate some HTML -- yay!

    html = <<-EOF
<!DOCTYPE html>
<!--
    #{options[:output]} ~~

    This static page was generated dynamically by a Ruby script prior to
    deployment. All dynamic interactions are performed in client-side JS :-)

                                                        ~~ (c) SRW, #{today}
-->
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="author" content="Sean Wilkinson"/>
    <title>#{options[:output]}</title>
    #{f[:css].join("\n    ")}
    #{(f[:favicon] == nil) ? "<!-- (no favicon) -->" : f[:favicon]}
  </head>
  <body>
    <noscript>This page requires JavaScript.</noscript>
    #{f[:imgs].length > 0 ? f[:imgs].join("\n    ") : "<!-- (no images) -->"}
  <!--
    <script>
        (function () {
            'use strict';
            var bee = new Worker('main.js');
            bee.onmessage = function (evt) {
                console.log(evt.data);
                return false;
            };
            bee.onerror = function (evt) {
                console.error(evt.message);
                return false;
            };
        }());
    </script>
  -->
    #{# Web Chassis should be included?
        if f[:chassis] then
            if f[:js].length > 0 then
                manana + "    " + '<script src="' + f[:chassis] +
                    '" onload="manana();"></script>'
            else
                '<script src="' + f[:chassis] + '"></script>'
            end
        else
            if f[:js].length > 0 then
                (f[:js].map do |each|
                    %{<script src="#{each}"></script>}
                end).join("\n    ")
            else
                "<!-- (no scripts) -->"
            end
        end
    }
    #{f[:swf].length > 0 ? f[:swf].join("\n    ") : "<!-- (no flash) -->"}
  </body>
</html>
    EOF

    html

end

main

#-  vim:set syntax=ruby:
