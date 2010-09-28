var net = require('net'), sys = require('sys');
net.createServer(function (socket) {
  socket.setEncoding("utf8");
  socket.write("Echo server\r\n");
  socket.on("data", function (data) {
	sys.log('recived data' + data);		
    socket.write(data);
  });
  socket.on("end", function () {
	sys.log('socket closed');
    socket.end();
  });
}).listen(8124);