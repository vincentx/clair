require.paths.unshift('./clair');
var sys = require('sys'), net = require('net'), url = require('url'), ws = require('websocket-server'), Jpeg = require('jpeg').Jpeg;
var vnc = require('vnc.js');

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
				
	});
  });

  socket.addListener('data', function(data) { client.receive(data);});

  connection.addListener('message', function(message) { socket.write(client.send(message));});
  connection.addListener('close', function() { socket.destroy(); });
}).listen(8000);
