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
    this.willContain = function( injectable ) 
    {
        this.prologue ("cover");
 
        /* if bitAbuse is 2, the avail pixed need to be almost (8 / 2) = 4 times gretar */
        var timeGreat = (8 / bitAbuse);

        /*
        alert( this.availPixNumber + ' ' + injectable.availPixNumber + ' ' + bitAbuse + ' ' + (8 /  bitAbuse )  );
         */

        if( (this.availPixNumber) <= (injectable.availPixNumber * (8 / bitAbuse) ) )
            return "Invalid: the cover image must be "+ timeGreat  +" greater than the secret image";
        else
            return true;
    }

    /* utility! */
    this.stegoEmbed = function(sourceVal, toInjectVal, ndxPos)
    {
        var andValue = (toInjectVal & this.mask[ndxPos]);
        var leastSign = (andValue >> (ndxPos * 2));
        sourceVal = ((sourceVal >> 2) << 2) + leastSign;

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

        alert(' inject of ' + targetVal + ' split in ' + bigp + ' & ' + carry);
        
        this.pixImg.data[start_ndx + 0] = this.stegoEmbed(this.pixImg.data[start_ndx + 0], bigp, 0);
        this.pixImg.data[start_ndx + 1] = this.stegoEmbed(this.pixImg.data[start_ndx + 1], bigp, 1);
        this.pixImg.data[start_ndx + 2] = this.stegoEmbed(this.pixImg.data[start_ndx + 2], bigp, 2);
        this.pixImg.data[start_ndx + 3] = this.stegoEmbed(this.pixImg.data[start_ndx + 3], bigp, 3);

        start_ndx += 4;
        
        this.pixImg.data[start_ndx + 0] = this.stegoEmbed(this.pixImg.data[start_ndx + 0], carry, 0);
        this.pixImg.data[start_ndx + 1] = this.stegoEmbed(this.pixImg.data[start_ndx + 1], carry, 1);
        this.pixImg.data[start_ndx + 2] = this.stegoEmbed(this.pixImg.data[start_ndx + 2], carry, 2);
        this.pixImg.data[start_ndx + 3] = this.stegoEmbed(this.pixImg.data[start_ndx + 3], carry, 3);
    }

    /* this function need to be set as callback */
    this.steganography = function( imageCnvsElem, toEmbedS )
    {
        alert("I'm on it! " + this.imgRef.width + " & " + this.imgRef.height+ " = " + this.pixImg.data.length +
                " adding "+ toEmbedS.imgRef.width + " & " + toEmbedS.imgRef.height + " = " + toEmbedS.pixImg.data.length);

        this.prologue ("cover");

        var j = 0;
        var sI=0;
/* deb */
    document.getElementById("debug1").innerHTML += 
                          "first {"+this.pixImg.data[sI]+"}{"+this.pixImg.data[sI + 1]+"}{"+ 
                                    this.pixImg.data[sI + 2]+"}{"+ this.pixImg.data[sI+ 3]+"}{ second }{"+
                                    this.pixImg.data[sI+4]+"}{"+this.pixImg.data[sI + 5]+"}{"+
                                    this.pixImg.data[sI + 6]+"}{"+this.pixImg.data[sI + 7]+"}**<br>";
/* / deb */

        this.injectSeq(toEmbedS.imgRef.width, j);
        j += 8;

        this.injectSeq(toEmbedS.imgRef.height, j);
        j += 8;
        
/* / deb */
    document.getElementById("debug1").innerHTML += 
                          " after (" + toEmbedS.imgRef.width + ") and ("+ toEmbedS.imgRef.height + ") first {"+
                                    this.pixImg.data[sI]+"}{"+this.pixImg.data[sI + 1]+"}{"+ 
                                    this.pixImg.data[sI + 2]+"}{"+ this.pixImg.data[sI+ 3]+"}{ second }{"+
                                    this.pixImg.data[sI+4]+"}{"+this.pixImg.data[sI + 5]+"}{"+
                                    this.pixImg.data[sI + 6]+"}{"+this.pixImg.data[sI + 7]+"}**<br>";
/* / deb */

        for(var i = 0 ; i < toEmbedS.pixImg.data.length; i++)
        {
            var valueToHide = toEmbedS.pixImg.data[i];

            /* we're sure that: j < this.pixImg.data.length, checkd with willContain */
            this.pixImg.data[j] = this.stegoEmbed(this.pixImg.data[j], valueToHide, 0);
            j++;

            this.pixImg.data[j] = this.stegoEmbed(this.pixImg.data[j], valueToHide, 1);
            j++;

            this.pixImg.data[j] = this.stegoEmbed(this.pixImg.data[j], valueToHide, 2);
            j++;

            this.pixImg.data[j] = this.stegoEmbed(this.pixImg.data[j], valueToHide, 3);
            j++;
        }

        imageCnvsElem.width = this.imgRef.width;
        imageCnvsElem.height = this.imgRef.height;

        imageCnvsElem.getContext("2d").putImageData(this.pixImg, 0, 0);

        /*
        alert("end of steganography " + this.pixImg.height + " & " + this.pixImg.width);
         */
    }

    this.extractStegano = function( cnvsEdst )
    {
        var sI = 0;

        this.prologue ("cover");//controllo che l'immagine si una cover

		var destCtx = cnvsEdst.getContext('2d');//ottengo il contesto del canvas di destinazione

        cnvsEdst.width=this.pixImg.width;
        cnvsEdst.height=this.pixImg.height;

        var aCanvasCtx = cnvsEdst.getContext('2d');
        cnvsEdst.pixImg = aCanvasCtx.createImageData(cnvsEdst.width, cnvsEdst.height);

        document.getElementById("debug2").innerHTML += 
                    " extract from {"+ this.pixImg.data[sI]+"}{"+this.pixImg.data[sI + 1]+"}{"+ 
                                       this.pixImg.data[sI + 2]+"}{"+ this.pixImg.data[sI+ 3]+"}{ & }{"+
                                       this.pixImg.data[sI+4]+"}{"+this.pixImg.data[sI + 5]+"}{"+
                                       this.pixImg.data[sI + 6]+"}{"+this.pixImg.data[sI + 7]+"};";
		   
		//calcolo larghezza dell'immagine nascosta
        var bigW = this.extractValue(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                     this.pixImg.data[sI + 2], this.pixImg.data[sI + 3]);
        sI += 4;
        var carryW = this.extractValue(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                     this.pixImg.data[sI + 2], this.pixImg.data[sI + 3]);
        sI += 4;
        
        //calcolo altezza dell'immagine nascosta
        var bigH = this.extractValue(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                     this.pixImg.data[sI + 2], this.pixImg.data[sI + 3]);
        sI += 4;
        var carryH = this.extractValue(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                     this.pixImg.data[sI + 2], this.pixImg.data[sI + 3]);
        sI += 4;

/*
        final computing 
*/
        cnvsEdst.width = (bigW * 256) + carryW;
        cnvsEdst.height = (bigH * 256) + carryH;

        alert('extracted H ' + cnvsEdst.height + ' from ' + bigH + 'x 256 & ' + carryH + 'extracted W ' + cnvsEdst.width + ' from ' + bigW + 'x 256 & ' + carryW);

        /* will be strage that a cover image is used, in the same session as container and
         * dest. I belive that software interfaces need to be less limited where possibile,
         * because the next generations will perceive the Intertubes with eyes none ever had */
 
//        alert('extracted width/height: ' + cnvsEdst.width + ' e ' + cnvsEdst.height);

        var aCanvasCtx = cnvsEdst.getContext('2d');
        cnvsEdst.pixImg = aCanvasCtx.createImageData(cnvsEdst.width, cnvsEdst.height);

        for(var i = 0; i < cnvsEdst.pixImg.data.length; i++)
        {
            cnvsEdst.pixImg.data[i] = this.extractValue(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                                        this.pixImg.data[sI + 2], this.pixImg.data[sI + 3]);
            sI += 4;
        }

        destCtx.putImageData(cnvsEdst.pixImg, 0, 0); 
    }
}
