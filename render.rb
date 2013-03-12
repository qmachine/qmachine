#-  Ruby source code

#-  render.rb ~~
#                                                       ~~ (c) SRW, 19 Sep 2012
#                                                   ~~ last updated 12 Mar 2013

require "date"
require "redcarpet"

filename = "index.html"

markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML,
    :autolink => true, :space_after_headers => true)

today = "%02d %s %4d" % [
    Time.now.day,
    Date::ABBR_MONTHNAMES[Time.now.month],
    Time.now.year
]

File::open(filename, "w") do |f|
    content = <<-EOF
<!DOCTYPE html>
<!--
    #{filename} ~~
                                                        ~~ (c) SRW, #{today}
-->
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="author" content="Sean Wilkinson"/>
    <title>Project Description: QMachine</title>
    <link rel="stylesheet" href="../print.css" media="print"/>
    <link rel="stylesheet" href="../screen.css" media="screen"/>
    <link rel="shortcut icon" href="https://www.qmachine.org/favicon.ico"/>
  </head>
  <body>
    <noscript>This page requires JavaScript.</noscript>
    <a id="github_ribbon" href="https://github.com/wilkinson/qmachine">
      <span>Fork me on GitHub!</span>
    </a>
    #{markdown.render(IO.read("README.md")).chomp} 
    <script async src="https://www.qmachine.org/q.js"></script>
  </body>
</html>
EOF
f.write(content.chomp)
end

#-  vim:set syntax=ruby:
