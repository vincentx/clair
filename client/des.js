var DES = (function() {
	var BLOCK_SIZE = 8;
	var BYTEBIT	= [01, 02, 04, 010, 020, 040, 0100, 0200],
		BIGBYTE = [ 0x800000, 0x400000, 0x200000, 0x100000,
					0x080000, 0x040000, 0x020000, 0x010000,
					0x008000, 0x004000, 0x002000, 0x001000,
					0x000800, 0x000400, 0x000200, 0x000100,
					0x000080, 0x000040, 0x000020, 0x000010,
					0x000008, 0x000004, 0x000002, 0x000001],
		PC1     = [ 56, 48, 40, 32, 24, 16,  8,	 0, 57, 49, 41, 33, 25, 17,
			 		9,  1, 58, 50, 42, 34, 26,	18, 10,  2, 59, 51, 43, 35,
					62, 54, 46, 38, 30, 22, 14,	 6, 61, 53, 45, 37, 29, 21,
					13,  5, 60, 52, 44, 36, 28,	20, 12,  4, 27, 19, 11,  3],
		TOTROT  = [ 1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28],
		PC2     = [ 13, 16, 10, 23,  0,  4,  2, 27, 14,  5, 20,  9,
					22, 18, 11,  3, 25,  7, 15,  6, 26, 19, 12,  1,
					40, 51, 30, 36, 46, 54, 29, 39, 50, 44, 32, 47,
					43, 48, 38, 55, 33, 52, 45, 41, 49, 35, 28, 31];
	var	SP1 = [ 0x01010400, 0x00000000, 0x00010000, 0x01010404,
				0x01010004, 0x00010404, 0x00000004, 0x00010000,
				0x00000400, 0x01010400, 0x01010404, 0x00000400,
				0x01000404, 0x01010004, 0x01000000, 0x00000004,
				0x00000404, 0x01000400, 0x01000400, 0x00010400,
				0x00010400, 0x01010000, 0x01010000, 0x01000404,
				0x00010004, 0x01000004, 0x01000004, 0x00010004,
				0x00000000, 0x00000404, 0x00010404, 0x01000000,
				0x00010000, 0x01010404, 0x00000004, 0x01010000,
				0x01010400, 0x01000000, 0x01000000, 0x00000400,
				0x01010004, 0x00010000, 0x00010400, 0x01000004,
				0x00000400, 0x00000004, 0x01000404, 0x00010404,
				0x01010404, 0x00010004, 0x01010000, 0x01000404,
				0x01000004, 0x00000404, 0x00010404, 0x01010400,
				0x00000404, 0x01000400, 0x01000400, 0x00000000,
				0x00010004, 0x00010400, 0x00000000, 0x01010004],
		SP2 = [ 0x80108020, 0x80008000, 0x00008000, 0x00108020,
				0x00100000, 0x00000020, 0x80100020, 0x80008020,
				0x80000020, 0x80108020, 0x80108000, 0x80000000,
				0x80008000, 0x00100000, 0x00000020, 0x80100020,
				0x00108000, 0x00100020, 0x80008020, 0x00000000,
				0x80000000, 0x00008000, 0x00108020, 0x80100000,
				0x00100020, 0x80000020, 0x00000000, 0x00108000,
				0x00008020, 0x80108000, 0x80100000, 0x00008020,
				0x00000000, 0x00108020, 0x80100020, 0x00100000,
				0x80008020, 0x80100000, 0x80108000, 0x00008000,
				0x80100000, 0x80008000, 0x00000020, 0x80108020,
				0x00108020, 0x00000020, 0x00008000, 0x80000000,
				0x00008020, 0x80108000, 0x00100000, 0x80000020,
				0x00100020, 0x80008020, 0x80000020, 0x00100020,
				0x00108000, 0x00000000, 0x80008000, 0x00008020,
				0x80000000, 0x80100020, 0x80108020, 0x00108000],
		SP3 = [ 0x00000208, 0x08020200, 0x00000000, 0x08020008,
				0x08000200, 0x00000000, 0x00020208, 0x08000200,
				0x00020008, 0x08000008, 0x08000008, 0x00020000,
				0x08020208, 0x00020008, 0x08020000, 0x00000208,
				0x08000000, 0x00000008, 0x08020200, 0x00000200,
				0x00020200, 0x08020000, 0x08020008, 0x00020208,
				0x08000208, 0x00020200, 0x00020000, 0x08000208,
				0x00000008, 0x08020208, 0x00000200, 0x08000000,
				0x08020200, 0x08000000, 0x00020008, 0x00000208,
				0x00020000, 0x08020200, 0x08000200, 0x00000000,
				0x00000200, 0x00020008, 0x08020208, 0x08000200,
				0x08000008, 0x00000200, 0x00000000, 0x08020008,
				0x08000208, 0x00020000, 0x08000000, 0x08020208,
				0x00000008, 0x00020208, 0x00020200, 0x08000008,
				0x08020000, 0x08000208, 0x00000208, 0x08020000,
				0x00020208, 0x00000008, 0x08020008, 0x00020200],
		SP4 = [ 0x00802001, 0x00002081, 0x00002081, 0x00000080,
				0x00802080, 0x00800081, 0x00800001, 0x00002001,
				0x00000000, 0x00802000, 0x00802000, 0x00802081,
				0x00000081, 0x00000000, 0x00800080, 0x00800001,
				0x00000001, 0x00002000, 0x00800000, 0x00802001,
				0x00000080, 0x00800000, 0x00002001, 0x00002080,
				0x00800081, 0x00000001, 0x00002080, 0x00800080,
				0x00002000, 0x00802080, 0x00802081, 0x00000081,
				0x00800080, 0x00800001, 0x00802000, 0x00802081,
				0x00000081, 0x00000000, 0x00000000, 0x00802000,
				0x00002080, 0x00800080, 0x00800081, 0x00000001,
				0x00802001, 0x00002081, 0x00002081, 0x00000080,
				0x00802081, 0x00000081, 0x00000001, 0x00002000,
				0x00800001, 0x00002001, 0x00802080, 0x00800081,
				0x00002001, 0x00002080, 0x00800000, 0x00802001,
				0x00000080, 0x00800000, 0x00002000, 0x00802080],
		SP5 = [ 0x00000100, 0x02080100, 0x02080000, 0x42000100,
				0x00080000, 0x00000100, 0x40000000, 0x02080000,
				0x40080100, 0x00080000, 0x02000100, 0x40080100,
				0x42000100, 0x42080000, 0x00080100, 0x40000000,
				0x02000000, 0x40080000, 0x40080000, 0x00000000,
				0x40000100, 0x42080100, 0x42080100, 0x02000100,
				0x42080000, 0x40000100, 0x00000000, 0x42000000,
				0x02080100, 0x02000000, 0x42000000, 0x00080100,
				0x00080000, 0x42000100, 0x00000100, 0x02000000,
				0x40000000, 0x02080000, 0x42000100, 0x40080100,
				0x02000100, 0x40000000, 0x42080000, 0x02080100,
				0x40080100, 0x00000100, 0x02000000, 0x42080000,
				0x42080100, 0x00080100, 0x42000000, 0x42080100,
				0x02080000, 0x00000000, 0x40080000, 0x42000000,
				0x00080100, 0x02000100, 0x40000100, 0x00080000,
				0x00000000, 0x40080000, 0x02080100, 0x40000100],
		SP6 = [ 0x20000010, 0x20400000, 0x00004000, 0x20404010,
				0x20400000, 0x00000010, 0x20404010, 0x00400000,
				0x20004000, 0x00404010, 0x00400000, 0x20000010,
				0x00400010, 0x20004000, 0x20000000, 0x00004010,
				0x00000000, 0x00400010, 0x20004010, 0x00004000,
				0x00404000, 0x20004010, 0x00000010, 0x20400010,
				0x20400010, 0x00000000, 0x00404010, 0x20404000,
				0x00004010, 0x00404000, 0x20404000, 0x20000000,
				0x20004000, 0x00000010, 0x20400010, 0x00404000,
				0x20404010, 0x00400000, 0x00004010, 0x20000010,
				0x00400000, 0x20004000, 0x20000000, 0x00004010,
				0x20000010, 0x20404010, 0x00404000, 0x20400000,
				0x00404010, 0x20404000, 0x00000000, 0x20400010,
				0x00000010, 0x00004000, 0x20400000, 0x00404010,
				0x00004000, 0x00400010, 0x20004010, 0x00000000,
				0x20404000, 0x20000000, 0x00400010, 0x20004010],
		SP7 = [ 0x00200000, 0x04200002, 0x04000802, 0x00000000,
				0x00000800, 0x04000802, 0x00200802, 0x04200800,
				0x04200802, 0x00200000, 0x00000000, 0x04000002,
				0x00000002, 0x04000000, 0x04200002, 0x00000802,
				0x04000800, 0x00200802, 0x00200002, 0x04000800,
				0x04000002, 0x04200000, 0x04200800, 0x00200002,
				0x04200000, 0x00000800, 0x00000802, 0x04200802,
				0x00200800, 0x00000002, 0x04000000, 0x00200800,
				0x04000000, 0x00200800, 0x00200000, 0x04000802,
				0x04000802, 0x04200002, 0x04200002, 0x00000002,
				0x00200002, 0x04000000, 0x04000800, 0x00200000,
				0x04200800, 0x00000802, 0x00200802, 0x04200800,
				0x00000802, 0x04000002, 0x04200802, 0x04200000,
				0x00200800, 0x00000000, 0x00000002, 0x04200802,
				0x00000000, 0x00200802, 0x04200000, 0x00000800,
				0x04000002, 0x04000800, 0x00000800, 0x00200002],
		SP8 = [	0x10001040, 0x00001000, 0x00040000, 0x10041040,
				0x10000000, 0x10001040, 0x00000040, 0x10000000,
				0x00040040, 0x10040000, 0x10041040, 0x00041000,
				0x10041000, 0x00041040, 0x00001000, 0x00000040,
				0x10040000, 0x10000040, 0x10001000, 0x00001040,
				0x00041000, 0x00040040, 0x10040040, 0x10041000,
				0x00001040, 0x00000000, 0x00000000, 0x10040040,
				0x10000040, 0x10001000, 0x00041040, 0x00040000,
				0x00041040, 0x00040000, 0x10041000, 0x00001000,
				0x00000040, 0x10040040, 0x00001000, 0x00041040,
				0x10001000, 0x00000040, 0x10000040, 0x10040000,
				0x10040040, 0x10000000, 0x00040000, 0x10001040,
				0x00000000, 0x10041040, 0x00040040, 0x10000040,
				0x10040000, 0x10001000, 0x10001040, 0x00000000,
				0x10041040, 0x00041000, 0x00041000, 0x00001040,
				0x00001040, 0x00040040, 0x10000000, 0x10041000];
				
	function deskey(key) {
		var pcr = new Array(56), kn = new Array(32), pc1m = new Array(56);
		for (var i = 0; i < 56; i ++ ) {
			var l = PC1[i]; var m = l & 07;
			pc1m[i] = (key.charCodeAt(l >>> 3) & BYTEBIT[m]) != 0 ? 1 : 0;
		}
		for (var i = 0; i < 16; i ++) {
			var m = i << 1; var n = m + 1;
			kn[m] = 0; kn[n] = 0;
			for (var j = 0; j < 28; j ++) {
				var l = (j + TOTROT[i]) % 28;
				pcr[j] = pc1m[l]; pcr[j + 28] = pc1m[l + 28];
			}
			for (var j = 0; j < 24; j ++) {
				if (pcr[PC2[j]] != 0) kn[m] = kn[m] | BIGBYTE[j];
				if (pcr[PC2[j+24]] != 0) kn[n] = kn[n] | BIGBYTE[j];
			}
		}
		return kn;
	}
	
	function cookey(raw1) {
		var cook = [];
		for (var i = 0; i< 16; i++) {
			var a = raw1[i * 2 + 0], b = raw1[i * 2 + 1];
			var x = (a & 0x00fc0000) << 6;
			x |= (a & 0x00000fc0) << 10;
			x |= (b & 0x00fc0000) >>> 10;
			x |= (b & 0x00000fc0) >>> 6;
			cook.push(x);
			x  = (a & 0x0003f000) << 12;
			x |= (a & 0x0000003f) << 16;
			x |= (b & 0x0003f000) >>> 4;
			x |= (b & 0x0000003f);
			cook.push(x);			
		}
		return cook;
	}
	
	function des(block, keys) {
		var left = block[0], right = block[1];

		var work = ((left >>> 4) ^ right) & 0x0f0f0f0f;
		right ^= work; left ^= (work << 4);
		work = ((left >>> 16) ^ right) & 0x0000ffff;
		right ^= work; left ^= (work << 16);
		work = ((right >>> 2) ^ left) & 0x33333333;
		left ^= work; right ^= (work << 2);
		work = ((right >>> 8) ^ left) & 0x00ff00ff;
		left ^= work; right ^= (work << 8);
		right = ((right << 1) | ((right >>> 31) & 1)) & 0xffffffff;
		work = (left ^ right) & 0xaaaaaaaa;
		left ^= work;right ^= work;
		left = ((left << 1) | ((left >>> 31) & 1)) & 0xffffffff;

		for (var i = 0; i < 8; i++) {
			work  = (right << 28) | (right >>> 4); work ^= keys[i * 4 + 0];
			var fval = SP7[ work		 & 0x3f]
			fval |= SP5[(work >>>  8) & 0x3f];
			fval |= SP3[(work >>> 16) & 0x3f];
			fval |= SP1[(work >>> 24) & 0x3f];
			work  = right ^ keys[i * 4 + 1];
			fval |= SP8[ work		 & 0x3f];
			fval |= SP6[(work >>>  8) & 0x3f];
			fval |= SP4[(work >>> 16) & 0x3f];
			fval |= SP2[(work >>> 24) & 0x3f];
			left ^= fval;
			work  = (left << 28) | (left >>> 4);
			work ^= keys[i * 4 + 2];
			fval  = SP7[ work		 & 0x3f];
			fval |= SP5[(work >>>  8) & 0x3f];
			fval |= SP3[(work >>> 16) & 0x3f];
			fval |= SP1[(work >>> 24) & 0x3f];
			work  = left ^ keys[i * 4 + 3];
			fval |= SP8[ work		 & 0x3f];
			fval |= SP6[(work >>>  8) & 0x3f];
			fval |= SP4[(work >>> 16) & 0x3f];
			fval |= SP2[(work >>> 24) & 0x3f];
			right ^= fval;
		}
		right = ((right << 31) | (right >>> 1)) & 0xffffffff;
		work = (left ^ right) & 0xaaaaaaaa;
		left ^= work;right ^= work;
		left = ((left << 31) | (left >>> 1)) & 0xffffffff;
		work = ((left >>> 8) ^ right) & 0x00ff00ff;
		right ^= work; left ^= (work << 8);
		work = ((left >>> 2) ^ right) & 0x33333333;
		right ^= work; left ^= (work << 2);
		work = ((right >>> 16) ^ left) & 0x0000ffff;
		left ^= work; right ^= (work << 16);
		work = ((right >>> 4) ^ left) & 0x0f0f0f0f
		left ^= work; right ^= (work << 4);
		return pack(right).concat(pack(left));
	}		
	
	function unpack2(block) {		
		function unpack(index) {
			return ((block[index * 4] & 0xff) << 24)
                    | ((block[index * 4+ 1] & 0xff) << 16)
                    | ((block[index * 4+ 2] & 0xff) << 8)
                    | (block[index * 4+ 3] & 0xff);
		}
		return [unpack(0), unpack(1)];
	}
	
	function pack(number) {
		var result = new Array(4);
		for (var i = 0; i < 4; i++) {
			result[i] = (number >>> ((3-i) * 8)) % 256;
			number -= result[i] << ((3-i) * 8);
		}
		return result;
	}
		
	function update(data, keys) {
		var result = [];
		var numberOfBlocks = data.length / BLOCK_SIZE, residual = data.length % BLOCK_SIZE;
		for (var i = 0; i < numberOfBlocks; i ++) {
			var block = unpack2(data.slice(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE));
			result = result.concat(des(block, keys));			
		}
		return result;
	}	
		
	return {
		encrypt:function(key, message) {
			var _key = key.slice(0, BLOCK_SIZE);
			var padding = BLOCK_SIZE - _key.length;
			for (var i = 0; i < padding; i++) _key += "\0";
			return update(message, cookey(deskey(_key)));
		}	
	};
})();


// var DES = (function() {
// 	function des (key, message, encrypt, mode, iv, padding) {
// 	  //declaring this locally speeds things up a bit
// 	  var spfunction1 = new Array (0x1010400,0,0x10000,0x1010404,0x1010004,0x10404,0x4,0x10000,0x400,0x1010400,0x1010404,0x400,0x1000404,0x1010004,0x1000000,0x4,0x404,0x1000400,0x1000400,0x10400,0x10400,0x1010000,0x1010000,0x1000404,0x10004,0x1000004,0x1000004,0x10004,0,0x404,0x10404,0x1000000,0x10000,0x1010404,0x4,0x1010000,0x1010400,0x1000000,0x1000000,0x400,0x1010004,0x10000,0x10400,0x1000004,0x400,0x4,0x1000404,0x10404,0x1010404,0x10004,0x1010000,0x1000404,0x1000004,0x404,0x10404,0x1010400,0x404,0x1000400,0x1000400,0,0x10004,0x10400,0,0x1010004);
// 	  var spfunction2 = new Array (-0x7fef7fe0,-0x7fff8000,0x8000,0x108020,0x100000,0x20,-0x7fefffe0,-0x7fff7fe0,-0x7fffffe0,-0x7fef7fe0,-0x7fef8000,-0x80000000,-0x7fff8000,0x100000,0x20,-0x7fefffe0,0x108000,0x100020,-0x7fff7fe0,0,-0x80000000,0x8000,0x108020,-0x7ff00000,0x100020,-0x7fffffe0,0,0x108000,0x8020,-0x7fef8000,-0x7ff00000,0x8020,0,0x108020,-0x7fefffe0,0x100000,-0x7fff7fe0,-0x7ff00000,-0x7fef8000,0x8000,-0x7ff00000,-0x7fff8000,0x20,-0x7fef7fe0,0x108020,0x20,0x8000,-0x80000000,0x8020,-0x7fef8000,0x100000,-0x7fffffe0,0x100020,-0x7fff7fe0,-0x7fffffe0,0x100020,0x108000,0,-0x7fff8000,0x8020,-0x80000000,-0x7fefffe0,-0x7fef7fe0,0x108000);
// 	  var spfunction3 = new Array (0x208,0x8020200,0,0x8020008,0x8000200,0,0x20208,0x8000200,0x20008,0x8000008,0x8000008,0x20000,0x8020208,0x20008,0x8020000,0x208,0x8000000,0x8,0x8020200,0x200,0x20200,0x8020000,0x8020008,0x20208,0x8000208,0x20200,0x20000,0x8000208,0x8,0x8020208,0x200,0x8000000,0x8020200,0x8000000,0x20008,0x208,0x20000,0x8020200,0x8000200,0,0x200,0x20008,0x8020208,0x8000200,0x8000008,0x200,0,0x8020008,0x8000208,0x20000,0x8000000,0x8020208,0x8,0x20208,0x20200,0x8000008,0x8020000,0x8000208,0x208,0x8020000,0x20208,0x8,0x8020008,0x20200);
// 	  var spfunction4 = new Array (0x802001,0x2081,0x2081,0x80,0x802080,0x800081,0x800001,0x2001,0,0x802000,0x802000,0x802081,0x81,0,0x800080,0x800001,0x1,0x2000,0x800000,0x802001,0x80,0x800000,0x2001,0x2080,0x800081,0x1,0x2080,0x800080,0x2000,0x802080,0x802081,0x81,0x800080,0x800001,0x802000,0x802081,0x81,0,0,0x802000,0x2080,0x800080,0x800081,0x1,0x802001,0x2081,0x2081,0x80,0x802081,0x81,0x1,0x2000,0x800001,0x2001,0x802080,0x800081,0x2001,0x2080,0x800000,0x802001,0x80,0x800000,0x2000,0x802080);
// 	  var spfunction5 = new Array (0x100,0x2080100,0x2080000,0x42000100,0x80000,0x100,0x40000000,0x2080000,0x40080100,0x80000,0x2000100,0x40080100,0x42000100,0x42080000,0x80100,0x40000000,0x2000000,0x40080000,0x40080000,0,0x40000100,0x42080100,0x42080100,0x2000100,0x42080000,0x40000100,0,0x42000000,0x2080100,0x2000000,0x42000000,0x80100,0x80000,0x42000100,0x100,0x2000000,0x40000000,0x2080000,0x42000100,0x40080100,0x2000100,0x40000000,0x42080000,0x2080100,0x40080100,0x100,0x2000000,0x42080000,0x42080100,0x80100,0x42000000,0x42080100,0x2080000,0,0x40080000,0x42000000,0x80100,0x2000100,0x40000100,0x80000,0,0x40080000,0x2080100,0x40000100);
// 	  var spfunction6 = new Array (0x20000010,0x20400000,0x4000,0x20404010,0x20400000,0x10,0x20404010,0x400000,0x20004000,0x404010,0x400000,0x20000010,0x400010,0x20004000,0x20000000,0x4010,0,0x400010,0x20004010,0x4000,0x404000,0x20004010,0x10,0x20400010,0x20400010,0,0x404010,0x20404000,0x4010,0x404000,0x20404000,0x20000000,0x20004000,0x10,0x20400010,0x404000,0x20404010,0x400000,0x4010,0x20000010,0x400000,0x20004000,0x20000000,0x4010,0x20000010,0x20404010,0x404000,0x20400000,0x404010,0x20404000,0,0x20400010,0x10,0x4000,0x20400000,0x404010,0x4000,0x400010,0x20004010,0,0x20404000,0x20000000,0x400010,0x20004010);
// 	  var spfunction7 = new Array (0x200000,0x4200002,0x4000802,0,0x800,0x4000802,0x200802,0x4200800,0x4200802,0x200000,0,0x4000002,0x2,0x4000000,0x4200002,0x802,0x4000800,0x200802,0x200002,0x4000800,0x4000002,0x4200000,0x4200800,0x200002,0x4200000,0x800,0x802,0x4200802,0x200800,0x2,0x4000000,0x200800,0x4000000,0x200800,0x200000,0x4000802,0x4000802,0x4200002,0x4200002,0x2,0x200002,0x4000000,0x4000800,0x200000,0x4200800,0x802,0x200802,0x4200800,0x802,0x4000002,0x4200802,0x4200000,0x200800,0,0x2,0x4200802,0,0x200802,0x4200000,0x800,0x4000002,0x4000800,0x800,0x200002);
// 	  var spfunction8 = new Array (0x10001040,0x1000,0x40000,0x10041040,0x10000000,0x10001040,0x40,0x10000000,0x40040,0x10040000,0x10041040,0x41000,0x10041000,0x41040,0x1000,0x40,0x10040000,0x10000040,0x10001000,0x1040,0x41000,0x40040,0x10040040,0x10041000,0x1040,0,0,0x10040040,0x10000040,0x10001000,0x41040,0x40000,0x41040,0x40000,0x10041000,0x1000,0x40,0x10040040,0x1000,0x41040,0x10001000,0x40,0x10000040,0x10040000,0x10040040,0x10000000,0x40000,0x10001040,0,0x10041040,0x40040,0x10000040,0x10040000,0x10001000,0x10001040,0,0x10041040,0x41000,0x41000,0x1040,0x1040,0x40040,0x10000000,0x10041000);
// 
// 	  //create the 16 or 48 subkeys we will need
// 	  var keys = des_createKeys (key);
// 	  var m=0, i, j, temp, temp2, right1, right2, left, right, looping;
// 	  var cbcleft, cbcleft2, cbcright, cbcright2
// 	  var endloop, loopinc;
// 	  var len = message.length;
// 	  var chunk = 0;
// 	  //set up the loops for single and triple des
// 	  var iterations = keys.length == 32 ? 3 : 9; //single or triple des
// 	  if (iterations == 3) {looping = encrypt ? new Array (0, 32, 2) : new Array (30, -2, -2);}
// 	  else {looping = encrypt ? new Array (0, 32, 2, 62, 30, -2, 64, 96, 2) : new Array (94, 62, -2, 32, 64, 2, 30, -2, -2);}
// 
// 	  //pad the message depending on the padding parameter
// 	  if (padding == 2) message += "        "; //pad the message with spaces
// 	  else if (padding == 1) {temp = 8-(len%8); message += String.fromCharCode (temp,temp,temp,temp,temp,temp,temp,temp); if (temp==8) len+=8;} //PKCS7 padding
// 	  else if (!padding) message += "\0\0\0\0\0\0\0\0"; //pad the message out with null bytes
// 
// 	  //store the result here
// 	  result = "";
// 	  tempresult = "";
// 
// 	  if (mode == 1) { //CBC mode
// 	    cbcleft = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
// 	    cbcright = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
// 	    m=0;
// 	  }
// 
// 	  //loop through each 64 bit chunk of the message
// 	  while (m < len) {
// 	    left = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
// 	    right = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
// 
// 	    //for Cipher Block Chaining mode, xor the message with the previous result
// 	    if (mode == 1) {if (encrypt) {left ^= cbcleft; right ^= cbcright;} else {cbcleft2 = cbcleft; cbcright2 = cbcright; cbcleft = left; cbcright = right;}}
// 
// 	    //first each 64 but chunk of the message must be permuted according to IP
// 	    temp = ((left >>>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
// 	    temp = ((left >>>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
// 	    temp = ((right >>>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
// 	    temp = ((right >>>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
// 	    temp = ((left >>>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
// 
// 	    left = ((left << 1) | (left >>>> 31)); 
// 	    right = ((right << 1) | (right >>>> 31)); 
// 
// 	    //do this either 1 or 3 times for each chunk of the message
// 	    for (j=0; j<iterations; j+=3) {
// 	      endloop = looping[j+1];
// 	      loopinc = looping[j+2];
// 	      //now go through and perform the encryption or decryption  
// 	      for (i=looping[j]; i!=endloop; i+=loopinc) { //for efficiency
// 	        right1 = right ^ keys[i]; 
// 	        right2 = ((right >>>> 4) | (right << 28)) ^ keys[i+1];
// 	        //the result is attained by passing these bytes through the S selection functions
// 	        temp = left;
// 	        left = right;
// 	        right = temp ^ (spfunction2[(right1 >>>> 24) & 0x3f] | spfunction4[(right1 >>>> 16) & 0x3f]
// 	              | spfunction6[(right1 >>>>  8) & 0x3f] | spfunction8[right1 & 0x3f]
// 	              | spfunction1[(right2 >>>> 24) & 0x3f] | spfunction3[(right2 >>>> 16) & 0x3f]
// 	              | spfunction5[(right2 >>>>  8) & 0x3f] | spfunction7[right2 & 0x3f]);
// 	      }
// 	      temp = left; left = right; right = temp; //unreverse left and right
// 	    } //for either 1 or 3 iterations
// 
// 	    //move then each one bit to the right
// 	    left = ((left >>>> 1) | (left << 31)); 
// 	    right = ((right >>>> 1) | (right << 31)); 
// 
// 	    //now perform IP-1, which is IP in the opposite direction
// 	    temp = ((left >>>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
// 	    temp = ((right >>>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
// 	    temp = ((right >>>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
// 	    temp = ((left >>>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
// 	    temp = ((left >>>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
// 
// 	    //for Cipher Block Chaining mode, xor the message with the previous result
// 	    if (mode == 1) {if (encrypt) {cbcleft = left; cbcright = right;} else {left ^= cbcleft2; right ^= cbcright2;}}
// 	    tempresult += String.fromCharCode ((left>>>>24), ((left>>>>16) & 0xff), ((left>>>>8) & 0xff), (left & 0xff), (right>>>>24), ((right>>>>16) & 0xff), ((right>>>>8) & 0xff), (right & 0xff));
// 
// 	    chunk += 8;
// 	    if (chunk == 512) {result += tempresult; tempresult = ""; chunk = 0;}
// 	  } //for every 8 characters, or 64 bits in the message
// 
// 	  //return the result as an array
// 	  return result + tempresult;
// 	} //end of des
// 
// 	//des_createKeys
// 	//this takes as input a 64 bit key (even though only 56 bits are used)
// 	//as an array of 2 integers, and returns 16 48 bit keys
// 	function des_createKeys (key) {
// 	  //declaring this locally speeds things up a bit
// 	  pc2bytes0  = new Array (0,0x4,0x20000000,0x20000004,0x10000,0x10004,0x20010000,0x20010004,0x200,0x204,0x20000200,0x20000204,0x10200,0x10204,0x20010200,0x20010204);
// 	  pc2bytes1  = new Array (0,0x1,0x100000,0x100001,0x4000000,0x4000001,0x4100000,0x4100001,0x100,0x101,0x100100,0x100101,0x4000100,0x4000101,0x4100100,0x4100101);
// 	  pc2bytes2  = new Array (0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808,0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808);
// 	  pc2bytes3  = new Array (0,0x200000,0x8000000,0x8200000,0x2000,0x202000,0x8002000,0x8202000,0x20000,0x220000,0x8020000,0x8220000,0x22000,0x222000,0x8022000,0x8222000);
// 	  pc2bytes4  = new Array (0,0x40000,0x10,0x40010,0,0x40000,0x10,0x40010,0x1000,0x41000,0x1010,0x41010,0x1000,0x41000,0x1010,0x41010);
// 	  pc2bytes5  = new Array (0,0x400,0x20,0x420,0,0x400,0x20,0x420,0x2000000,0x2000400,0x2000020,0x2000420,0x2000000,0x2000400,0x2000020,0x2000420);
// 	  pc2bytes6  = new Array (0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002,0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002);
// 	  pc2bytes7  = new Array (0,0x10000,0x800,0x10800,0x20000000,0x20010000,0x20000800,0x20010800,0x20000,0x30000,0x20800,0x30800,0x20020000,0x20030000,0x20020800,0x20030800);
// 	  pc2bytes8  = new Array (0,0x40000,0,0x40000,0x2,0x40002,0x2,0x40002,0x2000000,0x2040000,0x2000000,0x2040000,0x2000002,0x2040002,0x2000002,0x2040002);
// 	  pc2bytes9  = new Array (0,0x10000000,0x8,0x10000008,0,0x10000000,0x8,0x10000008,0x400,0x10000400,0x408,0x10000408,0x400,0x10000400,0x408,0x10000408);
// 	  pc2bytes10 = new Array (0,0x20,0,0x20,0x100000,0x100020,0x100000,0x100020,0x2000,0x2020,0x2000,0x2020,0x102000,0x102020,0x102000,0x102020);
// 	  pc2bytes11 = new Array (0,0x1000000,0x200,0x1000200,0x200000,0x1200000,0x200200,0x1200200,0x4000000,0x5000000,0x4000200,0x5000200,0x4200000,0x5200000,0x4200200,0x5200200);
// 	  pc2bytes12 = new Array (0,0x1000,0x8000000,0x8001000,0x80000,0x81000,0x8080000,0x8081000,0x10,0x1010,0x8000010,0x8001010,0x80010,0x81010,0x8080010,0x8081010);
// 	  pc2bytes13 = new Array (0,0x4,0x100,0x104,0,0x4,0x100,0x104,0x1,0x5,0x101,0x105,0x1,0x5,0x101,0x105);
// 
// 	  //how many iterations (1 for des, 3 for triple des)
// 	  var iterations = key.length > 8 ? 3 : 1; //changed by Paul 16/6/2007 to use Triple DES for 9+ byte keys
// 	  //stores the return keys
// 	  var keys = new Array (32 * iterations);
// 	  //now define the left shifts which need to be done
// 	  var shifts = new Array (0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
// 	  //other variables
// 	  var leftemp, righttemp, m=0, n=0, temp;
// 
// 	  for (var j=0; j<iterations; j++) { //either 1 or 3 iterations
// 	    left = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
// 	    right = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
// 
// 	    temp = ((left >>>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
// 	    temp = ((right >>>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
// 	    temp = ((left >>>> 2) ^ right) & 0x33333333; right ^= temp; left ^= (temp << 2);
// 	    temp = ((right >>>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
// 	    temp = ((left >>>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
// 	    temp = ((right >>>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
// 	    temp = ((left >>>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
// 
// 	    //the right side needs to be shifted and to get the last four bits of the left side
// 	    temp = (left << 8) | ((right >>>> 20) & 0x000000f0);
// 	    //left needs to be put upside down
// 	    left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>>> 8) & 0xff00) | ((right >>>> 24) & 0xf0);
// 	    right = temp;
// 
// 	    //now go through and perform these shifts on the left and right keys
// 	    for (var i=0; i < shifts.length; i++) {
// 	      //shift the keys either one or two bits to the left
// 	      if (shifts[i]) {left = (left << 2) | (left >>>> 26); right = (right << 2) | (right >>>> 26);}
// 	      else {left = (left << 1) | (left >>>> 27); right = (right << 1) | (right >>>> 27);}
// 	      left &= -0xf; right &= -0xf;
// 
// 	      //now apply PC-2, in such a way that E is easier when encrypting or decrypting
// 	      //this conversion will look like PC-2 except only the last 6 bits of each byte are used
// 	      //rather than 48 consecutive bits and the order of lines will be according to 
// 	      //how the S selection functions will be applied: S2, S4, S6, S8, S1, S3, S5, S7
// 	      leftemp = pc2bytes0[left >>>> 28] | pc2bytes1[(left >>>> 24) & 0xf]
// 	              | pc2bytes2[(left >>>> 20) & 0xf] | pc2bytes3[(left >>>> 16) & 0xf]
// 	              | pc2bytes4[(left >>>> 12) & 0xf] | pc2bytes5[(left >>>> 8) & 0xf]
// 	              | pc2bytes6[(left >>>> 4) & 0xf];
// 	      righttemp = pc2bytes7[right >>>> 28] | pc2bytes8[(right >>>> 24) & 0xf]
// 	                | pc2bytes9[(right >>>> 20) & 0xf] | pc2bytes10[(right >>>> 16) & 0xf]
// 	                | pc2bytes11[(right >>>> 12) & 0xf] | pc2bytes12[(right >>>> 8) & 0xf]
// 	                | pc2bytes13[(right >>>> 4) & 0xf];
// 	      temp = ((righttemp >>>> 16) ^ leftemp) & 0x0000ffff; 
// 	      keys[n++] = leftemp ^ temp; keys[n++] = righttemp ^ (temp << 16);
// 	    }
// 	  } //for each iterations
// 	  //return the keys we've created
// 	  return keys;
// 	} //end of des_createKeys
// 		
// 	return {
// 		encrypt : function(key, message) { return des(key, message, 1, 0); }
// 	}	
// })();
// 
