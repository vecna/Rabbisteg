<script type="text/javascript">

function handleFiles(files, destID, stegoMean) 
{
    for (var i = 0; i < files.length; i++)//per tutti i file da caricare
    {
        var file = files[i];//ottengo il file in esame
        var imageType = 'image/*';//tipi accettati

        if (!file.type.match(imageType)) {//se il file non è un'immagine
            continue;//passo al file successivo
        }

        var img = document.getElementById(destID);//ottengo l'elemento html dove inserire l'immagine
        var reader = new FileReader();//creo l'oggetto per la lettura del file

        reader.onload =  function(e) //callback utilizzata quando carico leggo un file
        { 
            var ret = "";

            img.src = e.target.result; //imposto l'immagine

            if(stegoMean.match(/secret/)) //se sto impostato l'immagine segreta
                if((ret = importSecret(img, file.type)) != "")//inizializzo il l'oggetto per l'elaborazione dell'immagine
                    alert('error in load secret ' + ret);

            if(stegoMean.match(/cover/))//se sto analizzando l'immagine di copertura
                if((ret = importCover(img, file.type)) != "" )//imposto la cover
                    alert('error in load cover' + ret);
        };

        img.src = reader.readAsDataURL(file);//leggo il contenuto del file come url e imposto i dati letti come immagine
    }
}

function executeSubmit(fileindex, destID, stegoMean)
{
    var fileIDn = "image" + (fileindex).toString();
    var fileUnder = document.getElementById(fileIDn).files[0];

    if(fileUnder == null) 
    {
        if( stegoMean.match(/secret/)) 
        {
            /* in the test case of steganography extraction, the covert only is needed */
            return;
        }
        else
        {
            alert(stegoMean + " image: you have not specify the required file!");
            return;
        }
    } 

    if (!fileUnder.type.match(/image.*/)) {
        alert("This is not image!");
        return;
    }

	var destImg = document.getElementById(destID);
	var reader = new FileReader();

	reader.onload = function(e) 
    { 
        var ret = "";

        destImg.src = e.target.result; 

        if(stegoMean.match(/secret/)) 
            if((ret = importSecret(destImg, fileUnder.type)) != "")
                alert('error in load secret ' + ret);

        if(stegoMean.match(/cover/))
            if((ret = importCover(destImg, fileUnder.type)) != "" )
                alert('error in load cover' + ret);
    }; 

    destImg.src = reader.readAsDataURL(fileUnder);
}

function importSecret(secretImgElem, imageType)
{
    window.rabbiSecr = new rabbiSteg();
    window.rabbiSecr.init( "secret", 2);

    if(window.rabbiSecr.setContentType(imageType) == false)
        return false;

    return window.rabbiSecr.loadImage(secretImgElem);
}

function importCover(coverImgElem, imageType)
{
    window.rabbiCover = new rabbiSteg();//creo un nuovo oggetto per la steganografia
    window.rabbiCover.init ( "cover", 2);//imposto elemento cover

    if(window.rabbiCover.setContentType(imageType) == false)
        return false;

    return window.rabbiCover.loadImage(coverImgElem);//carico immagine
}

/* this function need to check the source of the data and pass the appropriate content-type */
function doStegano()
{
    var response = window.rabbiCover.imageSetup("dest1");
    if (response != true)
        alert('error in setup cover image: ' + response);

    if(window.secretSource == 'dynamicSecretImage')
    {
        /* window.rabbiSecr has been yet initialized in importImage() */
        reponse = window.rabbiSecr.imageSetup("dest2");
        if (response != true)
            alert('error in setup secret image: ' + response);
    }
    else /* window.secretSource == 'dynamicSecretText' */
    {
        /* in this case, window.rabbiSecr has not been yet initialized */
        window.rabbiSecr = new rabbiSteg();
        window.rabbiSecr.init( "secret", 2);
        window.rabbiSecr.setContentType('text/plain');
        window.rabbiSecr.textSetup('secret_input_text');
    }

    response = window.rabbiCover.willContain ( window.rabbiSecr );
    if (response != true)
        alert('error in checking space avalability: ' + response);
    else
        window.rabbiCover.steganography( document.getElementById("canvas3_steganoed"), window.rabbiSecr );
}

function extractStegano_local() /* local output usage - test only usage */
{
    var response = window.rabbiCover.imageSetup("canvas3_steganoed");//imposto l'immagine
    if (response != true)//se ho avuto un errore
        alert('error in setup steganographic image: ' + response);//lo comunico

    if(window.rabbiCover == false)
        alert('secret image not selected nor generated');

    window.rabbiCover.extractStegano( document.getElementById("canvas4_extract"), "text_output" );//estraggo i dati nel canvas specificato
}

function extractStegano() /* file - normal usage */
{
    var response = window.rabbiCover.imageSetup("dest1");//imposto l'immagine
    if (response != true)//se ho avuto un errore
        alert('error in setup steganographic image: ' + response);//lo comunico

    if(window.rabbiCover == false)
        alert('secret image not selected nor generated');

    window.rabbiCover.extractStegano( document.getElementById("canvas4_extract"), "text_output" );//estraggo i dati nel canvas specificato
}

function showInfo()
{
    var cleanSpan = document.getElementById("actual_info");
    cleanSpan.innerHTML = '';

    if(window.rabbiCover != null )
        window.rabbiCover.writeInfo("actual_info");

    if(window.rabbiSecr != null )
        window.rabbiSecr.writeInfo("actual_info");
}

/* 
 * this code is useful for show as default the noscript content, and load the useful
 * one when javascript is running 
 */
function showfloatingDiv()
{
    var target = document.getElementById("floatingDiv_input");
    var source = document.getElementById("hiddenSwap_input");
    target.innerHTML = source.innerHTML;

    target = document.getElementById("floatingDiv_feature");
    source = document.getElementById("hiddenSwap_feature");
    target.innerHTML = source.innerHTML;
}

function loadSecretCont(nameOfContainer)
{
    var target = document.getElementById("dynamicSecret");
    var source = document.getElementById(nameOfContainer);
    target.innerHTML = source.innerHTML;

    window.secretSource = nameOfContainer;

    target = document.getElementById("linkImage");
    target.innerHTML = '';
    target = document.getElementById("linkText");
    target.innerHTML = '';
}

function saveImage()
{
    oCanvas=document.getElementById("canvas3_steganoed");  
    ele=Canvas2Image.saveAsPNG(oCanvas, false /* true */ /* false make download, true return an obj */);
    oCanvas.parentNode.replaceChild(ele, oCanvas);
    alert(ele);
}

function uploadImage(){
}

</script>
