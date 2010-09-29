var RFB = (function(base64, des) {
	return function(options) {
	var socket = options.socket, password = options.password, always = options.always, client = options.client;
	
	function toAscii(data) { var ascii = []; for (var i = 0; i < data.length; i++) ascii[i] = String.fromCharCode(data[i]);return ascii.join('');}	
	
	function Message(bytes) {
		this.bytes = bytes ? bytes : new Array();
		this.append = function(data) { this.bytes = this.bytes.concat(data);};
		this.read = function(count) { return this.bytes.splice(0, count);};
		this.readString = function(count) { var read = this.bytes.splice(0, count), result = []; for (var i = 0; i < count; i++) result.push(String.fromCharCode(read[i]));	return result.join('');};
		this.unpack32 = function() {  var data = this.read(4); return (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];};
		this.unpack16 = function() { var data = this.read(2); return (data[0] << 8) + data[1];};
		this.unpack8 = function() { return this.read(1)[0]; };
		this.unpack = function(n) { var result = 0, data = this.read(n); for (var i = 0; i < n ; i ++) result += data[i] << ((n - i - 1) * 8); return result;}
		this.padding = function(n) { this.read(n);}
	}			
		
	function ClientMessage() {
		var data = [];
		this.pack8  = function (num) { data.push(num & 0xFF); return this;};
		this.pack16 = function (num) { data.push((num >> 8) & 0xFF, (num) & 0xFF); return this;};
		this.pack32 = function (num) { data.push((num >> 24) & 0xFF, (num >> 16) & 0xFF, (num >>  8) & 0xFF, (num) & 0xFF); return this;};
		this.send = function() {socket.send(toAscii(data));};
	}
	
	function PixelFormat(data) {
		this.bitsPerPixel = data.unpack8(), this.depth = data.unpack8();
		this.bigEndian = data.unpack8() != 0,this.trueColor = data.unpack8() != 0;
		this.redMax = data.unpack16(), this.greenMax = data.unpack16(), this.blueMax = data.unpack16();
		this.redShift = data.unpack8(), this.greenShift = data.unpack8(), this.blueShift = data.unpack8(); data.padding(3);
		this.getColors = function(color) { return { blue: (color >> this.blueShift) & this.blueMax, green: (color >> this.greenShift) & this.greenMax, red: (color >> this.redShift) & this.redMax};};
	}
				
	var Protocol33 = (function() {						
		function sendAuthentication(password, challenge) { socket.send(toAscii(des.encrypt(password, challenge))); }
		function sendClientInit(shared) { socket.send(shared ? toAscii([1]) : toAscii([0])); }
		
		var protocol = {};
		protocol.version = 3.3;
		protocol.security = function(data) {
			var mode = data.unpack32();
			if (mode == 2) return protocol.vncAuthenticationChallenge(data);
		};
		protocol.vncAuthenticationChallenge = function(data) {
			if (data.bytes.length < 16) return protocol.vncAuthenticationChallenge;
			sendAuthentication(password, data.read(16));
			return protocol.authentication;						
		};
		protocol.authentication = function(data) {
			if (data.bytes.length < 4) return protocol.authentication;
			var result = data.unpack32();
			if (result == 0) {
				sendClientInit(true);
				return protocol.serverInit;
			}	
			// TODO auth fail					
		};
		var pixelFormat = null;
		protocol.serverInit = function(data) {
			var width = data.unpack16(), height = data.unpack16();
			pixelFormat = new PixelFormat(data);
			var nameLength = data.unpack32(), name = data.readString(nameLength);
			client.onServerInit(name, width, height, pixelFormat);
			return protocol.serverToClient;
		};
		var FramebufferUpdate = 0;
		protocol.serverToClient = function(data) {
			var type = data.unpack8();
			if (type == FramebufferUpdate) { 
				data.padding(1); 
				var numberOfRectangles = data.unpack16();
				return protocol.framebufferUpdate(numberOfRectangles, pixelFormat)(data);
			}
		};
		protocol.waitForContent = function(bytes, handler) {
			return function(data) { if (data.bytes.length >= bytes) return handler(data); };
		};
		protocol.framebufferUpdate = function(numberOfRectangles, pixelFormat) {
			return function(data) {
				if (numberOfRectangles == 0) return protocol.serverToClient;
				var x = data.unpack16(), y = data.unpack16(), width = data.unpack16(), height = data.unpack16(), encoding = parseInt(data.unpack32(), 10);
				var waitForContent = protocol.waitForContent(width * height * (pixelFormat.bitsPerPixel / 8), protocol.updateRectangle(x, y, width, height, encoding, pixelFormat, numberOfRectangles - 1));
				var result = waitForContent(data);
				return result ? result : waitForContent;
			}						
		};
		protocol.updateRectangle = function(x, y, width, height,encoding, pixelFormat, num) {
			return function(data) {
				var rectangle = client.createRectangle(width, height);
				protocol.encoding[encoding.toString()](data, x, y, width, height, pixelFormat, rectangle);
				client.onRectangle(x, y, rectangle);
				return protocol.framebufferUpdate(num, pixelFormat)(data);
			}
		}
		protocol.setPixelFormat = function() {
			
		};
		protocol.setEncodings = function() {
			
		};
		protocol.framebufferUpdateRequest = function(incremental, x, y, width, height) {
			new ClientMessage().pack8(3).pack8(incremental ? 1 : 0).pack16(x).pack16(y).pack16(width).pack16(height).send();
		};
		protocol.keyEvent = function() {
			
		};
		protocol.pointerEvent = function() {
			
		};
		protocol.clientCutText = function() {
			
		};
		
		protocol.encoding = {};	
		protocol.encoding.raw = function(data, x, y, width, height, pixelFormat, rectangle) {
			var bytesPerPixel = pixelFormat.bitsPerPixel / 8, numberOfPixels = width * height * bytesPerPixel, pixels = data.read(numberOfPixels);
			function unpack(index, n, backwards) { var result = 0; for (var i = 0; i < n ; i ++) result += pixels[index + i] << ((backwards ? i : (n - i - 1)) * 8); return result;}
			for (var i=0, j=0; i < numberOfPixels; i+=4, j+=bytesPerPixel) {
				var colors = pixelFormat.getColors(unpack(j, bytesPerPixel, !pixelFormat.bigEndian));
		        rectangle.data[i + 0] = colors.red;
		        rectangle.data[i + 1] = colors.green;
		        rectangle.data[i + 2] = colors.blue;
		        rectangle.data[i + 3] = 255;
		    }									
		}
		protocol.encoding['0'] = protocol.encoding.raw;
		//TODO others
		return protocol;				
	}());		
	
	var Protocol37 = (function() {
		function protocol37() {}
		protocol37.prototype = Protocol33;
		var protocol = new protocol37;
		protocol.version = 3.7;
		return protocol; 	
	}());
				
	var Protocol38 = (function() {
		function protocol38() {}
		protocol38.prototype = Protocol37;		
		var protocol = new protocol38;
		protocol.version = 3.8;
		return protocol;	
	}());
	
	var rfb = {};	
	rfb.protocol = null;
	var protocolVersion = function(data) {
		var version = data.readString(12);
		var major = version.substr(4, 3), minor = version.substr(8, 3);
		var serverVersion = parseFloat(parseFloat(major) + "." + parseFloat(minor));
		if (always && serverVersion >= always) serverVersion = always;
		if (serverVersion >= 3.8) {
			rfb.protocol = Protocol38;			
			socket.send('RFB 003.008\n');
		} else if (serverVersion >= 3.7) {
			rfb.protocol = Protocol37;			
			socket.send('RFB 003.007\n');
		} else if (serverVersion >= 3.3) {
			rfb.protocol = Protocol33;			
			socket.send('RFB 003.003\n');
		}	
		return rfb.protocol.security;
	};			
	
	var handler = protocolVersion, queue = new Message();
	rfb.receive = function(data) { queue.append(base64.decode(data)); var next = handler(queue); if (next) handler = next; }
	return rfb;
}})(Base64, DES);