function Buffer(type, indexBuf, disp)
{
	disp = disp || display;
	
	var gl = disp.gl;
	
	this.display = disp;
	this.gl = disp.gl;
	this.type = type;
	this.indexBuf = indexBuf || false;
	this.target = this.indexBuf ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
	this.buf = this.gl.createBuffer();
	this.len = 0;
	this.data = null;
	this.invalidRange = [0, 0];
	
	this.arraytype = (
		type === "byte" ? Int8Array :
		type === "short" ? Int16Array :
		type === "ubyte" ? Uint8Array :
		type === "ushort" ? Uint16Array :
		type === "float" ? Float32Array :
		null
	);
	
	this.gltype = (
		type === "byte" ? gl.BYTE :
		type === "short" ? gl.SHORT :
		type === "ubyte" ? gl.UNSIGNED_BYTE :
		type === "ushort" ? gl.UNSIGNED_SHORT :
		type === "float" ? gl.FLOAT :
		null
	);
	
	if(this.arraytype === null) {
		throw "Error: unknown buffer type given";
	}
}

Buffer.prototype = {

	constructor: Buffer,
	
	resize: function(len)
	{
		var gl = this.gl;
		
		data = new this.arraytype(len);
		
		if(this.data !== null) {
			data.set(this.data.subarray(0, min(this.len, len)));
		}
		
		this.data = data;
		this.len = len;
		
		gl.bindBuffer(this.target, this.buf);
		gl.bufferData(this.target, this.data, gl.STATIC_DRAW);
		
		this.invalidRange = [this.len, 0];
		
		return this;
	},
	
	update: function()
	{
		var gl = this.gl;
		
		if(this.invalidRange[0] < this.invalidRange[1]) {
			gl.bindBuffer(this.target, this.buf);
		
			gl.bufferSubData(
				this.target, this.invalidRange[0] * this.arraytype.BYTES_PER_ELEMENT,
				this.data.subarray(this.invalidRange[0], this.invalidRange[1])
			);
		
			this.invalidRange = [this.len, 0];
		}
		
		return this;
	},
	
	set: function(offset, array)
	{
		offset = offset || 0;
		array = Array.isArray(array) ? array : [array];
		
		this.data.set(array, offset);
		
		this.invalidRange = [
			min(this.invalidRange[0], offset),
			max(this.invalidRange[1], offset + array.length),
		];
		
		return this;
	},

};

Buffer.fromArray = function(type, array, indexBuf, disp)
{
	return new Buffer(type, indexBuf, disp).resize(array.length).set(0, array);
};

Buffer.ofSize = function(type, size, indexBuf, disp)
{
	return new Buffer(type, indexBuf, disp).resize(size);
};
