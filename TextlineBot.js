"use strict";

var client; // Will be set in bot contructor

/**
I can't remeber exactly my thought process, but to create this modified the basic TextBot that comes with microsoft's framework, which is a basic command line bot.
You can see the only really relevant method is the listen() method which uses textline to send outgoing messages.
**/

const botframework = require('botbuilder');
const readline = require('readline');
const uuid = require('node-uuid')

class TextlineBot extends botframework.DialogCollection {
    constructor(options) {
        super();
        this.options = {
            maxSessionAge: 14400000,
            defaultDialogId: '/',
            minSendDelay: 1000
        };

        // Set up textline with the proper access token.
        if(options.accessToken) {
            client = require('textline')({access_token: options.accessToken});
        } else {
            console.error(new Error("You must provide a textline access token."));
        }
        this.configure(options);
    }

    dispatchMessage(userId, message, callback, dialogId, dialogArgs, newSessionState) {
        var _this = this;
        if (newSessionState === void 0) { newSessionState = false; }
        var ses = new botframework.Session({
            localizer: this.options.localizer,
            minSendDelay: this.options.minSendDelay,
            dialogs: this,
            dialogId: dialogId,
            dialogArgs: dialogArgs
        });
        ses.on('send', function (reply) {
            _this.saveData(userId, ses.userData, ses.sessionState, function () {
                if (reply && reply.text) {
                    if (callback) {
                        callback(null, reply);
                        callback = null;
                    }
                    else if (message.id || message.conversationId) {
                        reply.from = message.to;
                        reply.to = message.from;
                        reply.conversationId = message.conversationId;
                        reply.language = message.language;
                        _this.emit('reply', reply);
                    }
                    else {
                        _this.emit('send', reply);
                    }
                }
            });
        });
        ses.on('error', function (err) {
            if (callback) {
                callback(err, null);
                callback = null;
            }
            else {
                _this.emit('error', err, message);
            }
        });
        ses.on('quit', function () {
            _this.emit('quit', message);
        });
        this.getData(userId, function (err, userData, sessionState) {
            if (!err) {
                ses.userData = userData || {};
                ses.dispatch(newSessionState ? null : sessionState, message);
            }
            else {
                _this.emit('error', err, message);
            }
        });
    };


    /**
     * Specific listener for this bot.
     */
    listen() {
        var _this = this;

        function onMessage(message, args) {
            console.log(`BOT:   ${message.to.address} - ${message.text}`);

            client.createConversation(
                message.to.address,
                {body: message.text}
            );

            // I add a slight pause to make sure the texts go out in the correct order.
            pause(3000);

        }
        this.on('reply', onMessage);
        this.on('send', onMessage);
        this.on('quit', function () {
        });


        function pause(milliseconds) {
            var dt = new Date();
            while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
        }
    }
}


TextlineBot.prototype.configure = function (options) {
    if (options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                this.options[key] = options[key];
            }
        }
    }
};
TextlineBot.prototype.beginDialog = function (address, dialogId, dialogArgs) {
    if (!this.hasDialog(dialogId)) {
        throw new Error('Invalid dialog passed to TextBot.beginDialog().');
    }
    var message = address || {};
    var userId = message.to ? message.to.address : 'user';
    this.dispatchMessage(userId, message, null, dialogId, dialogArgs, true);
};
TextlineBot.prototype.processMessage = function (message, callback) {
    this.emit('message', message);
    if (!message.id) {
        message.id = uuid.v1();
    }
    if (!message.from) {
        message.from = { channelId: 'text', address: 'user' };
    }
    this.dispatchMessage(message.from.address, message, callback, this.options.defaultDialogId, this.options.defaultDialogArgs);
};



TextlineBot.prototype.getData = function (userId, callback) {
    var _this = this;
    if (!this.options.userStore) {
        this.options.userStore = new botframework.MemoryStorage();
    }
    if (!this.options.sessionStore) {
        this.options.sessionStore = new botframework.MemoryStorage();
    }
    var ops = 2;
    var userData, sessionState;
    this.options.userStore.get(userId, function (err, data) {
        if (!err) {
            userData = data;
            if (--ops == 0) {
                callback(null, userData, sessionState);
            }
        }
        else {
            callback(err, null, null);
        }
    });
    this.options.sessionStore.get(userId, function (err, data) {
        if (!err) {
            if (data && (new Date().getTime() - data.lastAccess) < _this.options.maxSessionAge) {
                sessionState = data;
            }
            if (--ops == 0) {
                callback(null, userData, sessionState);
            }
        }
        else {
            callback(err, null, null);
        }
    });
};

TextlineBot.prototype.saveData = function (userId, userData, sessionState, callback) {
    var ops = 2;
    function onComplete(err) {
        if (!err) {
            if (--ops == 0) {
                callback(null);
            }
        }
        else {
            callback(err);
        }
    }
    this.options.userStore.save(userId, userData, onComplete);
    this.options.sessionStore.save(userId, sessionState, onComplete);
};

module.exports = TextlineBot;