var sys = require('sys');

function Logger(level) {	
	this.severityLevel = level;
}

Logger.prototype.info = function(message) { this.log(1, "[info] " + message);}
Logger.prototype.debug = function(message) { this.log(0, "[debug] " + message);}
Logger.prototype.log = function(severity, message) { if (severity >= this.severityLevel) sys.log(message);}

exports.debug = 0;
exports.info  = 1;

exports.create = function(level) { return new Logger(level); }