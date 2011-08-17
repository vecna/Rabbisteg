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
        var availType = new Array( "secret", "cover", "extract" );

        for( var i = 0; i < availType.length; i++)
        {
            if(typeString.match(availType[i]))
                this.type = typeString;
        }

        if(this.type == '')
            return "invalid type of usage sets in rabbiSteg: check the first args";

        /* generate the bitmasks - at the moment, only 2 is supported */
	    this.mask = new Array( 3, 12, 48, 192, 15, 240, 3840, 61440 );
        /* end of tmp debug mode */
        
        return true;
    }

    /* event driven function: when the image is load, read the canvas */
    this.loadImage = function( imageElem )
    {
        /* in the initialization method, import the image and grab them as canvas and pixmap */
        if (!imageElem.src.match("image/*")) 
            return "This image don't seem to be an Image file";

		this.cnvs = document.createElement("canvas"); 
        this.cnvs.width = imageElem.width;
        this.cnvs.height = imageElem.height;

        /* this cause to inheriet original width and height */
        this.src = imageElem.src;
        this.imgRef = imageElem;

        return "";
    }

    /* this is splitted from the loadImage function, because sometime happen width and height are not
     * updated with the loaded img */
    this.imageSetup = function()
    {
		this.ctx = this.cnvs.getContext('2d');

        this.ctx.drawImage(this.imgRef, 0, 0); 
		this.pixImg = this.ctx.getImageData(0, 0, this.imgRef.width, this.imgRef.height);

        this.availPixNumber = (this.imgRef.width * this.imgRef.height * 4);
        if(this.availPixNumber == 0)
            return "unable to acquire correclty image with role " + this.type;

        return true;
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

        alert( this.availPixNumber + ' ' + injectable.availPixNumber + ' ' + bitAbuse + ' ' + (8 /  bitAbuse )  );

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

    this.injectNum = function(sourceVal, toInjectNumber, ndxPos)
    {
        if(toInjectNumber > 65535) {
            alert('Image too large to be hidden!');
        }

        var usableIndex = (ndxPos + 4)
        /* remind: can't ndxPos += 4 because in >> (ndxPos * 4) need to be 0..3 */
        var andValue = (toInjectNumber & this.mask[usableIndex]);
        var leastSign = (andValue >> (ndxPos * 4));
        sourceVal = ((sourceVal >> 4) << 4) + leastSign;

        return sourceVal;
    }

    this.extractNum = function(stegoV1, stegoV2, stegoV3, stegoV4)
    {
        var retVal = 0;

        retVal += (stegoV1 & this.mask[4]);
        retVal += ((stegoV2 & this.mask[4]) << 4);
        retVal += ((stegoV3 & this.mask[4]) << 8);
        retVal += ((stegoV4 & this.mask[4]) << 12);

        return retVal;
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
        for(var i = 0; i < 4; i++)
            this.pixImg.data[start_ndx + i] = this.injectNum(this.pixImg.data[start_ndx + 0], targetVal, i);
    }

    /* this function need to be set as callback */
    this.steganography = function( imageCnvsElem, toEmbedS )
    {
        alert("I'm on it! workin over: " + this.imgRef.width + " & " + this.imgRef.height+ " = " + this.pixImg.data.length);

        this.prologue ("cover");

        var j = 0;

        this.injectSeq(toEmbedS.imgRef.width, j);
        j += 4;

        this.injectSeq(toEmbedS.imgRef.height, j);
        j += 4;

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
        }

        imageCnvsElem.width = this.imgRef.width;
        imageCnvsElem.height = this.imgRef.height;

        imageCnvsElem.getContext("2d").putImageData(this.pixImg, 0, 0);
        alert("fine di steganography " + this.pixImg.height + " & " + this.pixImg.width);
    }

    this.extractStegano = function( cnvsEdst )
    {
        var sI = 0;

        this.prologue ("cover");

		var destCtx = cnvsEdst.getContext('2d');

        cnvsEdst.width = this.extractNum(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                    this.pixImg.data[sI + 2], this.pixImg.data[sI+ 3]);
        sI += 4;
        cnvsEdst.height = this.extractNum(this.pixImg.data[sI], this.pixImg.data[sI + 1], 
                                    this.pixImg.data[sI + 2], this.pixImg.data[sI + 3]);
        sI += 4;

        /* will be strage that a cover image is used, in the same session as container and
         * dest. I belive that software interfaces need to be less limited where possibile,
         * because the next generations will perceive the Intertubes with eyes none ever had */

        alert('extracted width/height: ' + cnvsEdst.width, + ' e ' + cnvsEdst.height);

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
