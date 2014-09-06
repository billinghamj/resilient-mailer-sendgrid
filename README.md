# resilient-mailer-sendgrid

`resilient-mailer-sendgrid` implements SendGrid as an email provider for
[`resilient-mailer`](https://github.com/billinghamj/resilient-mailer).

[![NPM Version](https://img.shields.io/npm/v/resilient-mailer-sendgrid.svg?style=flat)](https://www.npmjs.org/package/resilient-mailer-sendgrid)
[![Build Status](https://img.shields.io/travis/billinghamj/resilient-mailer-sendgrid.svg?style=flat)](https://travis-ci.org/billinghamj/resilient-mailer-sendgrid)
[![Coverage Status](https://img.shields.io/coveralls/billinghamj/resilient-mailer-sendgrid.svg?style=flat)](https://coveralls.io/r/billinghamj/resilient-mailer-sendgrid)

```js
var SendgridProvider = require('resilient-mailer-sendgrid');

var sendgrid = new SendgridProvider('MyApiUser', 'MyApiKey');

var mailer; // ResilientMailer instance
mailer.registerProvider(sendgrid);
```

## Installation

```bash
$ npm install resilient-mailer-sendgrid
```

## Usage

Create an instance of the provider. There are also a number of options you can
alter:

```js
var SendgridProvider = require('resilient-mailer-sendgrid');

var options = {
	apiSecure: false,         // allows the use of HTTP rather than HTTPS
	apiHostname: '127.0.0.1', // allows alternative hostname
	apiPort: 8080             // allows unusual ports
};

var sendgrid = new SendgridProvider('MyApiUser', 'MyApiKey', options);
```

To register the provider with your `ResilientMailer` instance:

```js
var mailer; // ResilientMailer instance
mailer.registerProvider(sendgrid);
```

In the event that you want to use `SendgridProvider` directly (rather than the
usual way - via `ResilientMailer`):

```js
var message = {
	from: 'no-reply@example.com',
	to: ['user@example.net'],
	subject: 'Testing my new email provider',
	textBody: 'Seems to be working!',
	htmlBody: '<p>Seems to be working!</p>'
};

sendgrid.send(message, function (error) {
	if (!error)
		console.log('Success! The message sent successfully.');

	else
		console.log('Message sending failed - ' + error.message);
});
```

To see everything available in the `message` object, refer to
[resilient-mailer](https://github.com/billinghamj/resilient-mailer).

## Notes

One instance of the provider covers one domain. To send from multiple domains,
you should set up multiple `ResilientMailer` instances, with multiple matching
provider instances.

## Testing

Install the development dependencies first:

```bash
$ npm install
```

Then the tests:

```bash
$ npm test
```

## Support

Please open an issue on this repository.

## Authors

- James Billingham <james@jamesbillingham.com>

## License

MIT licensed - see [LICENSE](LICENSE) file
