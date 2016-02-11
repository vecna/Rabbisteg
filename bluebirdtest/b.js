var BlueBird = require("bluebird");
var promisifiedRequest = BlueBird.promisify(require('request'));

module.exports = function(username)
{
    return promisifiedRequest
        ('https://www.duolingo.com/users/' + username)
        .then(function(message) {
            var body = message[1];
            return JSON.parse(body);
    });
};