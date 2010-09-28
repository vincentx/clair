var RFB = (function(base64, des) {
	return function(options) {
	var socket = options.socket, password = options.password, always = options.always;
		
	var Protocol33 = (function() {
		var protocol = {};
		protocol.version = 3.3;
		protocol.security = function(data) {
			var mode = data.unpack32();
			if (mode == 2) return protocol.waitForChallenge(data);
		};
		protocol.waitForChallenge = function(data) {
			if (data.bytes.length < 16) return protocol.waitForChallenge;
			var challenge = data.readString(16);
			socket.send(des.encrypt(password, challenge));
			return protocol.authentication;						
		};
		protocol.authentication = function(data) {
						
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
			
	var protocol = null;
	
	var protocolVersion = function(data) {
		var version = data.readString(12);
		var major = version.substr(4, 3), minor = version.substr(8, 3);
		var serverVersion = parseFloat(parseFloat(major) + "." + parseFloat(minor));
		if (always && serverVersion >= always) serverVersion = always;
		if (serverVersion >= 3.8) {
			protocol = Protocol38;			
			socket.send('RFB 003.008\n');
		} else if (serverVersion >= 3.7) {
			protocol = Protocol37;			
			socket.send('RFB 003.007\n');
		} else if (serverVersion >= 3.3) {
			protocol = Protocol33;			
			socket.send('RFB 003.003\n');
		}		
		return protocol.security;		
	};	
	
	var handler = protocolVersion;
			
	function receive(data) {
		handler = handler(base64.decode(data));
	}
		
	return { 
		receive : receive,
		_protocol : function() { return protocol;} 
	};
}})(Base64, DES);