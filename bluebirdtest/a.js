// _ = require('lodash');
Promise = require('bluebird');
prequest = Promise.promisify(require('request'));
a = require('request');
// jsdom = require('jsdom');


a = function() {
    setTimeout(function () {
        console.log("bop!");
    }, 1000)
};

fetchPageAndExtend = function (referrer_map, index, page) {

    var url = 'http://127.0.0.1:8000' + page;
    prequest(url)
        .then(function(response) {
        var body = response[1];
        referrer_map[index] = JSON.parse(body);
        debugger;

    })
    .catch(function (error) {
            console.error("This is bad! " + error);
    })
    .tap(a)
    .then(function() {
            JSON.stringify(referrer_map, undefined, 3);
    })
    .return(referrer_map);
};

var refmap = {};

new Promise(function () {
        fetchPageAndExtend(refmap, 'first', "/" );
    })
    .then(function() {
        fetchPageAndExtend(refmap, 'second', "/subdir-1/index.html");
    })
    .then(function() {
        fetchPageAndExtend(refmap, 'third', "/subdir-2/index.html");
    })
    .tap(function() {
        console.log("Happy ending!");
        JSON.stringify(updated, undefined, 3);
    });

/*
a = new Promise().chain(
    [   fetchPageAndExtend(refmap, 'first', "/" ),
        fetchPageAndExtend(refmap, 'second', "/subdir-1/index.html"),
        fetchPageAndExtend(refmap, 'third', "/subdir-2/index.html")  ]
);
*/
