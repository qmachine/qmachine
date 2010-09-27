#-  Makefile                            #-  GNU Make            v. 3.81

#-  quanah/icons/Makefile ~~
#   These are the instructions to create the logo and favicon from scratch.
#   They were written and tested on Mac OS X 10.6.4, and I have tried to leave
#   as many details as I could about the exact software versions that I used.
#                                                           ~~ SRW, 25 Sep 2010

SHELL       :=  bash                    #-  GNU bash            v. 3.2.48(1)

RENDER      :=  pdflatex                #-  MacTeX 2010         v. 1.40.11-2.2
CROP        :=  pdfcrop                 #-  MacTeX 2010         v. 1.31
CONVERT     :=  convert                 #-  ImageMagick         v. 6.6.1-3
CP          :=  rsync -va               #-  rsync.samba.org     v. 3.0.7

SRC         :=  quanah-logo.tex
PDF         :=  $(SRC:%.tex=%.pdf)

APPLE_TOUCH :=  apple-touch-icon.png
FAVICON     :=  favicon.ico
GOOGLECODE  :=  googlecode.png
LOGO        :=  logo.jpg

ICONS       :=  $(APPLE_TOUCH) $(FAVICON) $(GOOGLECODE) $(LOGO)

#-  Since we're converting a vector format (PDF) into raster formats, we will
#   need to alert ImageMagick to the original image resolution. In the case of
#   LaTeX, fonts have 600+ dpi. Additionally, we will make high-quality JPEGs.

IMGOPTS     :=  -density 600 -quality 100

WEBDIR      :=  ../couchapp/_attachments/style

.PHONY: all clean clobber install reset run

all: run

clean: reset
	@   $(RM) $(wildcard *.aux *.log) $(PDF)

clobber: clean
	@   $(RM) $(ICONS)

install: $(ICONS)
	@   $(CP) $(APPLE_TOUCH) $(WEBDIR)                              ;   \
            $(CP) $(FAVICON) $(WEBDIR)                                  ;   \
            $(CP) $(LOGO) $(WEBDIR)

reset:
	@   clear

run: $(ICONS)

###

$(APPLE_TOUCH): $(PDF)
	@   $(CONVERT) $(IMGOPTS) -resize '114x114!' $< $@

$(FAVICON): $(PDF)
	@   $(CONVERT) $(IMGOPTS) -resize '16x16!' $< $@

$(GOOGLECODE): $(PDF)
	@   $(CONVERT) $(IMGOPTS) -resize '55x55!' $< $@

$(LOGO): $(PDF)
	@   $(CONVERT) $(IMGOPTS) -resize '128x128!' $< $@

###

$(PDF): $(SRC)
	@   $(RENDER) $<                                                ;   \
            $(CROP) --margin 1 $(PDF) $@

#-  vim:set syntax=make:
