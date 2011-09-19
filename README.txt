RabbiSteg

a simple index for this simple documentation:

... 0 .... INTRO .................................. what's and why
... 1 .... PHILOSOPHICAL GOAL ..................... what's and why
... 2 .... TECHNICAL GOAL ......................... usage, integration 
... 3 .... PROJECT MAINTENANCE .................... license, git, author

0) what's a steganography library written in javascript ?

steganography is explained on wikipedia: 
https://secure.wikimedia.org/wikipedia/en/wiki/Steganography (not really accurate, btw)
RabbiSteg is a javascript library to provide an integration/extension of the browser capability, 
instead the production of a single software implementing a steganographic tool, like the various 
collected in http://members.cox.net/ebmmd/stego/stego.html

1) philosophical goal

anonymity community, security integralists, crypto rebels: yours is an idea. your idea will not 
be stopped, and in the world we're facing, our effort are commonly misunderstand. Rabbi, one of 
the first man contributing in this goal, recenlty has passed out. Only the flash is mortal, not 
the ideas, neither the technology. This software are is to him dedicated, in him memory and by 
remind for every other contributor in anonymous technology: you are contributing in a common, 
shared, permanent knowledge, you will not be forgotten. You share with us a paranoid approach 
to the technology, but instead of succumb, you're creating a solution. this effort remain forever.

http://boingboing.net/2011/07/04/rip-len-sassaman-cyp.html
http://www.cso.com.au/article/392338/young_cryptographer_ends_own_life/
https://secure.wikimedia.org/wikipedia/en/wiki/Len_Sassaman

2) technical goal

provide a steganography library, easily integrable in every website. Will be in example be 
integrated in a wordpress module, providing for every user few botton permitting to do stegano
update/download etc...

use the rabbiusage.html as example page implementing Rabbisteg class.

2) technical details

with Canvas object manipoulation, every Image should be accessed as a matrix with four 8-bit
components for every pixel in the image. Using a simple LSB substitution, this first release
perform the hiding of an image inside the least 2 significative bits in every 8-bit container.

PNG is the format that will be supported for save image, because the non-downgrade is required
in order to keep the change.

3) project mantenance

The license of RabbiSteg is GPL v.3:
    and should be obtained in http://github.com/vecna/rabbisteg

The license of the file canvas2image.js: 
    taken by http://www.nihilogic.dk/labs/canvas2image/canvas2image.js, is MIT license

The license of base64.js:
    taken by http://www.nihilogic.dk/labs/canvas2image/base64.js, is unlicensed free license.

Actually rabbisteg has been developed only by Claudio Agosti - vecna@delirandom.net, and this 
software is used in the Winston Smith Project's server: http://www.winstonsmith.org/rabbisteg
at the page http://www.delirandom.net/rabbisteg you should found all blog posts relative to 
Rabbisteg history, develop and update.
