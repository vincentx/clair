var createSocket = function() {
	var messageSent = new Array();
	return {
		send : function(message) {
			messageSent.push(message);			
		},		
		messages : function() {
			return messageSent;
		}
	}
};