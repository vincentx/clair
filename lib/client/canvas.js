var createCanvas = (function() {
	return function(target) {
		var canvas = {}, context = target.getContext("2d");
		canvas.setSize = function(width, height) { target.width = width; target.height = height; }
		canvas.drawRectangleFromPixels = function(x, y, width, height, pixels) {
			var rectangle = context.createImageData(width, height);
			for (var i = 0; i < pixels.length; i += 4) {
			  rectangle.data[i  ] = pixels[i+2];
			  rectangle.data[i+1] = pixels[i+1];
			  rectangle.data[i+2] = pixels[i ];
			  rectangle.data[i+3] = 255;
			}
			context.putImageData(rectangle, x, y);
		}
		return canvas;		
	}
})();