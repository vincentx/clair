var RFB = (function(base64, des) {
	return function(options) {
	var socket = options.socket, password = options.password, always = options.always, client = options.client;
	
	function toAscii(data) {
		var ascii = [];
		for (var i = 0; i < data.length; i++) ascii[i] = String.fromCharCode(data[i]);
		return ascii.join('');
	}
	
	function sendAuthentication(password, challenge) { socket.send(toAscii(des.encrypt(password, challenge))); }
	function sendClientInit(shared) { socket.send(shared ? "\1" : "\0"); }
	function parsePixelFormat(data) {
		return {
			bitsPerPixel : data.unpack8(),
			depth : data.unpack8(),
			bigEndian : data.unpack8() != 0,
			trueColor : data.unpack8() != 0,
			redMax : data.unpack16(),
			greenMax : data.unpack16(),
			blueMax : data.unpack16(),
			redShift : data.unpack8(),
			greenShift : data.unpack8(),
			blueShift : data.unpack8(),
			padding: data.read(3)
		};		
	}
		
	var Protocol33 = (function() {
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
		protocol.serverInit = function(data) {
			var width = data.unpack16(), height = data.unpack16();
			var pixelFormat = parsePixelFormat(data);
			var nameLength = data.unpack32(), name = data.readString(nameLength);
			client.onServerInit(name, width, height, pixelFormat);
		};
		protocol.setPixelFormat = function() {
			
		};
		protocol.setEncodings = function() {
			
		};
		protocol.framebufferUpdateRequest = function() {
			
		};
		protocol.keyEvent = function() {
			
		};
		protocol.pointerEvent = function() {
			
		};
		protocol.clientCutText = function() {
			
		};
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
	
	var handler = protocolVersion;
	rfb.receive = function(data) { handler = handler(base64.decode(data));}		
	return rfb;
}})(Base64, DES);