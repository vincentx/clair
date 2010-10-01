var VNCClient = function(socket, canvas) {
	var client = {}, context = null;
	var rfb = RFB({socket: socket, password: '3mapw9$n', always: 3.3, client: client});	
	
	client.onServerInit = function(name, width, height, pixelFormat) {
		canvas.width = width; canvas.height = height; context = canvas.getContext("2d");
		rfb.protocol.setEncodings();
		rfb.protocol.framebufferUpdateRequest(false, 0, 0, width, height);
		
		var flush = function() {
			rfb.protocol.framebufferUpdateRequest(true, 0, 0, width, height);
			setTimeout(flush, 5);			
		}
		setTimeout(flush, 5);			
	};
		
	client.createRectangle = function(width, height) {
		return context.createImageData(width, height);
	}
	
	client.drawRectangle = function(x, y, rectangle) {
		context.putImageData(rectangle, x, y);
	}
	
	client.copyRectangle = function(srcX, srcY, x, y, width, heihgt) {
		context.drawImage(canvas, srcX, srcY, widhth, height, x, y, width, height);
	}
			
	socket.onmessage = function(event) {
		rfb.receive(event.data);
	}
	
	return function() {				
	}		
};
