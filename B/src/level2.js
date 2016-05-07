var level1 = require('./level1'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    debug = require('debug')('level2');

/*
 * state keep track of:
 * .links (collection of refere->link combo)
 * .fetched (all the link you already clicked)
 * .. others?
 */

var appendState = function(currentState, fetchResult) {

    if(fetchResult.status !== 200) {
        debug("appendState receive a non 200 results: ignored", 
            fetchResult.status);
        return currentState;
    }

    if(_.size(fetchResult.collection) === 0) {
        debug("appendState with an empty links collection!");
        return currentState;
    }

    currentState.fetched.push({
        'url': fetchResult.url,
        'when': fetchResult.when
    });

    currentState.links = _.concat(currentState.links, 
        fetchResult.collection);

    return currentState;
    
};

var nextStep = function(state, stepNumber) {

    /* simple implementation */
    debug("Performing step %d of handshake, over %d elements", 
        stepNumber, _.size(state.links));

    if(_.size(state.links) === 0)
        throw new Error("lacking of state, nextStep impossible");

    var nextUrl = state.links[stepNumber].href;

    return level1
        .fetchAndParse(nextUrl, null, stepNumber)
        .then(function(fetchResult) {
            return appendState(state, fetchResult);
        })
        .tap(function(state) {
            debug("done step %d now state has %d elements", 
                stepNumber, _.size(state.links));
        });

};


var handShake = function(site) {
   
    debug("Initializing handShake with %s", site);

    return level1
        .fetchAndParse(site, null, 1)
        .then(function(fetchResult) {
            /* !== 200 => throw new Error */
            return appendState({ fetched: [], links: [] }, fetchResult);
        })
        .delay(1000)
        .then(function(state) {
            return nextStep(state, 2);
        })
        .delay(1000)
        .then(function(state) {
            return nextStep(state, 3);
        })
        .delay(1000)
        .then(function(state) {
            return nextStep(state, 4);
        })
        .tap(function(state) {
            console.log(JSON.stringify(state, undefined, 2));
        });
};

var transmit = function(state, message) {
   
    process.exit(0);
    var steganoMap = level1.computeSteganoMap(state, message);

    return new Promise.all(steganoMap)
        .then(function(results) {
            debug("stegoMap resolved!");
            console.log(JSON.stringify(results));
        });
};

module.exports = {
    handShake: handShake,
    transmit: transmit
};
