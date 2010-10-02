require.paths.unshift('../lib', '../lib/server');
var sys = require('sys'), vnc = require('vnc.js');
var vows = require('vows'), assert = require('assert');

function message(string) {
	var buffer = new Buffer(string.length);
	for (var i = 0; i < string.length; i++) buffer[i] = string.charCodeAt(i);
	return buffer;
}

function afterHandshake() {
	var client = vnc.createClient(), received;
	client.receive(message('RFB 003.008\n'));
	client.receive(message('\01\01'));
	client.receive(message('\0\0\0\0'));
	client.receive(message('\5\240\3\204\40\40\0\1\0\377\0\377\0\377\20\10\0\0\0\0\0\0\0\30\126\151\156\143\145\156\164\40\130\165\47\163\40\115\141\143\102\157\157\153\40\120\162\157'));
	return client
}

vows.describe('Handshake').addBatch({
	'protocol version': function() {
		var client = vnc.createClient(), received;
		client.on('protocolVersion', function(message) { received = message;});
		client.receive(message('RFB 003.008\n'));
		assert.equal(received.toString(), "RFB 003.008\n");
	},
	'should receive security after protocol version' : function() {
		var client = vnc.createClient(), received;
		client.on('security', function(message) { received = message;});
		client.receive(message('RFB 003.008\n'));
		client.receive(message('\01\01'));
		assert.equal(received.toString(), '\01\01');
	},
	'should receive security result after security' : function() {
		var client = vnc.createClient(), received;
		client.on('securityResult', function(message) { received = message;});
		client.receive(message('RFB 003.008\n'));
		client.receive(message('\01\01'));
		client.receive(message('\0\0\0\0'));
		assert.equal(received.toString(), '\0\0\0\0');
	},
	'should receive and parse server init after security' : function() {
		var client = vnc.createClient(), received;
		client.on('serverInit', function(message) { received = message;});
		client.receive(message('RFB 003.008\n'));
		client.receive(message('\01\01'));
		client.receive(message('\0\0\0\0'));
		client.receive(message('\5\240\3\204\40\40\0\1\0\377\0\377\0\377\20\10\0\0\0\0\0\0\0\30\126\151\156\143\145\156\164\40\130\165\47\163\40\115\141\143\102\157\157\153\40\120\162\157'));
		assert.equal(received.toString(),message('\5\240\3\204\40\40\0\1\0\377\0\377\0\377\20\10\0\0\0\0\0\0\0\30\126\151\156\143\145\156\164\40\130\165\47\163\40\115\141\143\102\157\157\153\40\120\162\157').toString());
		assert.equal(client._server.width, 1440);
		assert.equal(client._server.height, 900);
		assert.equal(client._server.pixelFormat.bitsPerPixel, 32);
		assert.equal(client._server.pixelFormat.depth,        32);
		assert.equal(client._server.pixelFormat.bigEndian, false);
		assert.equal(client._server.pixelFormat.trueColor,  true);
		assert.equal(client._server.pixelFormat.redMax,      255);
		assert.equal(client._server.pixelFormat.greenMax,    255);
		assert.equal(client._server.pixelFormat.blueMax,     255);
		assert.equal(client._server.pixelFormat.redShift,     16);
		assert.equal(client._server.pixelFormat.greenShift,    8);
		assert.equal(client._server.pixelFormat.blueShift,     0);
	}
}).run();

vows.describe('Framebuffer Update').addBatch({
	'should handle framebuffer update' : function() {
		var client = afterHandshake(), _x, _y, _width, _height, _pixels;
		client.on('rawEncoding', function(x, y, width, height, pixels) {
			_x = x; _y = y; _width = width; _height = height; _pixels = pixels;						
		});
		client.receive(message('\0\0\0\1\0\0\0\0\0\2\0\2\0\0\0\0'));
		client.receive(message('\1\1\1\1\1\1\1\1'));
		client.receive(message('\1\1\1\1\1\1\1\1'));
		assert.equal(_x, 0);
		assert.equal(_y, 0);
		assert.equal(_width, 2);
		assert.equal(_height, 2);
		assert.equal(_pixels.length, 16);
		assert.equal(_pixels.toString(), '\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1');
	},
	'should handle multi framebuffer updates' : function() {
		var client = afterHandshake(), _x, _y, _width, _height, _pixels;
		client.on('rawEncoding', function(x, y, width, height, pixels) {
			_x = x; _y = y; _width = width; _height = height; _pixels = pixels;						
		});
		client.receive(message('\0\0\0\1\0\0\0\0\0\2\0\2\0\0\0\0'));
		client.receive(message('\1\1\1\1\1\1\1\1'));
		client.receive(message('\1\1\1\1\1\1\1\1'));
		client.receive(message('\0\0\0\1\0\0\0\0\0\2\0\2\0\0\0\0'));
		client.receive(message('\2\2\2\2\2\2\2\2'));
		client.receive(message('\2\2\2\2\2\2\2\2'));		
		assert.equal(_x, 0);
		assert.equal(_y, 0);
		assert.equal(_width, 2);
		assert.equal(_height, 2);
		assert.equal(_pixels.length, 16);
		assert.equal(_pixels.toString(), '\2\2\2\2\2\2\2\2\2\2\2\2\2\2\2\2');
	}	
}).run();


