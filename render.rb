#-  Ruby source code

#-  render.rb ~~
#                                                       ~~ (c) SRW, 19 Sep 2012
#                                                   ~~ last updated 09 Sep 2014

require 'date'
require 'github/markdown'

filename = 'index.html'

today = '%02d %s %4d' % [
    Time.now.day,
    Date::ABBR_MONTHNAMES[Time.now.month],
    Time.now.year
]

File::open(filename, 'w') do |f|
    content = <<-EOF
<!DOCTYPE html>
<!--
    #{filename} ~~
                                                        ~~ (c) SRW, #{today}
-->
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="author" content="Sean Wilkinson">
    <title>Project Description: QMachine</title>
    <link rel="stylesheet" href="../print.css" media="print">
    <link rel="stylesheet" href="../screen.css" media="screen">
    <link rel="shortcut icon" href="https://www.qmachine.org/favicon.ico">
  </head>
  <body>
    <noscript>This page requires JavaScript.</noscript>
    <a id="github_ribbon" href="https://github.com/qmachine/qmachine">
      <span>Fork me on GitHub</span>
    </a>
    #{GitHub::Markdown.render_gfm(IO.read('README.md')).gsub!('<br>', '')}
    <p>
      Note that this page embeds QM's analytical layer, too, which means that
      you can
      <a href="https://wiki.qmachine.org/wiki/Opening_a_browser_console" target="_blank">open your browser's developer console</a>
      and experiment without even leaving this page!
    </p>
    <script async src="https://www.qmachine.org/qm.js"></script>
  </body>
</html>
EOF
f.write(content.chomp)
end

#-  vim:set syntax=ruby:
