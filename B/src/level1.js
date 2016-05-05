var Promise = require('bluebird'),
    cheerio = require('cheerio'),
    debug = require('debug')('level1'),
    _ = require('lodash'),
    request = Promise.promisifyAll(require('request')),
    moment = require('moment'),
    crypto = require('crypto');

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
                debugger;
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
    if (_.startsWith(href, '#'))
        return null;
    if (_.isNull(href.match(/^https?:\/\//))) {
        return null;
    } else {
        return href;
    }

    // TODO https://www.npmjs.com/package/href-type
    // else, we've to mash the base
    /*
    if (_.startsWith(href, '/')) {
        url.replace(/^https?:\/\//, '')
    }*/
};

var computeSteganoMap = function(state, message) {
    
    debug("I've to compute on a state of %d links combo, %d bytes",
        _.size(state.links), _.size(message) );
    /* TODO https://nodejs.org/dist/latest/docs/api/zlib.html */


};

module.exports = {
    fetchAndParse: fetchAndParse,
    linkIdHash: linkIdHash,
    computeSteganoMap: computeSteganoMap
};
