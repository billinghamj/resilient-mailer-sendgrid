var test = require('tape');
var http = require('http');
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
