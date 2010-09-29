var VNCClient = function(socket, canvas) {
	var client = {}, context = null;
	var rfb = RFB({socket: socket, password: 'p@55w0rd', always: 3.3, client: client});	
	
	client.onServerInit = function(name, width, height, pixelFormat) {
		canvas.width = width; canvas.height = height; context = canvas.getContext("2d");
		rfb.protocol.framebufferUpdateRequest(false, 0, 0, width, height);

	};
		
	client.createRectangle = function(width, height) {
		return context.createImageData(width, height);
	}
	
	client.onRectangle = function(x, y, rectangle) {
		context.putImageData(rectangle, x, y);
	}
			
	socket.onmessage = function(event) {
		rfb.receive(event.data);
	}
	
	return function() {				
	}		
};
