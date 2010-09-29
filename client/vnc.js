var VNCClient = function(socket) {
	var client = {};
	var rfb = RFB({socket: socket, password: 'p@55w0rd', always: 3.3, client: client});
	
	client.onServerInit = function(name, width, height, pixelFormat) {
				
	}
			
			
	socket.onmessage = function(event) {
		rfb.receive(event.data);
	}
	
	return function() {				
	}		
};
