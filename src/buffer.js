var STATIC  = 0;
var DYNAMIC = 1;
var STREAM  = 2;

var BYTE   = 0;
var SHORT  = 1;
var UBYTE  = 2;
var USHORT = 3;
var FLOAT  = 4;

class Buffer
{
	constructor(display, usage, type, isindex, lenOrData)
	{
		var gl         = display.gl;
		var usages     = [gl.STATIC_DRAW, gl.DYNAMIC_DRAW, gl.STREAM_DRAW];
		var arraytypes = [Int8Array, Int16Array, Uint8Array, Uint16Array, Float32Array];
		var gltypes    = [gl.BYTE, gl.SHORT, gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT, gl.FLOAT];
		
		this.display   = display;
		this.buf       = gl.createBuffer();
		this.usage     = usages[usage];
		this.arraytype = arraytypes[type];
		this.gltype    = gltypes[type];
		this.target    = isindex ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
		
		if(typeof lenOrData === "number") {
			this.resize(lenOrData);
		}
		else if(Array.isArray(lenOrData)) {
			this.resize(lenOrData.length);
			this.set(0, lenOrData);
		}
	}
	
	resize(len)
	{
		var gl   = this.display.gl;
		var data = new this.arraytype(len);
	
		if(this.data) {
			data.set(this.data.subarray(0, min(this.len, len)));
		}
	
		this.data = data;
		this.len  = len;
	
		gl.bindBuffer(this.target, this.buf);
		gl.bufferData(this.target, this.data, this.usage);
	
		this.invalidrange = [this.len, 0];
	
		return this;
	}
	
	set(offset, data)
	{
		this.data.set(data, offset);
	
		this.invalidrange = [
			min(this.invalidrange[0], offset),
			max(this.invalidrange[1], offset + data.length),
		];
	
		return this;
	}
	
	update()
	{
		var gl = this.display.gl;
	
		if(this.invalidrange[0] < this.invalidrange[1]) {
			gl.bindBuffer(this.target, this.buf);
	
			gl.bufferSubData(
				this.target,
				this.invalidrange[0] * this.arraytype.BYTES_PER_ELEMENT,
				this.data.subarray(this.invalidrange[0], this.invalidrange[1])
			);
	
			this.invalidrange = [this.len, 0];
		}
	
		return this;
	}
}
