var sys = require('sys'), net = require('net'), Buffer = require('buffer').Buffer;

sys.log(result.encrypt);

var port = 5900, host = 'localhost';

Buffer.prototype._index = 0;
Buffer.prototype.read16 = function() { return (this[this._index++] << 8) + this[this._index++];};

// var socket = net.createConnection(port, host);
// socket.addListener('data', function(data) {
// 	sys.log(data.read16());
// 	sys.log(data._index);
// });
