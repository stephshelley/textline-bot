var api_key = 'api_key',
    user_email = 'me@email.com',
    password = 'password';

var client = require('../')({api_key: api_key});
client.login(user_email, password, function(error, data) {
    client.getOrganization({include_users: true, include_groups: true}, function(error, data) {
        var group;
        group = data.groups[1];
        client.getConversations({group_uuid: group.uuid}, function(error, data) {
            //client.sendMessage(data.conversation.uuid, {body: "hello post"});
            //client.sendWhisper(data.conversation.uuid, {body: "hello whisper"});
            //client.updateCustomer(data.conversation.customer.uuid, {name: "Bob"});
            //client.resolveConversation(data.conversation.uuid);
            //client.reopenConversation(data.conversation.uuid);
            //client.transferConversation(data.conversation.uuid, "4ae29614-0669-4f80-9dc3-3e481c69f001");
            //
            //client.getCustomer(data.conversation.customer.uuid, function(error, data) { console.log(data); });
            //client.getCustomers({query: 'mark'}, function(error, data) { console.log(data); });
            //client.createCustomer({name: "Bruce Wayne", phone_number: "949 555 5555"});
            //client.createConversation("9495007529", {body: "hello new comment"});
        });
    });
});


