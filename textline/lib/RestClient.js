/**
 @module RestClient
 */

var Client = require('./Client'),
    Conversation = require('./models/Conversation'),
    Customer = require('./models/Customer'),
    Group = require('./models/Group'),
    Organization = require('./models/Organization'),
    Post = require('./models/Post'),
    User = require('./models/User'),
    util = require('util');


function RestClient() {
    RestClient.super_.apply(this, arguments);
};
util.inherits(RestClient, Client);


// API Requests
RestClient.prototype.login = function(email, password, callback) {
    var client,
        options;

    options = {form: {user: {email: email, password: password}}, full_endpoint: true};
    client = this;
    this.request("auth/sign_in", "POST", options, function(error, json) {
        if (json.access_token) {
            client.access_token = json.access_token.token;
        }
        client._handleRequest(callback)(error, json);
    });
};


/**
 @param {object} params - request parameters
 - @member {bool} include_users - boolean to return the agents of an organization or not
 */
RestClient.prototype.getOrganization = function(params, callback) {
    this.get("organization", params, this._handleRequest(callback));
};


/**** CONVERSATIONS ****/
/**
 @param {object} params - request parameters
 - @member {string} group_uuid - the uuid of the group from which you want to retrieve conversations (default: first group)
 - @member {int} page - the page of conversations you want to retrieve
 - @member {int} page_size - the number of conversations you want to retrieve (default: 30)
 - @member {string} query - a keyword to search on
 - @member {string} after_uuid - the uuid of a conversation to use as non inclusive lower bound of results
 */
RestClient.prototype.getConversations = function(params, callback) {
    this.get("conversations", params, this._handleRequest(callback));
};


/**
 @param {object} params - request parameters
 - @member {int} page - the page of posts you want to retrieve
 - @member {int} page_size - the number of posts you want to retrieve
 - @member {string} before_uuid - the uuid of a post to use as non inclusive upper bound of results
 - @member {string} after_uuid - the uuid of a post to use as non inclusive lower bound of results
 */
RestClient.prototype.getConversation = function(uuid, params, callback) {
    this.get("conversation/"+uuid, params, this._handleRequest(callback));
};


/**
 @param {object} params - request parameters
 - @member {string} group_uuid - the uuid of the group from which you want to retrieve conversations (default: first group)
 - @member {int} page - the page of posts you want to retrieve
 - @member {int} page_size - the number of posts you want to retrieve
 - @member {string} before_uuid - the uuid of a post to use as non inclusive upper bound of results
 - @member {string} after_uuid - the uuid of a post to use as non inclusive lower bound of results
 */
RestClient.prototype.getConversationByPhoneNumber = function(phone_number, params, callback) {
    params["phone_number"] = phone_number;
    this.get("conversations", params, this._handleRequest(callback));
};


/**
 @param {object} data - data for the post
 - @member {string} body - the body of your comment
 - @member {array} attachments - an array of objects, each with a "url" member
 */
RestClient.prototype.createConversation = function(phone_number, data, callback) {
    var params;

    params = this._setupContentPayload(data, 'comment');
    params.phone_number = phone_number;

    this.post("conversations", params, this._handleRequest(callback));
};


/**
 @param {object} data - request parameters
 - @member {string} body - the body of your comment
 - @member {array} attachments - an array of objects, each with a "url" member
 */
RestClient.prototype.sendMessage = function(uuid, data, callback) {
    var params;

    params = this._setupContentPayload(data, 'comment');

    this.post("conversation/"+uuid, params, this._handleRequest(callback));
};


/**
 @param {object} data - request parameters
 - @member {string} body - the body of your comment
 - @member {array} attachments - an array of objects, each with a "url" member
 */
RestClient.prototype.sendWhisper = function(uuid, data, callback) {
    var params;

    params = this._setupContentPayload(data, 'whisper');

    this.post("conversation/"+uuid, params, this._handleRequest(callback));
};


RestClient.prototype._setupContentPayload = function(data, comment_key) {
    var payload;

    payload = {};
    if (data.body && data.body.trim().length) {
        payload[comment_key] = {body: data.body.trim()};
    }
    if (data.attachments) {
        payload.attachments = data.attachments;
    }

    return payload;
};

RestClient.prototype.resolveConversation = function(uuid, callback) {
    this.post("conversation/"+uuid+"/resolve", this._handleRequest(callback));
};


RestClient.prototype.reopenConversation = function(uuid, callback) {
    this.delete("conversation/"+uuid+"/resolve", this._handleRequest(callback));
};


RestClient.prototype.transferConversation = function(conversation_uuid, user_uuid, callback) {
    this.post("conversation/"+conversation_uuid+"/transfer", {user_uuid: user_uuid}, this._handleRequest(callback));
};


/**** CUSTOMERS ****/
/**
 @param {object} params - request parameters
 - @member {int} page - the page of posts you want to retrieve
 - @member {int} page_size - the number of posts you want to retrieve
 - @member {string} query - a keyword to search on
 */
RestClient.prototype.getCustomers = function(params, callback) {
    this.get("customers", params, this._handleRequest(callback));
};


RestClient.prototype.getCustomerByPhoneNumber = function(phone_number, callback) {
    this.get("customers", {phone_number: phone_number}, this._handleRequest(callback));
};


RestClient.prototype.getCustomer = function(uuid, callback) {
    this.get("customer/"+uuid, this._handleRequest(callback));
};


RestClient.prototype.createCustomer = function(attrs, callback) {
    this.post("customers", {customer: attrs}, this._handleRequest(callback));
};


/**
 @param {object} updates - the updates to be applied to the customer
 - @member {string} name - the name of the customer (optional)
 - @member {string} notes - notes on the customer (optional)
 */
RestClient.prototype.updateCustomer = function(uuid, updates, callback) {
    this.put("customer/"+uuid, {customer: updates}, this._handleRequest(callback));
};


// UTILS
RestClient.prototype._handleRequest = function(callback) {
    var client;

    client = this;
    return function(error, json) {
        if (callback) {
            callback.call(client, error, client.parseJSON(json));
        }
    }
};


RestClient.prototype.parseJSON = function(json) {
    var conversation,
        customer,
        data,
        group,
        i,
        post,
        user;

    data = {};
    if (json.hasOwnProperty('conversations')) {
        data.conversations = [];
        for (i=0; conversation=json.conversations[i]; ++i) {
            data.conversations.push(new Conversation(conversation));
        };
    }

    if (json.hasOwnProperty('conversation')) {
        data.conversation = json.conversation ? new Conversation(json.conversation) : null;
    }

    if (json.hasOwnProperty('posts')) {
        data.posts = [];
        for (i=0; post=json.posts[i]; ++i) {
            data.posts.push(new Post(post));
        };
    }

    if (json.hasOwnProperty('customer')) {
        data.customer = json.customer ? new Customer(json.customer) : null;
    }

    if (json.hasOwnProperty('customers')) {
        data.customers = [];
        for (i=0; customer=json.customers[i]; ++i) {
            data.customers.push(new Customer(customer));
        }
    }

    if (json.hasOwnProperty('user')) {
        data.user = json.user ? new User(json.user) : null;
    }

    if (json.hasOwnProperty('users')) {
        data.users = [];
        for (i=0; user=json.users[i]; ++i) {
            data.users.push(new User(user));
        }
    }

    if (json.hasOwnProperty('organization')) {
        data.organization = new Organization(json.organization);
    }

    if (json.hasOwnProperty('groups')) {
        data.groups = [];
        for (i=0; group=json.groups[i]; ++i) {
            data.groups.push(new Group(group));
        }
    }

    if (json.hasOwnProperty('access_token')) {
        data.access_token = json.access_token;
    }

    return data;
};

module.exports = RestClient;
