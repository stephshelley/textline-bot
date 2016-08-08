/**
    @module Post
*/

var Attachment = require('./Attachment'),
    Customer = require('./Customer'),
    User = require('./User');


function Post(data) {
    var attachment,
        i;

    this.body = data.body;
    this.created_at = data.created_at;
    this.is_whisper = data.is_whisper;
    this.uuid = data.uuid;

    this.marked_as_resolved = data.marked_as_resolved;
    this.reopened = data.reopened;
    if (data.transferred_to) {
        this.transferred_to = new User(this.transferred_to);
    } else {
        this.transferred_to = null;
    }

    this.failed_to_send = data.failed_to_send;
    this.failed_to_send_reason = data.failed_to_send_reason;

    this.creator = null;
    if (data.creator.type == 'customer') {
        this.creator = new Customer(data.creator);
    } else if (data.creator.type == 'user') {
        this.creator = new User(data.creator);
    }

    this.attachments = [];
    for (i=0; attachment=data.attachments[i]; ++i) {
        this.attachments.push(new Attachment(attachment));
    }
};


module.exports = Post;
