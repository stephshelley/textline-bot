var RestClient = require('./lib/RestClient');


function initializer(config) {
    return new RestClient(config);
}

module.exports = initializer;
