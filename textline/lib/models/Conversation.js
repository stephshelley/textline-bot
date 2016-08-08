/**
    @module Conversation
*/

var Customer = require('./Customer');


function Conversation(data) {
    this.customer = new Customer(data.customer);
    this.resolved = data.resolved;
    this.uuid = data.uuid;
};


module.exports = Conversation;
