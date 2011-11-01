#-  GNU Makefile

#-  Makefile ~~
#
#   These directions build Quanah's icons from LaTeX source code.
#
#                                                           ~~ SRW, 31 Oct 2011

include ../tools/macros.make

COMPOSITE   :=  $(call contingent, composite)                   #-  ImageMagick
CONVERT     :=  $(call contingent, convert)                     #-  "
CP          :=  $(call contingent, rsync) -va                   #-  Samba
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
IOS_STARTUP :=  apple-touch-startup-image.png
IPAD        :=  apple-touch-icon-ipad.png
IPHONE      :=  apple-touch-icon-iphone.png
IPHONE4     :=  apple-touch-icon-iphone4.png
LOGO        :=  logo.jpg

DARK_BG     :=  dark-background.png
REF_BG      :=  background.png
REF_FG      :=  foreground.png
REF_JPG     :=  reference.jpg
REF_PNG     :=  reference.png

ICONS       :=  $(BITBUCKET)    \
                $(FAVICON)      \
                $(GOOGLECODE)   \
                $(GOOGWEBAPP1)  \
                $(GOOGWEBAPP2)  \
                $(IOS_STARTUP)  \
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

.PHONY: all clean clobber reset run

all: run

clean: reset
	@   $(RM) $(wildcard *.aux *.log) $(BGPDF) $(DARKBGPDF) $(PDF)      \
                $(DARK_BG) $(REF_FG) $(REF_BG)

clobber: clean
	@   $(RM) $(ICONS) $(REF_JPG) $(REF_PNG)

reset:
	@   clear

run: $(ICONS)
	@   for each in $(ICONS); do $(OPEN) $${each}; done

###

.PHONY: test

test: $(IPHONE4)
	@   $(OPEN) $<

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

$(IOS_STARTUP): $(DARK_BG) $(GOOGWEBAPP1)
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

$(DARK_BG): $(DARKBGPDF)
	@   $(CONVERT) $(call IMGOPTS,512) -extent '320x480' $< $@

$(REF_BG): $(BGPDF)
	@   $(CONVERT) $(call IMGOPTS,512) -extent '512x512' $< $@

$(REF_FG): $(PDF)
	@   $(CONVERT) $(call IMGOPTS,512) -extent '512x512' $< $@

$(REF_JPG): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS_REF,512) $< $@

$(REF_PNG): $(REF_BG) $(REF_FG)
	@   $(CONVERT) $(call IMGOPTS,512) $(REF_FG) $(REF_BG) \
                -compose ChangeMask -composite $@

###

$(BGPDF): $(BGSRC)

$(PDF): $(SRC)

###

%.pdf: %.tex
	@   $(RENDER) $<                                                ;   \
            $(CROP) --margins "-1 0 -1 -1" $@ $@

#-  vim:set syntax=make:
