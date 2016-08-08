/**
    @module User
*/

function User(data) {
    this.name = data.name;
    this.on_call = data.on_call;
    this.uuid = data.uuid;
};


module.exports = User;
