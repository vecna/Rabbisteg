
var request = require('request'),
    cheerio = require('cheerio');

var avail_referer = [];
var avail_urls = [];
var base = null;

function Map(referer, url_present) {

    if (url_present[0] == '/') {
        console.log("Here we are" + url_present);
        url_present = base + url_present;
    }

    if (url_present == referer) {
        console.log("skipping url = to referer");
        console.log(url_present + " " + referer + " avail refs: " + avail_referer.length);
        return;
    }

    var ref_i = avail_referer.indexOf(referer);
    if (ref_i == -1) {
        avail_referer.push(referer);
        avail_urls[0] = [];
        avail_urls[0].push(url_present);


    } else {
        avail_urls[ref_i] = avail_urls[ref_i] || [];
        var ref_u = avail_urls[ref_i].indexOf(url_present);

        if (ref_u == -1) {
            avail_urls[ref_i].push(url_present)
        }
    }
}

function Picker(referers) {
    /* referes because the algoritmh taken only URL associdated with referers,
     * available (or less than available, just the referer usable in the phase) */

    console.log(referers);
    referers.forEach(function (ref, ndx) {
        console.log("index " + ndx);
        console.log("summer ? " + ref);
        ref_i = avail_referer.indexOf(ref);
        console.log("avail at " + ref_i);
        console.log("urls " + avail_urls[ref_i].length);
    });
}



var firstPhase = function FirstPhase() {

    return {

        R : function requester(page, cb) {
            console.log("this is the " + page);
            request(page, function(error, response, body) {
                // Hand the HTML response off to Cheerio and assign that to
                //  a local $ variable to provide familiar jQuery syntax.
                var $ = cheerio.load(body);
                console.log("done the request + load!");
                // Exactly the same code that we used in the browser before:
                $('a').each(function() {
                    href = $(this).attr('href');
                    if (href) {
                        // console.log(href + $(this).text());
                        x = Map(page, href);
                    }
                    else {
                        // console.log("!! " + $(this).text());
                    }
                });
                console.log("end of all");
                second_page = cb(page);
                console.log("starting second step w/ " + second_page);
                b = firstPhase();
                third_page = b.R(second_page, b.B);
            });
        },
        B : function boh(page_called) {
            console.log("Checking numbers...");
            console.log(avail_referer);
            // console.log(avail_urls);

            ref_i = avail_referer.indexOf(page_called);

            if (avail_urls[ref_i] && avail_urls[ref_i].length) {
                console.log("Here we are, with our list of shit, after fetching " + page_called + " position " + ref_i);

                console.log(avail_urls[ref_i].length);
                console.log(Math.round( avail_urls[ref_i].length / 2) );
                console.log(Math.round( avail_urls[ref_i].length / 3) );
                console.log(Math.round( (avail_urls[ref_i].length / 3) * 2) );

                Picker( [ page_called ] );
                console.log("Starting next: " + avail_urls[ref_i][0]);
                console.log("Starting +1 : " + avail_urls[ref_i][1]);
                console.log("Starting +2 : " + avail_urls[ref_i][2]);
                console.log("Starting 0, 0: " + avail_urls[0][0]);
                return avail_urls[ref_i][0];
            }
            else {
                console.log("Current situation not good!");
            }
        }
    }
};

start_page = 'http://www.repubblica.it';
base = start_page;

console.log("_!_");
a = firstPhase();
second_page = a.R(start_page, a.B);

console.log("This is going to be executed during the async world");

/*
console.log("!!");

request(start_page, function(error, response, body) {
    // Hand the HTML response off to Cheerio and assign that to
    //  a local $ variable to provide familiar jQuery syntax.
    var $ = cheerio.load(body);
    console.log("xxx");
    // Exactly the same code that we used in the browser before:
    $('a').each(function() {
        href = $(this).attr('href');
        if (href) {
            console.log(href + $(this).text());
            x = Map(start_page, href);
        }
        else {
            console.log("!! " + $(this).text());
        }
    });

});

*/
