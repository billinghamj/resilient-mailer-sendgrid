var test = require('tape');
var http = require('http');
var multiparty = require('multiparty');
var SendgridProvider = require('../lib/sendgrid-provider');

test('correct types exported', function (t) {
	t.equal(typeof SendgridProvider, 'function');
	t.equal(typeof SendgridProvider.prototype.mail, 'function');

	t.end();
});

test('correct types after initialization', function (t) {
	var provider = new SendgridProvider('api-user', 'api-key');

	t.assert(provider instanceof SendgridProvider);
	t.equal(typeof provider.mail, 'function');

	t.end();
});

test('invalid initialization causes exception', function (t) {
	t.throws(function () { new SendgridProvider(); });
	t.throws(function () { new SendgridProvider(0); });
	t.throws(function () { new SendgridProvider({}); });
	t.throws(function () { new SendgridProvider([]); });

	t.end();
});

test('empty options doesn\'t cause exception', function (t) {
	t.doesNotThrow(function () { new SendgridProvider('api-user', 'api-key', {}); });

	t.end();
});

test('invalid message returns error', function (t) {
	var provider = new SendgridProvider('api-user', 'api-key');

	t.plan(3);

	provider.mail(null, function (error) { t.notEqual(typeof error, 'undefined'); });
	provider.mail({}, function (error) { t.notEqual(typeof error, 'undefined'); });
	provider.mail({to:['']}, function (error) { t.notEqual(typeof error, 'undefined'); });
});

test('api used correctly when successful', function (t) {
	var apiUser = 'CuKLNA-awa4skvmqOWTHtCF'; // arbitrary
	var apiKey = 'CuKLNA-awa4skvmqOWTHtCF'; // arbitrary

	var message = {
		from: 'no-reply@example.com',
		to: ['user@example.net', 'user@example.org'],
		cc: ['user2@example.net'],
		bcc: ['user3@example.net'],
		replyto: 'info@example.com',
		subject: 'testing, 123...',
		textBody: 'please disregard',
		htmlBody: '<p>please disregard</p>'
	};

	var expectedObject = {
		'api_key': ['CuKLNA-awa4skvmqOWTHtCF'],
		'api_user': ['CuKLNA-awa4skvmqOWTHtCF'],
		'bcc': ['user3@example.net'],
		'cc': ['user2@example.net'],
		'from': ['no-reply@example.com'],
		'html': ['<p>please disregard</p>'],
		'replyto': ['info@example.com'],
		'subject': ['testing, 123...'],
		'text': ['please disregard'],
		'to': ['user@example.net,user@example.org']
	};

	t.plan(4);

	var server = setupTestServer(t,
		function (request, response) {
			var form = new multiparty.Form();

			form.parse(request, function (err, fields, files) {
				t.deepEquals(fields, expectedObject);
			});

			response.writeHead(200);
			response.end();
		},

		function (addr) {
			var options = {
				apiSecure: false,
				apiHostname: addr.address,
				apiPort: addr.port,
				testMode: true
			};

			var provider = new SendgridProvider(apiUser, apiKey, options);

			provider.mail(message, function (error) {
				t.equal(typeof error, 'undefined');

				server.close();
			});
		});
});

test('handles api errors correctly', function (t) {
	var message = {
		from: 'no-reply@example.com',
		to: ['user@example.net', 'user@example.org'],
		cc: ['user2@example.net'],
		bcc: ['user3@example.net'],
		replyto: 'info@example.com',
		subject: 'testing, 123...',
		textBody: 'please disregard',
		htmlBody: '<p>please disregard</p>'
	};

	t.plan(4);

	var server = setupTestServer(t,
		function (request, response) {
			var error = JSON.stringify({ message: 'error', 'errors': ['asdf'] });

			response.writeHead(503, { 'Content-Length': error.length });
			response.write(error);
			response.end();
		},

		function (addr) {
			var options = {
				apiSecure: false,
				apiHostname: addr.address,
				apiPort: addr.port
			};

			var provider = new SendgridProvider('user', 'key', options);

			provider.mail(message, function (error) {
				t.notEqual(typeof error, 'undefined');
				t.equal(error.httpStatusCode, 503);

				server.close();
			});
		});
});

test('check lack of callback', function (t) {
	var message = {
		from: 'no-reply@example.com',
		to: ['user@example.net', 'user@example.org'],
		cc: ['user2@example.net'],
		bcc: ['user3@example.net'],
		replyto: 'info@example.com',
		subject: 'testing, 123...',
		textBody: 'please disregard',
		htmlBody: '<p>please disregard</p>'
	};

	t.plan(2);

	var server = setupTestServer(t,
		function (request, response) {
			var error = JSON.stringify({ message: 'error', 'errors': ['asdf'] });

			response.writeHead(503, { 'Content-Length': error.length });
			response.write(error);
			response.end();

			server.close();
		},

		function (addr) {
			var options = {
				apiSecure: false,
				apiHostname: addr.address,
				apiPort: addr.port
			};

			var provider = new SendgridProvider('user', 'key', options);

			provider.mail(message);
		});
});

// will generate 2 assertions
function setupTestServer(t, handler, callback) {
	var server = http.createServer(function (request, response) {
		t.equal(request.method, 'POST');
		t.equal(request.url, '/api/mail.send.json');

		handler(request, response);
	});

	server.listen(function () {
		var addr = server.address();

		callback(addr);
	});

	return server;
}
