#-  GNU Makefile

#-  Makefile ~~
#
#   These directions create icons for Qmachine directly from LaTeX source code
#   by rendering PDFs with TeX Live and rasterizing with ImageMagick. I have
#   most recently tested these directions on Mac OS X 10.7.3.
#
#   NOTE: THESE DIRECTIONS ARE CURRENTLY BROKEN!!!
#
#                                                       ~~ (c) SRW, 07 Feb 2012

include ../tools/macros.make

COMPOSITE   :=  $(call contingent, composite)                   #-  ImageMagick
CONVERT     :=  $(call contingent, convert)                     #-  ImageMagick
CP          :=  $(call contingent, rsync) --verbose --archive
CROP        :=  $(call contingent, pdfcrop)                     #-  TeX Live
OPEN        :=  $(call contingent, gnome-open open)
RENDER      :=  $(call contingent, pdflatex) -no-shell-escape   #-  TeX Live

BGSRC       :=  background.tex
BGPDF       :=  $(BGSRC:%.tex=%.pdf)
DARKBGSRC   :=  dark-background.tex
DARKBGPDF   :=  $(DARKBGSRC:%.tex=%.pdf)
SRC         :=  quanah-logo.tex
PDF         :=  $(SRC:%.tex=%.pdf)

BITBUCKET   :=  bitbucket.jpg
FAVICON     :=  favicon.ico
GOOGLECODE  :=  googlecode.png
GOOGWEBAPP1 :=  128_icon.png
GOOGWEBAPP2 :=  112_icon.png
IOS_LORES   :=  apple-touch-startup-image-lores.png
IOS_HIRES   :=  apple-touch-startup-image-hires.png
IOS_SPLASH  :=  apple-touch-startup-image-splash.png
IPAD        :=  apple-touch-icon-ipad.png
IPHONE      :=  apple-touch-icon-iphone.png
IPHONE4     :=  apple-touch-icon-iphone4.png
LOGO        :=  logo.jpg

DARK_BG     :=  dark-background.png
DARK_BG_HI  :=  dark-background-hires.png
DARK_BG_LO  :=  dark-background-lores.png
PNG128      :=  reference-128.png
PNG256      :=  reference-256.png
REF_BG      :=  background.png
REF_FG      :=  foreground.png
REF_JPG     :=  reference.jpg
REF_PNG     :=  reference.png

ICONS       :=  $(BITBUCKET)    \
                $(FAVICON)      \
                $(GOOGLECODE)   \
                $(GOOGWEBAPP1)  \
                $(GOOGWEBAPP2)  \
                $(IOS_LORES)    \
                $(IOS_HIRES)    \
                $(IOS_SPLASH)   \
                $(IPAD)         \
                $(IPHONE)       \
                $(IPHONE4)      \
                $(LOGO)

#-  Since we're converting a vector format (PDF) into raster formats, we will
#   need to alert ImageMagick to the original image resolution. In the case of
#   LaTeX, fonts have 600+ dpi. Additionally, we will make high-quality JPEGs.
#   Also, let's "functionalize" it to accept a size argument for convenience.

IMGOPTS      =  -density 600 -gravity center -quality 100 -resize '$(1)x$(1)'

COLOR       :=  "\#CCCCCC"

IMGOPTS_REF  =  $(IMGOPTS) -extent '$(1)x$(1)' -bordercolor $(COLOR)        \
                -border "1x1" -matte -fill none -fuzz "20%"                 \
                -draw "matte 0,0 floodfill" -shave "1x1" -background "\#929292"

.PHONY: all clean clobber distclean reset run

all: run

clean: reset
	@   $(RM) $(wildcard *.aux *.log) $(BGPDF) $(DARKBGPDF) $(PDF)      \
                $(DARK_BG) $(DARK_BG_HI) $(DARK_BG_LO) $(PNG128) $(PNG256)  \
                $(REF_FG) $(REF_BG)

clobber: clean
	@   $(RM) $(ICONS) $(REF_JPG) $(REF_PNG)

distclean: clobber

reset:
	@   $(call contingent, clear)

run: $(ICONS)
	@   for each in $(ICONS); do $(OPEN) $${each}; done

###

.PHONY: test

test: $(IPHONE4)
	@   $(OPEN) $<

###

.PHONY: bitbucket google ios

bitbucket:
	@   $(call alert, 'Nothing yet.')

google:
	@   $(call alert, 'Nothing yet.')

ios:
	@   $(call alert, 'Nothing yet.')

###

$(BITBUCKET): $(REF_PNG)
	@   $(CONVERT) \
                -density 600 -gravity center -quality 100 -resize '35x35'   \
                -extent '35x35' -bordercolor $(COLOR) -border "1x1" -matte  \
                -fill none -fuzz "20%" -draw "matte 0,0 floodfill" -shave   \
                "1x1" -background white $< $@

$(FAVICON): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,16) $< $@

$(GOOGLECODE): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,55) $< $@

$(GOOGWEBAPP1): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,128) $< $@

$(GOOGWEBAPP2): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,112) $< $@

$(IOS_LORES): $(DARK_BG) $(PNG128)
	@   $(COMPOSITE) -gravity center $(PNG128) $(DARK_BG) $@

$(IOS_HIRES): $(DARK_BG_HI) $(PNG256)
	@   $(COMPOSITE) -gravity center $(PNG256) $(DARK_BG_HI) $@

$(IOS_SPLASH): $(DARK_BG) $(GOOGWEBAPP1)
	@   $(COMPOSITE) -gravity center $(GOOGWEBAPP1) $(DARK_BG) $@

$(IPHONE): $(REF_JPG)
	@   $(CONVERT) $(call IMGOPTS,57) $< $@

$(IPAD): $(REF_JPG)
	@   $(CONVERT) $(call IMGOPTS,72) $< $@

$(IPHONE4): $(REF_JPG)
	@   $(CONVERT) $(call IMGOPTS,114) $< $@

$(LOGO): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS_REF,128) $< $@

###

$(PNG128): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,128) $< $@

$(PNG256): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,256) $< $@

###

$(DARK_BG): $(DARKBGPDF)
	@   $(CONVERT) $(call IMGOPTS,512) -extent '320x460' $< $@

$(DARK_BG_LO): $(DARKBGPDF)
	@   $(CONVERT) $(call IMGOPTS,512) -extent '320x480' $< $@

$(DARK_BG_HI): $(DARKBGPDF)
	@   $(CONVERT) $(call IMGOPTS,1024) -extent '640x960' $< $@

$(REF_BG): $(BGPDF)
	@   $(CONVERT) $(call IMGOPTS,1024) -extent '1024x1024' $< $@

$(REF_FG): $(PDF)
	@   $(CONVERT) $(call IMGOPTS,1024) -extent '1024x1024' $< $@

$(REF_JPG): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS_REF,1024) $< $@

$(REF_PNG): $(REF_BG) $(REF_FG)
	@   $(CONVERT) $(call IMGOPTS,1024) $(REF_FG) $(REF_BG) \
                -compose ChangeMask -composite $@

###

$(BGPDF): $(BGSRC)

$(PDF): $(SRC)

###

%.pdf: %.tex
	@   $(RENDER) $<                                                ;   \
            $(CROP) --margins "-1 0 -1 -1" $@ $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
