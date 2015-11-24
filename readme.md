# slackchangelog

A tiny express.js/mongodb application that integrates with slack's [slash-commands](https://api.slack.com/slash-commands) to have a nice company internal changelog of your product.

## Tests
```
npm i -g mocha
mocha

// if mocha gives timeouts because your mongodb is to slow,
// increase timeout threshold for it by setting
mocha --timeout 5000
```

## Run it
```
npm install
node app
```

## Installation
Make sure you have node.js installed.

1. `git clone git@github.com:TimDaub/slackchangelog.git`
2. `npm install`
3. `mv config_example.json config.json`
4. `node app.js`

(Right now, we're simply using a mongolabs server. Later simple SaaS integrations (most certainly heroku) will be added)

## Contributions
I'd absolute love to see contributions from other people. If you want to participate just submit pull-requests.
If you have questions, you can hit me up on Twitter ([@TimDaub](https://twitter.com/TimDaub))
