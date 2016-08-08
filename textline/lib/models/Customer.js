/**
    @module Customer
*/

function Customer(data) {
    this.name = data.name;
    this.notes = data.notes;
    this.phone_number = data.phone_number;
    this.reachable_by_sms = data.reachable_by_sms;
    this.uuid = data.uuid;
};


module.exports = Customer;
