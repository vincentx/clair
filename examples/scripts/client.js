$(document).ready(function() {
	var socket;
	$('#connect').click(function() {
		socket = new WebSocket("ws://localhost:8000/vnc?host="+ $('#host').val() +"&port=" + $('#port').val());
		socket.onopen = function() {};
		socket.onclose = function() {};
		createVncClient({socket : socket, password : $('#password').val(), always : 3.3, canvas : createCanvas($("#vnc-viewer")[0])});
		$('#connect').toggle();
		$('#disconnect').toggle();
	});
	$('#disconnect').click(function() {
		$('#vnc-viewer').remove();
		$('body').append('<canvas id="vnc-viewer"></canvas>');
		socket.close();
		$('#connect').toggle();
		$('#disconnect').toggle();		
	})
});
