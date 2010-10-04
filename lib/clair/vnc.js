var sys = require('sys'), Buffer = require('buffer').Buffer, log = require('./log');

var log = log.create(0);

Buffer.prototype._index = 0;
Buffer.prototype.skip   = function(n)  { this._index += n; }
Buffer.prototype.skipAll= function(n)  { this._index = this.length; }
Buffer.prototype.empty  = function() { return this._index == this.length; }
Buffer.prototype.size   = function() { return this.length - this._index; }
Buffer.prototype.read8  = function() { return this[this._index++];};
Buffer.prototype.read16 = function() { return (this[this._index++] <<  8) + this[this._index++];};
Buffer.prototype.read32 = function() { return (this[this._index++] << 24) + (this[this._index++] << 16) + (this[this._index++] << 8) + this[this._index++];};
Buffer.prototype.append = function(buffer, length) {buffer.copy(this, this._index, buffer._index, buffer._index + length); this._index += length; buffer.skip(length); }

function VncClient() {
	this._handler = this.protocolVersion;
	this.enableDataURI = true;
	this.initialized = false;
}

VncClient.prototype = new process.EventEmitter();

VncClient.prototype.receive = function(data) {
	var message = typeof(data) == 'string' ? new Buffer(data) : data;
	while (!message.empty()) this._handler(message);
}

VncClient.prototype.protocolVersion = function(message) {
	log.debug('handshaking: send server protocol version');
	this.emit('protocolVersion', message); message.skipAll();
	this._handler = this.security; 
}

VncClient.prototype.security = function(message) {
	log.debug('handshaking: exchange security');
	this.emit('security', message); message.skipAll();
	this._handler = this.securityResult;
}

VncClient.prototype.securityResult = function(message) {
	log.debug('handshaking: security result ');
	this.emit('securityResult', message); message.skipAll();
	this._handler = this.serverInit;
}

VncClient.prototype.serverInit = function(message) {	
	this._server = {
		width       : message.read16(),
		height      : message.read16(),
		pixelFormat : {
			bitsPerPixel : message.read8(),
			depth        : message.read8(),
			bigEndian    : message.read8() != 0,
			trueColor    : message.read8() != 0,
			redMax       : message.read16(),
			greenMax     : message.read16(),
			blueMax      : message.read16(),
			redShift     : message.read8(),
			greenShift   : message.read8(),
			blueShift    : message.read8()
		}		
	}
	log.debug('server initialization ' + this._server.width + ' ' + this._server.height + ' ' + this._server.pixelFormat.bitsPerPixel);
	this.emit('serverInit', message); message.skipAll(); 
	this.initialized = true;
	this._handler = this.serverToClient;
}

VncClient.prototype.serverToClient = function(message) {
	log.debug('got message from server ' + message.length );
	if (!this.enableDataURI) {
		log.debug('send message to client ' + message.length );
		this.emit('serverToClient', message); message.skipAll();
		return;
	}
	var type = message.read8();	
	if (type == 0) {
		log.debug('server side encoding');
		message.skip(1);		
		this.framebufferUpdate(message.read16())(message);
	}
}

VncClient.prototype.framebufferUpdate = function(numberOfRectangles) {
	var protocol = this;
	return function(message) {
		if (numberOfRectangles == 0) { protocol._handler =	protocol.serverToClient; return;}
		var x = message.read16(), y = message.read16(), width = message.read16(), height= message.read16();
		var encoding = message.read32();
		if (encoding == 0) {
			var size = width * height * (protocol._server.pixelFormat.trueColor ? 4 : 1);
			protocol._handler = protocol.collect(size, new Buffer(size), function(pixels) {
				protocol.emit('rawEncoding', x, y, width, height, pixels);
				protocol._handler = protocol.framebufferUpdate(numberOfRectangles - 1);
			});
		}
	}
}

VncClient.prototype.collect = function(size, buffer, callback) {
	var protocol = this;
	return function(message) {
		var messageSize = message.size();
		if (messageSize < size) {
			buffer.append(message, messageSize);
			protocol._handler = protocol.collect(size - messageSize, buffer, callback);
		} else {
			buffer.append(message, size);
			callback(buffer);
		}
	}	
}

VncClient.prototype.send = function(message) {
	var bytes = new Buffer(message.length);
	for (var i = 0; i < message.length ; i++) bytes[i] = message.charCodeAt(i);
	if (this.initialized) log.debug('client set request to server');
	return bytes;
}

exports.createClient = function() {
	return new VncClient();
}