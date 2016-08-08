
const TEXTLINE_ACCESS_TOKEN = "yMC1nh7c5JBVukMjxxAG";

var TextLineBot = require('./TextlineBot.js');
var builder = require('botbuilder');
var bot = new TextLineBot({
    accessToken: TEXTLINE_ACCESS_TOKEN
});
bot.listen();


bot.use(function (session, next ) {
    session.userData.phone = session.message.from.address;
    next();
});


bot.add('/', [
    function (session) {

        var phone = session.userData.phone;
        var text = session.message.text.toLowerCase();

        builder.Prompts.text(session, "Hello... What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.choice(session, "Hi " + results.response + ", what language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]); 
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("Got it, " + session.userData.name + 
            ". You code in " + session.userData.language + ".");
    }
]);



module.exports = {

    handleIncomingMessage: function(phone, text) {

        console.log(`${phone}:    ${text}`);
        // Format the message for use with the bot.
        var message = { text: text || ''};
        message.from = {
            channelId: 'textline',
            address: phone
        }

        message.to = {
            channelId: 'textline',
            address: 'bot',
        }

        // Process the message through the bot.
        bot.processMessage(message);
    }

}