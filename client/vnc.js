var VNCClient = function(socket) {
	var protocol = RFB({socket: socket, password: 'p@55w0rd', always: 3.3});
			
	socket.onmessage = function(event) {
		protocol.receive(event.data);
	}
	return function() {				
	}		
};
