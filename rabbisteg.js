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

    this.init = function ( typeString, amountOfInject ) 
    {
        var availType = new Array( "secret", "cover", "extract" );//tipo validi

        for( var i = 0; i < availType.length; i++)//per tutti i tipi
        {
            if(typeString.match(availType[i]))//se il tipo passato come argomento è uguale all'i-esimo tipo valido
                this.type = typeString;//imposto il tipo
        }

        if(this.type == '')//se non ho imposto nessun tipo
            return "invalid type of usage sets in rabbiSteg: check the first args";//errore

        /* generate the bitmasks - at the moment, only 2 is supported */
	    this.mask = new Array( 3, 12, 48, 192, 15, 240, 3840, 61440 );
        /* end of tmp debug mode */
        
        return true;//tutto ok
    }

    /* event driven function: when the image is load, read the canvas */
    this.loadImage = function( imageElem )
    {
        /* in the initialization method, import the image and grab them as canvas and pixmap */
        if (!imageElem.src.match("image/*"))//se l'elemento non rappresenta un'immagine
            return "This image don't seem to be an Image file";//errore

        /* this cause to inheriet original width and height */
        this.src = imageElem.src;//ottengo i dati dell'immagine

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

		this.cnvs = document.createElement("canvas"); //creo un nuovo canvas
        this.cnvs.width = this.imgRef.width;//imposto larghezza
        this.cnvs.height = this.imgRef.height;//e altezza

		this.ctx = this.cnvs.getContext('2d');//ottengo il contesto del canvas per poter operare sui dati dell'immagine

        this.ctx.drawImage(this.imgRef, 0, 0);//disegno l'immagine nel canvas di appoggio

		this.pixImg = this.ctx.getImageData(0, 0, this.imgRef.width, this.imgRef.height);//ottengo i pixel dell'immagine

        this.HTML_dump("debug1", this.pixImg.data, 10, "<br><b>init", "<br></b>");

        this.prologue ("cover");//controllo che l'immagine si una cover 
        this.availPixNumber = (this.imgRef.width * this.imgRef.height * 4);//calcolo il numero di pixel che posso nascondere
        if(this.availPixNumber == 0)//se il numero è 0 l'immagine probabilmente non è valida
            return "unable to acquire correclty image with role " + this.type;//errore

        return true;//tutto ok
    }

    this.prologue = function( required )
    {
        if(!this.type.length)
            alert('bad usage of rabbiSteg class: required to "init" if used in secret, cover or extract mode');

        if(!required.match(this.type))
            alert('bad implementation of rabbiSteg class: called method for "' + required + '" in "' + this.type + '"'); 
    }

    /* follow the methods to be used in the Cover image */
    this.willContain = function( mayBeInjected ) 
    {
        this.prologue ("cover");
 
        /* if bitAbuse is 2, the avail pixed need to be almost (8 / 2) = 4 times gretar */
        var timeGreat = (8 / bitAbuse);

        alert( this.availPixNumber + ' ' + mayBeInjected.availPixNumber + ' ' + bitAbuse + ' ' + (8 /  bitAbuse )  );

        if( (this.availPixNumber) <= (mayBeInjected.availPixNumber * (8 / bitAbuse) ) )
            return "Invalid: the cover image must be "+ timeGreat  +" greater than the secret image";
        else
            return true;
    }

    /* utility! */
    this.stegoEmbed = function(sourceVal, toInjectVal, ndxPos, debug)
    {
        if(debug)
            document.getElementById("debug1").innerHTML += "<br>{src "+ sourceVal +"}inj "+toInjectVal+" ndxP "+ndxPos+"}";

        var andValue = (toInjectVal & this.mask[ndxPos]);
        var leastSign = (andValue >> (ndxPos * 2));
        sourceVal = ((sourceVal >> 2) << 2) + leastSign;

        if(debug)
            document.getElementById("debug1").innerHTML += " = "+sourceVal + '<br>';

        return sourceVal;
    }

    this.writeInfo = function(destSpanId)
    {
        var spid = document.getElementById(destSpanId);
        spid.innerHTML += "{type: " + this.type + " width: " + this.imgRef.width + " height: " + this.imgRef.height + "} ";
    }

    this.extractValue = function(stegoV1, stegoV2, stegoV3, stegoV4)
    {
        var retVal = 0;

        retVal += (stegoV1 & this.mask[0]);
        retVal += ((stegoV2 & this.mask[0]) << 2);
        retVal += ((stegoV3 & this.mask[0]) << 4);
        retVal += ((stegoV4 & this.mask[0]) << 6);

        return retVal;
    }

    this.injectSeq = function( targetVal, start_ndx)
    {
        var bigp = Math.floor(targetVal / 256);
        var carry = (targetVal % 256);

        this.pixImg.data[start_ndx + 0] = this.stegoEmbed(this.pixImg.data[start_ndx + 0], bigp, 0, false);
        this.pixImg.data[start_ndx + 1] = this.stegoEmbed(this.pixImg.data[start_ndx + 1], bigp, 1, false);
        this.pixImg.data[start_ndx + 2] = this.stegoEmbed(this.pixImg.data[start_ndx + 2], bigp, 2, false);
        this.pixImg.data[start_ndx + 3] = this.stegoEmbed(this.pixImg.data[start_ndx + 3], bigp, 3, false);

        start_ndx += 4;
        
        this.pixImg.data[start_ndx + 0] = this.stegoEmbed(this.pixImg.data[start_ndx + 0], carry, 0, false);
        this.pixImg.data[start_ndx + 1] = this.stegoEmbed(this.pixImg.data[start_ndx + 1], carry, 1, false);
        this.pixImg.data[start_ndx + 2] = this.stegoEmbed(this.pixImg.data[start_ndx + 2], carry, 2, false);
        this.pixImg.data[start_ndx + 3] = this.stegoEmbed(this.pixImg.data[start_ndx + 3], carry, 3, false);
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
        var dynamicData;
        if(toEmbedS.content_type == 'text/plain')
        {
            this.injectSeq(toEmbedS.Text.length, j);
            j += 8;
            dynamicData = toEmbedS.Text;
            alert(' text steganography, length ' + toEmbedS.Text.length + ' content-type ' + toEmbedS.content_code);
        }
        else
        {
            this.injectSeq(toEmbedS.imgRef.width, j);
            j += 8;

            this.injectSeq(toEmbedS.imgRef.height, j);
            j += 8;
            dynamicData = toEmbedS.pixImg.data;

            alert(' image steganography, width ' + toEmbedS.imgRef.width + ' height ' + toEmbedS.imgRef.height + ' content-type ' + toEmbedS.content_code);
        }
       
        /* third, inject the data */ 
        for(var i = 0 ; i < dynamicData.length ; i++)
        {
            var valueToHide = dynamicData[i];

            /* due to utf-16 availablility, encoding text require a double space */
            this.injectSeq(valueToHide.charCodeAt(0), j);
            j+=8;
        }

        /* those are related to the output canvas, it's always an img the container */
        imageCnvsElem.width = this.imgRef.width;
        imageCnvsElem.height = this.imgRef.height;

        imageCnvsElem.getContext("2d").putImageData(this.pixImg, 0, 0);

        this.HTML_dump("debug1", this.pixImg.data, 20, "<br>after steg apply", "<br>");
    }

    this.composedExtraction = function(matrix, startndx)
    {
        var HighValue = this.extractValue( matrix[startndx], matrix[startndx + 1], 
                                           matrix[startndx + 2], matrix[startndx + 3]);

        startndx += 4;

        var CarryValue = this.extractValue( matrix[startndx], matrix[startndx + 1], 
                                            matrix[startndx + 2], matrix[startndx + 3]);
        
        return (HighValue * 256) + CarryValue;
    }

    this.extractStegano = function( dstCnvsElm, dstTxtElm )
    {
        var sI = 0;

        this.HTML_dump("debug2", this.pixImg.data, 20, "<br>extraction from", "<br>");

        this.prologue ("cover");//controllo che l'immagine si una cover 

        /* procede with the content-type extraction */
        var ctExtract = this.composedExtraction(this.pixImg.data, sI);
        sI += 8;

        if(ctExtract == CT_text)
        {
            alert('extracting TEXT');

            /* extraction of the text size */
            var textSize = this.composedExtraction(this.pixImg.data, sI);
            sI += 8;

            var textExt = '';
            for(var i = 0; i < textSize; i++)
            {
                var longValue = this.composedExtraction(this.pixImg.data, sI);
                sI += 8;

                textExt += String.fromCharCode(longValue);

                document.getElementById("debug2").innerHTML += "<br>" + i + " = " + longValue + " =[" +  String.fromCharCode(longValue)
 +"]";
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

            //calcolo larghezza dell'immagine nascosta
            dstCnvsElm.width= this.composedExtraction(this.pixImg.data, sI);
            sI += 8;
            
            //calcolo altezza dell'immagine nascosta
            dstCnvsElm.height= this.composedExtraction(this.pixImg.data, sI);
            sI += 8;

            alert('extracting IMAGE, XY:' + dstCnvsElm.height + ' & ' + dstCnvsElm.width );

            var aCanvasCtx = dstCnvsElm.getContext('2d');
            dstCnvsElm.pixImg = aCanvasCtx.createImageData(dstCnvsElm.width, dstCnvsElm.height);

            for(var i = 0; i < dstCnvsElm.pixImg.data.length; i++)
            {
                dstCnvsElm.pixImg.data[i] = this.extractValue(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                                            this.pixImg.data[sI + 2], this.pixImg.data[sI + 3]);
                sI += 4;
            }

            destCtx.putImageData(dstCnvsElm.pixImg, 0, 0); 
        }
        else
            alert(" Error! "+ ctExtract + " Invalid code");

    }
}
