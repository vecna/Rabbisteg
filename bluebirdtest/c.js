
var Promise = require('bluebird');
prequest = Promise.promisify(require('request'));


fetchPageAndExtend = function (referrer_map, index, page) {

    var url = 'http://127.0.0.1:8000' + page;
    prequest(url)
        .then(function(response) {
            var body = response[1];
            referrer_map[index] = JSON.parse(body);
            // debugger;
        })
        .catch(function (error) {
            console.error("This is bad! " + error);
        })
        .then(function() {
            JSON.stringify(referrer_map, undefined, 3);
        })
        .return(referrer_map);
};

function poll()
{
  var interval;

  return new Promise( function(resolve, reject) {
    interval = setInterval(function() {
      console.log('Polling...');
        fetchPageAndExtend({}, 'first', '/');
    }, 1000).unref();
  })
   // .cancellable()
    .catch(function(e) {
      console.log('poll error:', e.name);
      clearInterval(interval);
      throw e;
    });
}

function pollOrTimeout() {
  return poll()
    .then(function() { return Promise.resolve('finished') })
    .timeout(5000)
    .catch(Promise.TimeoutError, function(e) {
      return Promise.resolve('timed out');
    })
    .catch(function(e) {
      console.log('Got some other error ' + e.name);
      throw e;
    });
}

return pollOrTimeout()
  .then(function(result) {
    console.log('Result:', result);
  })

