/**
    @module Attachment
*/

function Attachment(data) {
    this.content_type = data.content_type;
    this.name = data.name;
    this.url = data.url;
};


module.exports = Attachment;
