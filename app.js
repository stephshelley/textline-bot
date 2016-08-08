const restify = require('restify');
const Bot = require('./bot.js');

// Setup Restify Server
var server = restify.createServer();
server.use(restify.bodyParser());

/**
* An endpoint for the textline webhook.
**/
server.post('/bot', function (req, res, next) {

	res.send(201, {message: "Yay textline!"});

        if(req.body && req.body.post) {

            var data = req.body.post;
            var number = data.creator.phone_number.replace(/\D/g,'');
            var message = data.body;

            Bot.handleIncomingMessage(number, message);

        }

});

server.listen(process.env.port || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});