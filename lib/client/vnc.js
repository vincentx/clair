var Encodings = { Raw : 0, CopyRect : 1,  DataURI : 8051}
var createVncClient = (function(base64, des, encodings) {	
	return function(options) {	
		function toAscii(data) { var ascii = []; for (var i = 0; i < data.length; i++) ascii[i] = String.fromCharCode(data[i]);return ascii.join('');}
					
		function Message(bytes) {
			this.bytes = bytes ? bytes : new Array();
			this.append = function(data, length) {if(!length) length = data.bytes.length; this.bytes = this.bytes.concat(data.bytes.splice(0, length));};
			this.read = function(count) { return this.bytes.splice(0, count);};
			this.readString = function(count) { var read = this.bytes.splice(0, count), result = []; for (var i = 0; i < count; i++) result.push(String.fromCharCode(read[i]));	return result.join('');};
			this.unpack32 = function() {  var data = this.read(4); return (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];};
			this.unpack16 = function() { var data = this.read(2); return (data[0] << 8) + data[1];};
			this.unpack8 = function() { return this.read(1)[0]; };
			this.unpack = function(n) { var result = 0, data = this.read(n); for (var i = 0; i < n ; i ++) result += data[i] << ((n - i - 1) * 8); return result;}
			this.padding = function(n) { this.read(n);}
			this.size = function() { return this.bytes.length; }
		}		
		
		function ClientMessage() {
			var data = [];
			this.pack8  = function (num) { data.push(num & 0xFF); return this;};
			this.padding8  = function () { data.push(0 & 0xFF); return this;};
			this.pack16 = function (num) { data.push((num >> 8) & 0xFF, (num) & 0xFF); return this;};
			this.pack32 = function (num) { data.push((num >> 24) & 0xFF, (num >> 16) & 0xFF, (num >>  8) & 0xFF, (num) & 0xFF); return this;};
			this.send = function() {socket.send(toAscii(data));};
		}
						
		var client = { protocol33 : { version : 3.3 }, protocol37 : { version : 3.7 }, protocol38 : { version : 3.8 }};
		var socket = options.socket, canvas = options.canvas;
		function sendAuthentication(password, challenge) { socket.send(toAscii(des.encrypt(password, challenge))); }
		function sendClientInit(shared) { socket.send(shared ? toAscii([1]) : toAscii([0])); }
		
		client.protocolVersion = function(message) {
			var version = message.readString(12);
			var major = version.substr(4, 3), minor = version.substr(8, 3);
			var serverVersion = parseFloat(parseFloat(major) + "." + parseFloat(minor));
			if (options.always && serverVersion >= options.always) serverVersion = options.always;
			if (serverVersion >= 3.8) { client.protocol = client.protocol38; socket.send('RFB 003.008\n');} 
			else if (serverVersion >= 3.7) { client.protocol = client.protocol37; socket.send('RFB 003.007\n');} 
			else if (serverVersion >= 3.3) { client.protocol = client.protocol33;socket.send('RFB 003.003\n');}
			client.handler = client.protocol.security;
		}
		
		client.protocol33.security = function(message) {
			var mode = message.unpack32();
			if (mode == 2) {
				client.handler = client.collect(16, new Message(), function(challenge) {
					sendAuthentication(options.password, challenge.read(16));
					client.handler = client.protocol33.authentication;
				});
			}
		}
		client.protocol33.authentication = function(message) {
			var result = message.unpack32();
			if (result == 0) {
				sendClientInit(true);
				this.handler = client.serverInit;
			}
		}
		client.serverInit = function(message) {
			client.server = {
				width  : message.unpack16(),
				height : message.unpack16(),
				pixelFormat : {
					bitsPerPixel : message.unpack8(),
					depth        : message.unpack8(),
					bigEndian    : message.unpack8() != 0,
					trueColor    : message.unpack8() != 0,
					redMax       : message.unpack16(),
					greenMax     : message.unpack16(),
					blueMax      : message.unpack16(),
					redShift     : message.unpack8(),
					greenShift   : message.unpack8(),
					blueShift    : message.unpack8()
				}
			}
			message.padding(3);
			client.server.name = message.readString(message.unpack32());			
			canvas.setSize(client.server.width, client.server.height);
			client.setEncodings([encodings.Raw, encodings.CopyRect, encodings.DataURI]);
			if (client.server.pixelFormat.bitsPerPixel != 32) client.setPixelFormat();
			client.updateFramebuffer(false, 0, 0, client.server.width, client.server.height);
			client.update(40);
			this.handler = client.serverToClient;
		}
		client.serverToClient = function(message) {
			var type = message.unpack8();
			if (type == 0) { 
				message.padding(1);
				client.framebufferUpdate(message.unpack16())(message);
			}						
		}
		
		client.framebufferUpdate = function(numberOfRectangles) {
			return function(message) {
				if (numberOfRectangles == 0) { client.handler =	client.serverToClient; return;}
				var x = message.unpack16(), y = message.unpack16(), width = message.unpack16(), height= message.unpack16();
				var encoding = message.unpack32();
				switch(encoding) {
					case encodings.Raw:
						var size = width * height * (client.server.pixelFormat.trueColor ? 4 : 1);
						client.handler = client.collect(size, new Message(), function(pixels) {
							canvas.drawRectangleFromPixels(x, y, width, height, pixels.bytes);
							client.handler = client.framebufferUpdate(numberOfRectangles - 1);						
						});
						break;	
					case encodings.CopyRect:
						var srcX = message.unpack16(), srcY = message.unpack16();
						canvas.drawRectangleFromCanvas(srcX, srcY, width, height, x, y);
						break;
					case encodings.DataURI:
						var size = message.unpack(8), data = message.readString(size);
						canvas.drawRectangleFromDataURI(x, y, width, height, data);
						break;					
				}
			}
		}
		
		client.collect = function(size, buffer, callback) {
			var protocol = this;
			return function(message) {
				var messageSize = message.size();
				if (messageSize < size) {
					buffer.append(message, messageSize);
					client.handler = client.collect(size - messageSize, buffer, callback);
				} else {
					buffer.append(message, size);
					callback(buffer);
				}
			}				
		}				
		
		client.setEncodings = function(encodings) {
			var message = new ClientMessage().pack8(2).padding8().pack16(encodings.length);
			for (var i = 0; i < encodings.length; i++) message.pack32(encodings[i]);
			message.send();
		}
		
		client.setPixelFormat = function() {
			new ClientMessage().pack8(0).pack8(0).pack8(0).pack8(0).pack8(32).pack8(24).pack8(0).pack8(1).pack16(255).pack16(255).pack16(255).pack8(16).pack8(8).pack8(0).pack8(0).pack8(0).pack8(0).send();
			client.server.pixelFormat = {
				bitsPerPixel : 32,
				depth        : 24,
				bigEndian    : false,
				trueColor    : true,
				redMax       : 255,
				greenMax     : 255,
				blueMax      : 255,
				redShift     : 16,
				greenShift   : 8,
				blueShift    : 0
			}			
		}
		
		client.updateFramebuffer = function(incremental, x, y, width, height) {
			new ClientMessage().pack8(3).pack8(incremental ? 1 : 0).pack16(x).pack16(y).pack16(width).pack16(height).send();
		}
		
		client.update = function(interval) {
			var flush = function() {
				client.updateFramebuffer(true, 0, 0, client.server.width, client.server.height);
				setTimeout(flush, interval);			
			}
			setTimeout(flush, interval);
		}		
		
		client.handler = client.protocolVersion;
		
		socket.onmessage = function(event) {
			var message = new Message(base64.decode(event.data));
			while(message.size() != 0) client.handler(message);
		}
		
		return client;
	}
})(Base64, DES, Encodings);