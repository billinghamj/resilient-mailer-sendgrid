var http = require('http');
var https = require('https');
var FormData = require('form-data');

module.exports = SendgridProvider;

/**
 * Creates an instance of the SendGrid email provider.
 *
 * @constructor
 * @this {SendgridProvider}
 * @param {string} apiUser API user for the SendGrid account.
 * @param {string} apiKey API key for the SendGrid account.
 * @param {object} [options] Additional optional configuration.
 * @param {boolean} [options.apiSecure=true] API connection protocol - true = HTTPS, false = HTTP
 * @param {string} [options.apiHostname=api.sendgrid.com] Hostname for the API connection
 * @param {number} [options.apiPort] Port for the API connection - defaults to match the protocol (HTTPS-443, HTTP-80)
 */
function SendgridProvider(apiUser, apiKey, options) {
	if (typeof apiUser !== 'string'
		|| typeof apiKey !== 'string') {
		throw new Error('Invalid parameters');
	}

	options = options || {};
	options.apiSecure = options.apiSecure || true;
	options.apiHostname = options.apiHostname || 'api.sendgrid.com';
	options.apiPort = options.apiPort || (options.apiSecure ? 443 : 80);

	this.apiUser = apiUser;
	this.apiKey = apiKey;
	this.options = options;
}

/**
 * Indicates the outcome of a mail-sending attempt.
 * @callback SendgridProvider~onResult
 * @param {error} [error] A non-null value indicates failure.
 */

/**
 * Attempts to send the message through the SendGrid API.
 *
 * @this {SendgridProvider}
 * @param {Message} message The message to send.
 * @param {SendgridProvider~onResult} [callback] Notified when the attempt fails or succeeds.
 */
SendgridProvider.prototype.mail = function (message, callback) {
	var form;

	// this can fail if the message is invalid
	try {
		form = this._formForMessage(message);
	} catch (error) {
		if (callback)
			callback(error);

		return;
	}

	var options = {
		hostname: this.options.apiHostname,
		port: this.options.apiPort,
		path: '/api/mail.send.json',
		method: 'POST',
		headers: form.getHeaders()
	};

	var protocol = this.options.apiSecure ? https : http;

	var request = protocol.request(options);

	form.pipe(request);
	request.end();

	// if no callback, the outcome doesn't matter
	if (!callback)
		return;

	request.on('error', function (error) {
		callback(error);
	});

	request.on('response', function (response) {
		if (response.statusCode == 200) {
			callback();
			return;
		}

		var body = '';

		response.on('data', function (chunk) {
			body += chunk;
		});

		response.on('end', function (chunk) {
			var error = new Error('Email could not be sent');

			error.httpStatusCode = response.statusCode;
			error.httpResponseData = body;

			callback(error);
		});
	});
}

SendgridProvider.prototype._formForMessage = function (message) {
	message = message || {};
	message.to = message.to || [];
	message.cc = message.cc || [];
	message.bcc = message.bcc || [];

	// sendgrid will return a 400 error if these are missing
	if (!message.from.length
		|| !message.to.length
		|| !message.subject
		|| (!message.textBody && !message.htmlBody)) {
		throw new Error('Invalid parameters');
	}

	var form = new FormData();

	form.append('api_user', this.apiUser);
	form.append('api_key', this.apiKey);
	form.append('from', message.from);
	form.append('to', message.to.join(','));
	form.append('subject', message.subject);

	if (message.replyto)
		form.append('replyto', message.replyto);

	if (message.cc.length)
		form.append('cc', message.cc.join(','));

	if (message.bcc.length)
		form.append('bcc', message.bcc.join(','));

	if (message.textBody)
		form.append('text', message.textBody);

	if (message.htmlBody)
		form.append('html', message.htmlBody);

	// todo: attachment support

	return form;
}
