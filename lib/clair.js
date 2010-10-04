require.paths.unshift('./clair');
var sys = require('sys'), net = require('net'), url = require('url'), ws = require('websocket-server'), Jpeg = require('jpeg').Jpeg;
var vnc = require('vnc.js'), fs  = require('fs');

Buffer.prototype.pack = function(offset, number, bits) { for (var i = 0; i < bits; i++) this[offset + i] = (number >> ((bits - i - 1) * 8)) & 0xFF; return this;}

var server = ws.createServer();

server.addListener('connection', function(connection) {
  var forwardToClient = function(message) { connection.send(message.toString('base64')); }

  var request = url.parse(connection._req.url, true);
  var socket = net.createConnection(request.query.port, request.query.host);

  var client = vnc.createClient(), forwardEvents = ['protocolVersion', 'security', 'securityResult', 'serverInit', 'serverToClient'];

  for (var i = 0; i < forwardEvents.length; i++) client.on(forwardEvents[i], forwardToClient);

  client.on('rawEncoding', function(x, y, width, height, pixels) {
	var jpg = new Jpeg(pixels, width, height, "bgra");
	jpg.encode(function(image) {
		var data = image.toString('base64');
		var message = new Buffer(1 + 1 + 2 + 2 + 2 + 2 + 2 + 4 + 8 + 23 + data.length);
		message.write('\0\0\0\1');
		message.pack(4, x, 2).pack(6, y, 2).pack(8, width, 2).pack(10, height, 2).pack(12, 8051, 4).pack(16, data.length + 23, 8).write("data:image/jpeg;base64,", 24);
		message.write(data, 47);
		connection.send(message.toString('base64'));
	});
  });

  socket.addListener('data', function(data) { client.receive(data);});

  connection.addListener('message', function(message) { socket.write(client.send(message));});
  connection.addListener('close', function() { socket.destroy(); });
}).listen(8000);
