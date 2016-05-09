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

    currentState.bits_expressed = _.parseInt(Math.log2(_.size(currentState.links)));
    debug("bits %d steps %d", currentState.bits_expressed, currentState.steps); 
    return currentState;
};

var nextStep = function(state, stepNumber) {

    var stepMap = {
      2: function(links) {
          var half = _.parseInt(_.size(links) / 2);
          debug("step 2, %d over %d", half, _.size(links));
          return links[half].href;
      },
      3: function(links) {
          var half =  _.parseInt(_.size(links)/2),
              threefth = _.parseInt(half + (half/2) );
          debug("step 3, %d over %d", threefth , _.size(links));
          return links[threefth].href;
      },
      4 : function(links) {
          var half =  _.parseInt(_.size(links)/2),
              forthy = _.parseInt(half - (half/2) );
          debug("step 4, %d over %d", forthy, _.size(links));
          return links[forthy].href;
      }
    },
        stepNumber = (state.steps + 1);

    /* simple implementation */
    debug("Performing step %d of handshake, over %d elements", 
        stepNumber, _.size(state.links));

    if(_.size(state.links) === 0)
        throw new Error("lacking of state, nextStep impossible");

    /* is not yet advanced as I like, but ... */
    var nextUrl = stepMap[stepNumber](state.links);
    debug("step matrix return for %d: %s", stepNumber, nextUrl);

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
            return appendState({ 
                fetched: [], 
                links: [],
                steps: 1,
            }, fetchResult);
        })
        .then(function(state) {
            return nextStep(state);
        })
        .then(function(state) {
            return nextStep(state);
        })
        .then(function(state) {
            return nextStep(state);
        })
        .tap(function(state) {
            debug("handShake completed, %d entries in state", 
                _.size(state));
            return process.env.VERBOSE && level1.functionVerbose(
                'handShake', {site: site}, state
            );
        });
};

var transmit = function(state, message) {
 
    var steganoMap = level1.computeSteganoMap(state, message);

    debug("transmit");
    return new Promise.all(steganoMap)
        .then(function(results) {
            debug("stegoMap resolved!");
            console.log(JSON.stringify(results));
        })
        .tap(function(results) {
            return process.env.VERBOSE && level1.functionVerbose(
                'transmit', {message: message}, results
            );
        });
};

module.exports = {
    handShake: handShake,
    transmit: transmit
};
