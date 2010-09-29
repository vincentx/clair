var sys = require("sys"), ws = require('websocket-server'), net = require('net'), url = require('url');
var server = ws.createServer();

server.addListener('connection', function(connection) {
  var request = url.parse(connection._req.url, true);
  var socket = net.createConnection(request.query.port, request.query.host);
  socket.setEncoding('base64');
  socket.addListener('data', function(data) {
	connection.send(data);
  });
  connection.addListener('message', function(message) {
	var bytes = new Buffer(message.length);
	for (var i = 0; i < message.length ; i++) bytes[i] = message.charCodeAt(i);	
	socket.write(bytes);
  });
  connection.addListener('close', function() {
	// socket.close();	
  });
}).listen(8000);