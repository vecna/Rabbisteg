var Promise = require('bluebird'),
    cheerio = require('cheerio'),
    debug = require('debug')('level1'),
    _ = require('lodash'),
    hrefType = require("href-type"),
    request = Promise.promisifyAll(require('request')),
    fs = Promise.promisifyAll(require('fs')),
    moment = require('moment'),
    crypto = require('crypto');

var functionVerbose = function(funcName, parameters, result) {

    var parmstring = _.reduce(parameters, function(memo, v, k) {
        memo += "  " + k +": " + v + "\n";
    }, ""),
        savedcontent = "====" + "\n",
        fname = 'logs/' + funcName + '.json';

    if (typeof(result) !== 'string') 
        throw new Error("result in 'functionVerbose' has to be a 'str'");

    debug("Appending verbose log in %s", fname);
    return fs
        .appendFileAsync(fname, 
            savedcontent + parmstring + result + "\n"
        );
};

var fetchAndParse = function(url, referer, step) {
    /* TODO use the referer in the URL or .. */

    var retVal = {
        'collection': [],
        'status': -1,
        'when': moment(),
        'url': url
    };

    return request
        .getAsync(url)
        .then(function(response) {
            retVal.status = response.statusCode;
            if (response.statusCode === 200) {
                var links = cheerio.load(response.body)('a');
                retVal.collection = _.reduce(links, function(memo, a) {
                    var href = _.get(a, 'attribs.href'),
                        chr = assemblyHref(url, href),
                        id = linkIdHash(url, href);

                    if (_.isNull(chr)) 
                        return memo;
                    if(_.find(memo, {id: id})) 
                        return memo;

                    return _.concat(memo, {
                        'href': chr,
                        'referer': url,
                        'id': id,
                        'step': step });
                }, []);
            } else {
                debug("Invalid HTTP code from %s: %d", url, retVal.status);
            }
        })
        .tap(function() {
            debug("The parsing of %s lead to %d uniq link", 
                url, _.size(retVal.collection));
            return process.env.VERBOSE && functionVerbose(
                 'fetchAndParse',
                {url: url, referer: referer, step: step},
                 JSON.stringify(retVal, undefined, 2)
            );
        })
        .return(retVal);
};


var linkIdHash = function(referer, href) {
    var text = referer + href,
        sha1sum = crypto.createHash('sha1');
    sha1sum.update(text);
    return sha1sum.digest('hex');
};

/* TODO check is the same domain or just return null */
var assemblyHref = function(url, href) {
    debug("assemblyHref %s + %s (%s)", url, href, hrefType(href) );
    if (_.startsWith(href, '#'))
        return null;
    switch(hrefType(href)) {
        case 'relative':
            // if (!_.endsWith(url, '/'))
            //     url = url + '/';
            var protocol = url.split('://')[0];
                pathChunks = url.split('://')[1].split('/'),
                path = null;
            if (_.size(pathChunks) > 1)
                path = _.initial(pathChunks).join('/');
            else
                path = _.first(pathChunks);
            return protocol + '://' + path + '/' + href;
            break;
        case 'rooted':
            var domain = url.split('://')[1].split('/')[0],
                protocol = url.split('://')[0];
            return protocol + '://' + domain + '/' + href;
        case 'absolute':
            return href;
        default:
            debug("Ignoring URL %s because [%s]", href, hrefType(href));
            return null;
    };
};

var computeSteganoMap = function(state, message) {
    
    debug("I've to compute on a state of %d links combo, %d bytes",
        _.size(state.links), _.size(message) );
    /* TODO https://nodejs.org/dist/latest/docs/api/zlib.html */

    process.exit(0);
};

module.exports = {
    fetchAndParse: fetchAndParse,
    linkIdHash: linkIdHash,
    assemblyHref: assemblyHref,
    computeSteganoMap: computeSteganoMap,
    functionVerbose: functionVerbose
};
