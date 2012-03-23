#-  POSIX shell script

#-  icons.sh ~~
#                                                       ~~ (c) SRW, 22 Mar 2012

pdflatex -no-shell-escape src/q.tex

pdfcrop q.pdf q.pdf

convert \
    -density 8192 \
    -resize 1024x1024 \
    -gravity center \
    -extent 1024x1024 \
    -transparent white \
    -transparent-color '#929292' \
    -quality 100 \
        q.pdf q.png

convert -compress Zip -resize 16x16 q.png favicon-16x16.ico

convert -compress Zip -resize 32x32 q.png favicon-32x32.ico

convert \
    -background white -alpha remove -alpha off \
    -density 96 \
    -resize 35x35 \
    -quality 100 \
        q.png icon-35x35.jpg

convert \
    -background white -alpha remove -alpha off \
    -density 96 \
    -resize 31x31 \
    -gravity center \
    -extent 35x35 \
    -quality 100 \
        q.png icon-35x35-weak.jpg

convert \
    -density 96 \
    -resize 55x55 \
    -quality 100 \
        q.png icon-55x55.png

convert \
    -background none \
    -density 96 \
    -resize 48x48 \
    -gravity center \
    -extent 55x55 \
    -quality 100 \
        q.png icon-55x55-weak.png

convert \
    -density 96 \
    -resize 57x57 \
    -quality 100 \
        q.png icon-57x57.png

convert \
    -background none \
    -density 96 \
    -resize 50x50 \
    -gravity center \
    -extent 57x57 \
    -quality 100 \
        q.png icon-57x57-weak.png

convert \
    -density 96 \
    -resize 72x72 \
    -quality 100 \
        q.png icon-72x72.png

convert \
    -background none \
    -density 96 \
    -resize 63x63 \
    -gravity center \
    -extent 72x72 \
    -quality 100 \
        q.png icon-72x72-weak.png

convert \
    -density 96 \
    -resize 75x75 \
    -quality 100 \
        q.png icon-75x75.png

convert \
    -background none \
    -density 96 \
    -resize 66x66 \
    -gravity center \
    -extent 75x75 \
    -quality 100 \
        q.png icon-75x75-weak.png

convert \
    -density 96 \
    -resize 114x114 \
    -quality 100 \
        q.png icon-114x114.png

convert \
    -background none \
    -density 96 \
    -resize 100x100 \
    -gravity center \
    -extent 114x114 \
    -quality 100 \
        q.png icon-114x114-weak.png

convert \
    -background white -alpha remove -alpha off \
    -density 96 \
    -resize 128x128 \
    -quality 100 \
        q.png icon-128x128.jpg

convert \
    -background white -alpha remove -alpha off \
    -density 96 \
    -resize 112x112 \
    -gravity center \
    -extent 128x128 \
    -quality 100 \
        q.png icon-128x128-weak.jpg

convert \
    -density 96 \
    -resize 128x128 \
    -quality 100 \
        q.png icon-128x128.png

convert \
    -background none \
    -density 96 \
    -resize 112x112 \
    -gravity center \
    -extent 128x128 \
    -quality 100 \
        q.png icon-128x128-weak.png

convert \
    -background '#929292' \
    -density 96 \
    -resize 280x280 \
    -gravity center \
    -extent 320x460 \
    -quality 100 \
        q.png splash-320x460.png

convert \
    -background '#929292' \
    -density 96 \
    -resize 280x280 \
    -gravity center \
    -extent 320x480 \
    -quality 100 \
        q.png splash-320x480.png

convert \
    -background '#929292' \
    -density 96 \
    -resize 560x560 \
    -gravity center \
    -extent 640x960 \
    -quality 100 \
        q.png splash-640x960.png

#-  vim:set syntax=sh:
