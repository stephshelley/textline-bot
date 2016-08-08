/**
 @module Client
 */

var module_info = require('../package.json');
q = require('q'),
    query_string = require('querystring');
request = require('request');

var default_host = 'application.textline.com';


function Client(config) {
    if (!config.api_key && !config.access_token ) {
        throw "Client requires an api key or access token";
    }

    this.api_key = config.api_key ? config.api_key.replace(/\s/, '') : null;
    this.access_token = config.access_token ? config.access_token.replace(/\s/, '') : null;

    this.timeout = config.timeout || 31000;

    this.base_uri = config.api_root || "https://" + default_host;
};


Client.prototype.request = function(endpoint, method, options, callback) {
    options.method = method;
    if (!options.full_endpoint) {
        endpoint = 'api/' + endpoint;
    }
    delete options.full_endpoint;

    options.uri = this.base_uri + '/' + endpoint + '.json';
    options.headers = {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': 'textline-node/' + module_info.version,
    };
    if (this.access_token) {
        options.headers['X-TGP-ACCESS-TOKEN'] = this.access_token;
    }
    if (this.api_key) {
        options.headers['X-TGP-API-KEY'] = this.api_key;
    }

    options.timeout = this.timeout;

    request(options, function(err, response, body) {
        var e,
            error,
            error_msg,
            json;

        if (err) {
            error = err;
        } else {
            if (response) {
                if (response.statusCode == 404) {
                    error_msg = 'Invalid endpoint "' + options.uri + "'";
                } else if (response.statusCode == 401) {
                    error_msg ='Unauthorized access';
                } else if (response.statusCode == 400) {
                    error_msg = "Invalid request";
                } else if (response.stausCode == 500) {
                    error_msg = 'Server Error';
                }
            }

            try {
                json = JSON.parse(body);
                if (json.error) {
                    if (typeof(json.error) == '') {
                        error_msg = json.error;
                    } else {
                        json.errors = json.error;
                    }
                }

                if (json.errors) {
                    for (e in json.errors) {
                        if (json.errors.hasOwnProperty(e)) {
                            error_msg =  "Invalid request: " + e + " - " + json.errors[e][0];
                        }
                    }
                }
            } catch(e) {
                error_msg = (e.message || 'Invalid JSON body');
            }
        }


        if (callback) {
            if (!error) {
                error = error_msg ? new Error(error_msg) : null;
            }
            callback.call(this, error, json || {});
        }
    });

};


Client.prototype.get = function(endpoint, params, callback) {
    var args,
        options;

    args = this._requestArgs(arguments);
    params = args.params || {};
    options = {qs: params};
    this.request(endpoint, "GET", options, args.callback);
};


Client.prototype.delete = function(endpoint, params, callback) {
    var args,
        options;

    args = this._requestArgs(arguments);
    params = args.params || {};
    options = {qs: params};
    this.request(endpoint, "DELETE", options, args.callback);
};


Client.prototype.post = function(endpoint) {
    var args,
        options;

    args = this._requestArgs(arguments);
    params = args.params || {};
    options = {form: params};
    this.request(endpoint, "POST", options, args.callback);
};


Client.prototype.put = function(endpoint) {
    var args,
        options;

    args = this._requestArgs(arguments);
    params = args.params || {};
    options = {form: params};
    this.request(endpoint, "PUT", options, args.callback);
};


Client.prototype._requestArgs = function(args) {
    var callback,
        params;

    args = Array.prototype.slice.call(args);
    if (args[1]) {
        if (typeof(args[1]) == 'function') {
            callback = args[1];
        } else {
            params = args[1];
            if (args[2]) {
                callback = args[2];
            }
        }
    } else if (args[2]) {
        callback = args[2];
    }

    return {params: params, callback: callback};
};


module.exports = Client;
