/*
 * Len Sassaman, died few days ago, had release some important tools in the cryptoworld
 * I like. This software is dedicated to your memory: shall your soul found the secret key
 * 
 * -- vecna@delirandom.net 7/7/2011
 * 
 * anyway this project has been studied for Wikifood project by franca formenti, and 
 * released by free software license (GPL3) beside being put under github, at
 * http://github.com/vecna/rabbisteg
 *
 * -- first public release has been pland after CCC memorial, ~ 13/08/2011
 *
 */

const bitAbuse = 2

/* need to be used random, with ranges or even|odd meanings */
const CT_text = 290
const CT_img = 533

const ALPHA_USAGE = 2
const NOT_ALPHA_USAGE = 3

/*
 * debug: commented are present some getElementById("debug1") and debug2, if you create
 * two div, with those IDs, could be useful uncomment the debugs and see what's happen.
 *
 * this is not easy and immediate, because I really don't believe someone want to do that. :P
 */

function rabbiSteg()
{

    /* an object will be of three different types: secret, cover, extract */
    this.type = '';
    this.steganographyType = NOT_ALPHA_USAGE;

    this.init = function ( typeString ) 
    {
        var availType = new Array( "secret", "cover", "extract" );

        for( var i = 0; i < availType.length; i++)//per tutti i tipi
        {
            if(typeString.match(availType[i]))
                this.type = typeString;
        }

        if(this.type == '')
            return "invalid type of usage sets in rabbiSteg: check the first args";//errore

        /* generate the bitmasks */
        this.mask2bit = new Array( 3, 12, 48, 192 ); /* 15, 240, 3840, 61440 */
        this.mask3bit = new Array( 7, 56 );
        /* http://www.neurophys.wisc.edu/comp/docs/ascii/ */

        return true;//tutto ok
    }

    /* event driven function: when the image is load, read the canvas */
    this.loadImage = function( imageElem )
    {
        /* in the initialization method, import the image and grab them as canvas and pixmap */
        if (!imageElem.src.match("image/*"))
            return "This image don't seem to be an Image file";

        /* this cause to inheriet original width and height */
        this.src = imageElem.src;

        return "";
    }

    this.setContentType = function (contentString)
    {
        if(contentString.length > this.MAXCT) {
            alert('unexpected content-type length > than ' + this.MAXCT +' byte (' + contentString +')');
            return false;
        }

        this.content_type = contentString;

        if(contentString.match(/image.*/))
            this.content_code = CT_img;
        else if(contentString.match('text/plain'))
            this.content_code = CT_text;
        else
        {
            alert('unexpected content-type: image and text/plain the only acceptable (' + contentString +')');
            return false;
        }

        return true;
    }

    this.textSetup = function( textId )
    {
        textElem = document.getElementById(textId);

        this.Text = textElem.value;
        if(!this.Text.length) {
            alert('you are covering a 0 byte text !?');
            return false;
        }

        this.availPixNumber = (this.Text.length * 4);
        return true;
    }

    /* this is splitted from the loadImage function, because sometime happen width and height are not
     * updated with the loaded img */
    this.imageSetup = function( stringId )
    {
        /* saving the reference image, just in case */
        this.imgRef = document.getElementById(stringId);

        this.cnvs = document.createElement("canvas"); 
        this.cnvs.width = this.imgRef.width;
        this.cnvs.height = this.imgRef.height;

        this.ctx = this.cnvs.getContext('2d');

        this.ctx.drawImage(this.imgRef, 0, 0);

        this.pixImg = this.ctx.getImageData(0, 0, this.imgRef.width, this.imgRef.height);

        this.HTML_dump("debug1", this.pixImg.data, 10, "<br><b>init", "<br></b>");

        this.availPixNumber = (this.imgRef.width * this.imgRef.height * 4);
        if(this.availPixNumber == 0)
            return "unable to acquire correclty image with role " + this.type;

        return true;//tutto ok
    }

    this.prologue = function( required )
    {
        if(!this.type.length)
            alert('bad usage of rabbiSteg class: required to "init" if used in secret, cover or extract mode');

        if(!required.match(this.type))
            alert('bad implementation of rabbiSteg class: called method for "' + required + '" in "' + this.type + '"'); 
    }

    /* follow the methods to be used in the Cover image -- at the moment need serious update */
    this.willContain = function( mayBeInjected ) 
    {
        this.prologue ("cover");
 
        /* if bitAbuse is 2, the avail pixed need to be almost (8 / 2) = 4 times greter */
        var timeGreat = ((8 / bitAbuse) * 2);

        alert( this.availPixNumber + ' ' + mayBeInjected.availPixNumber + ' ' + bitAbuse + ' ' + timeGreat );

        if( (this.availPixNumber) <= (mayBeInjected.availPixNumber * timeGreat ) )
            return "Invalid: the cover image must be "+ timeGreat  +" greater than the secret image";
        else
            return true;
    }

    /* this is the function wrapping the various kind of steganography, has been implemented when 
     * the requirement of a non-alpha channel hiding has been requested by some test */
    this.pixelBlockStego = function(matrixIndex, toHideVal, debug)
    {
        /* matrixIndex work in this.pixImg.data */

        if(this.steganographyType == ALPHA_USAGE)
        {
            this.pixImg.data[matrixIndex + 0] = this.stegoEmbed4(this.pixImg.data[matrixIndex + 0], toHideVal, 0, debug);
            this.pixImg.data[matrixIndex + 1] = this.stegoEmbed4(this.pixImg.data[matrixIndex + 1], toHideVal, 1, debug);
            this.pixImg.data[matrixIndex + 2] = this.stegoEmbed4(this.pixImg.data[matrixIndex + 2], toHideVal, 2, debug);
            this.pixImg.data[matrixIndex + 3] = this.stegoEmbed4(this.pixImg.data[matrixIndex + 3], toHideVal, 3, debug);
        }
        else /* NOT_ALPHA_USAGE */
        {
            this.pixImg.data[matrixIndex + 0] = this.stegoEmbed3(this.pixImg.data[matrixIndex + 0], toHideVal, 0, debug);
            this.pixImg.data[matrixIndex + 1] = this.stegoEmbed3(this.pixImg.data[matrixIndex + 1], toHideVal, 1, debug);
            this.pixImg.data[matrixIndex + 2] = this.stegoEmbed3(this.pixImg.data[matrixIndex + 2], toHideVal, 2, debug);
            /* alpha channel untouched */
        }
    }

    /* utility! */
    this.stegoEmbed4 = function(sourceVal, toInjectVal, ndxPos, debug)
    {
        if(debug)
            document.getElementById("debug1").innerHTML += "<br>2{src "+ sourceVal +"}inj "+toInjectVal+" ndxP "+ndxPos+"}";

        var andValue = (toInjectVal & this.mask2bit[ndxPos]);
        var leastSign = (andValue >> (ndxPos * 2));
        sourceVal = ((sourceVal >> 2) << 2) + leastSign;

        if(debug)
            document.getElementById("debug1").innerHTML += " = "+sourceVal + '<br>';

        return sourceVal;
    }

    this.stegoEmbed3 = function(sourceVal, toInjectVal, ndxPos, debug)
    {

        if(ndxPos == 0 || ndxPos == 1)
        {
            if(debug)
                document.getElementById("debug1").innerHTML += "<br>3{src "+ sourceVal +"}inj "+toInjectVal+" ndxP "+ndxPos+"}";

            var andValue = (toInjectVal & this.mask3bit[ndxPos]);
            var leastSign = (andValue >> (ndxPos * 3));
            sourceVal = ((sourceVal >> 3) << 3) + leastSign;
        }
        else
        {
            if(debug)
                document.getElementById("debug1").innerHTML += "<br>2{src "+ sourceVal +"}inj "+toInjectVal+" ndxP "+ndxPos+"}";

            var andValue = (toInjectVal & this.mask2bit[3]); /* in this case, ndxPos could be only "2" */
            var leastSign = (andValue >> 6);
            sourceVal = ((sourceVal >> 2) << 2) + leastSign;
        }

        if(debug)
            document.getElementById("debug1").innerHTML += " = "+sourceVal + '<br>';

        return sourceVal;
    }

    this.writeInfo = function(destSpanId)
    {
        var spid = document.getElementById(destSpanId);
        spid.innerHTML += "{type: " + this.type + " width: " + this.imgRef.width + " height: " + this.imgRef.height + "} ";
    }

    this.extractValue = function(stegoV1, stegoV2, stegoV3, stegoV4, debug)
    {
        var retVal = 0;

        if(this.steganographyType == ALPHA_USAGE)
        {
            if(debug)
                document.getElementById("debug2").innerHTML += "<br>2 " + stegoV1 + "_" + stegoV2 + "_" +  stegoV3 + "_" +  stegoV4 + "=";

            retVal += (stegoV1 & this.mask2bit[0]);
            retVal += ((stegoV2 & this.mask2bit[0]) << 2);
            retVal += ((stegoV3 & this.mask2bit[0]) << 4);
            retVal += ((stegoV4 & this.mask2bit[0]) << 6);
        }
        else /* without alpha channel stegano, use the first 3 bits two time, and 2 bit after */
        {
            if(debug)
                document.getElementById("debug2").innerHTML += "<br>3 " + stegoV1 + "_" + stegoV2 + "_" +  stegoV3 + "_" +  stegoV4 + "=";

            retVal += (stegoV1 & this.mask3bit[0]);
            retVal += ((stegoV2 & this.mask3bit[0]) << 3);
            retVal += ((stegoV3 & this.mask2bit[0]) << 6);
        }

        if(debug)
            document.getElementById("debug2").innerHTML += retVal;

        return retVal;
    }

    this.injectSeq = function( targetVal, start_ndx)
    {
        var bigp = Math.floor(targetVal / 256);
        var carry = (targetVal % 256);

        this.pixelBlockStego(start_ndx, bigp, false);
        start_ndx += 4;
        this.pixelBlockStego(start_ndx, carry, false);
    }

    this.HTML_dump = function(ddiv, matrix, elems, startInfo, endInfo)
    {
        var index;
        var dumpData = '';

        for(index = 0; index < elems; index++)
        {
            dumpData += "[" + matrix[index] + "]";
            if(!( (index + 1) % 4 ))
                dumpData += " ";
        }

        document.getElementById(ddiv).innerHTML += startInfo + dumpData + endInfo;
    }

    /* this function need to be set as callback */
    this.steganography = function( imageCnvsElem, toEmbedS )
    {
        this.prologue ("cover");

        /* this variable count the actual used data of the cover image */
        var j = 0;

        this.HTML_dump("debug1", this.pixImg.data, 20, "<br>before apply steganography", "<br>");

        /* first: add the content type code */
        this.injectSeq(toEmbedS.content_code, j);
        j+=8;

        /* second: add metadata accroding to the content-type */
        if(toEmbedS.content_type == 'text/plain')
        {
            this.injectSeq(toEmbedS.Text.length, j);
            j += 8;
            alert(' text steganography, length ' + toEmbedS.Text.length + ' content-type ' + toEmbedS.content_code);
        }
        else
        {
            this.injectSeq(toEmbedS.imgRef.width, j);
            j += 8;

            this.injectSeq(toEmbedS.imgRef.height, j);
            j += 8;

            alert(' image steganography, width ' + toEmbedS.imgRef.width + ' height ' + toEmbedS.imgRef.height + ' content-type ' + toEmbedS.content_code + ' start at index ' + j);
        }

        /* third, inject the data */ 
        if(toEmbedS.content_type == 'text/plain')
        {
            for(var i = 0 ; i < toEmbedS.Text.length ; i++)
            {
                var valueToHide = toEmbedS.Text[i];

                /* due to utf-16 availablility, encoding text require a double space */
                this.injectSeq(valueToHide.charCodeAt(0), j);
                j+=8;
            }
        } 
        else
        {
            for(var i = 0 ; i < toEmbedS.pixImg.data.length ; i++)
            {
                var valueToHide = toEmbedS.pixImg.data[i];

                this.injectSeq(valueToHide, j);
                /* this could be modify in some way, optimizing the usage,
                 * anyway, mod 3 bit in the first two colors in the pixMap,
                 * could make less detectable (by eyes!) the steganography,
                 * due to the kept good pixel every two */
                j+=8;
            }
        }

        /* those are related to the output canvas, it's always an img the container */
        imageCnvsElem.width = this.imgRef.width;
        imageCnvsElem.height = this.imgRef.height;

        imageCnvsElem.getContext("2d").putImageData(this.pixImg, 0, 0);

        this.HTML_dump("debug1", this.pixImg.data, 20, "<br>after steg apply", "<br>");
    }

    this.composedExtraction = function(matrix, startndx, debug)
    {
        var HighValue = this.extractValue( matrix[startndx], matrix[startndx + 1], 
                                           matrix[startndx + 2], matrix[startndx + 3], debug);

        startndx += 4;

        var CarryValue = this.extractValue( matrix[startndx], matrix[startndx + 1], 
                                            matrix[startndx + 2], matrix[startndx + 3], debug);

        return (HighValue * 256) + CarryValue;
    }

    this.extractStegano = function( dstCnvsElm, dstTxtElm )
    {
        var sI = 0;

        this.HTML_dump("debug2", this.pixImg.data, 20, "<br>extraction from", "<br>");

        this.prologue ("cover");//controllo che l'immagine si una cover 

        /* procede with the content-type extraction */
        var ctExtract = this.composedExtraction(this.pixImg.data, sI, true);
        sI += 8;

        if(ctExtract == CT_text)
        {
            alert('extracting TEXT');

            /* extraction of the text size */
            var textSize = this.composedExtraction(this.pixImg.data, sI, true);
            sI += 8;

            var textExt = '';
            for(var i = 0; i < textSize; i++)
            {
                var longValue = this.composedExtraction(this.pixImg.data, sI, true);
                sI += 8;

                textExt += String.fromCharCode(longValue);

                document.getElementById("debug2").innerHTML += "<br>" + i + " = " + longValue + " =[" +  String.fromCharCode(longValue) +"]";
            }

            document.getElementById(dstTxtElm).innerHTML += textExt;
        }
        else if(ctExtract == CT_img)
        {
            /* initialization of canvas SOURCE object */
            dstCnvsElm.width=this.pixImg.width;
            dstCnvsElm.height=this.pixImg.height;

            var aCanvasCtx = dstCnvsElm.getContext('2d');
            dstCnvsElm.pixImg = aCanvasCtx.createImageData(dstCnvsElm.width, dstCnvsElm.height);

            var destCtx = dstCnvsElm.getContext('2d');//ottengo il contesto del canvas di destinazione

            dstCnvsElm.width= this.composedExtraction(this.pixImg.data, sI, true);
            sI += 8;

            dstCnvsElm.height= this.composedExtraction(this.pixImg.data, sI, true);
            sI += 8;

            alert('extracting IMAGE, XY:' + dstCnvsElm.height + ' & ' + dstCnvsElm.width + ' from index ' + sI);

            var aCanvasCtx = dstCnvsElm.getContext('2d');
            dstCnvsElm.pixImg = aCanvasCtx.createImageData(dstCnvsElm.width, dstCnvsElm.height);

            for(var i = 0; i < dstCnvsElm.pixImg.data.length; i++)
            {
                /* *****
                dstCnvsElm.pixImg.data[i] = this.extractValue(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                                            this.pixImg.data[sI + 2], this.pixImg.data[sI + 3], false);
                sI += 4;
                ***** */

                dstCnvsElm.pixImg.data[i] = this.composedExtraction(this.pixImg.data, sI, false);
                sI += 8;
            }

            destCtx.putImageData(dstCnvsElm.pixImg, 0, 0); 
        }
        else
            alert(" Error! "+ ctExtract + " Invalid code");

    }
}
