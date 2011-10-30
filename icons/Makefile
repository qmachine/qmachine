#-  GNU Makefile

#-  Makefile ~~
#
#   These directions build Quanah's icons from LaTeX source code.
#
#                                                           ~~ SRW, 21 Oct 2010

SHELL       :=  bash                        #-  GNU bash        v. 3.2.48(1)

RENDER      :=  pdflatex -no-shell-escape   #-  MacTeX 2010     v. 1.40.11-2.2
CROP        :=  pdfcrop                     #   "               v. 1.31
CONVERT     :=  convert                     #-  ImageMagick     v. 6.6.7-1
CP          :=  rsync -va                   #-  rsync.samba.org v. 3.0.7
OPEN        :=  open

BGSRC       :=  background.tex
BGPDF       :=  $(BGSRC:%.tex=%.pdf)
SRC         :=  quanah-logo.tex
PDF         :=  $(SRC:%.tex=%.pdf)

BITBUCKET   :=  bitbucket.jpg
FAVICON     :=  favicon.ico
GOOGLECODE  :=  googlecode.png
GOOGWEBAPP1 :=  128_icon.png
GOOGWEBAPP2 :=  112_icon.png
IPAD        :=  touch-icon-ipad.png
IPHONE      :=  touch-icon-iphone.png
IPHONE4     :=  touch-icon-iphone4.png
LOGO        :=  logo.jpg

REF_BG      :=  background.png
REF_FG      :=  foreground.png
REF_JPG     :=  reference.jpg
REF_PNG     :=  reference.png

ICONS       :=  $(BITBUCKET)    \
                $(FAVICON)      \
                $(GOOGLECODE)   \
                $(GOOGWEBAPP1)  \
                $(GOOGWEBAPP2)  \
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
                -draw "matte 0,0 floodfill" -shave "1x1" -background "\#FFFFFF"

.PHONY: all clean clobber reset run

all: run

clean: reset
	@   $(RM) $(wildcard *.aux *.log) $(BGPDF) $(PDF) $(REF_FG) $(REF_BG)

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
	@   $(CONVERT) $(call IMGOPTS_REF,35) $< $@

$(FAVICON): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,16) $< $@

$(GOOGLECODE): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,55) $< $@

$(GOOGWEBAPP1): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,128) $< $@

$(GOOGWEBAPP2): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS,112) $< $@

$(IPHONE): $(REF_JPG)
	@   $(CONVERT) $(call IMGOPTS,57) $< $@

$(IPAD): $(REF_JPG)
	@   $(CONVERT) $(call IMGOPTS,72) $< $@

$(IPHONE4): $(REF_JPG)
	@   $(CONVERT) $(call IMGOPTS,114) $< $@

$(LOGO): $(REF_PNG)
	@   $(CONVERT) $(call IMGOPTS_REF,128) $< $@

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

%.pdf: %.tex
	@   $(RENDER) $<                                                ;   \
            $(CROP) --margins "-1 0 -1 -1" $@ $@

#-  vim:set syntax=make:
