/*
 * Modified from:
 * www.webtoolkit.info/javascript-base64.html
 */
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/ 
var Base64 = { 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		if (typeof(input) == "string") input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = typeof(input) == "string" ? input.charCodeAt(i++) : input[i++];
			chr2 = typeof(input) == "string" ? input.charCodeAt(i++) : input[i++];
			chr3 = typeof(input) == "string" ? input.charCodeAt(i++) : input[i++];
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4); 
		}
 
		return output;
	},	
 
	// public method for decoding
	decode : function (input) {
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		var result = {
			bytes: new Array(),
			read : function(count) {
				return this.bytes.splice(0, count);
			},
			readString : function(count) {
				var read = this.bytes.splice(0, count), result = [];
				for (var i = 0; i < count; i++) result.push(String.fromCharCode(read[i]));	
				return result.join('');
			},
			unpack32: function() {				
				var data = this.read(4);
				return (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
			},
			unpack16: function() {
				var data = this.read(2);
				return (data[0] << 8) + data[1];
			},
			unpack8: function() {
				return this.read(1)[0];
			},
			unpack: function(n) {
				var result = 0, data = this.read(n);
				for (var i = 0; i < n ; i ++) result += data[i] << ((n - i - 1) * 8);
				return result;
			}			
		}
		 
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			result.bytes.push(chr1); 
			if (enc3 != 64) result.bytes.push(chr2);
			if (enc4 != 64) result.bytes.push(chr3);
		}
		return result;
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}