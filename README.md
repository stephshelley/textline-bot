# textline-bot
A simple bot that runs on top of Textline.


### Requirements:
- A Textline account + valid access Token (http://textline.com/)
- Node.js, npm
- Knowledge of Microsoft's Bot Framework v1.0 (http://docs-v1.botframework.com/)
- Localtunnel (install for testing) (http://localtunnel.me/)


### Setup:
1. Run `npm install`
2. Open bot.js and replace the access_token with your account's access token.
3. Run `node app.js`, which will run the bot on default port 3978
4. Run localtunnel on the port `lt --port 3978`
5. Copy/paste the url, and set **[[YOUR-URL]]/bot** as your Textline webhook.
6. Text your textline #!
