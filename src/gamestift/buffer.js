import math from "./math.js";

var arraytypes = {
	byte: Int8Array, short: Int16Array, ubyte: Uint8Array, ushort: Uint16Array, float: Float32Array
};

export default class Buffer
{
	constructor(display, usage, type, isindex, lenOrData)
	{
		var gl = display.gl;
		
		var usages = {
			"static": gl.STATIC_DRAW, "dynamic": gl.DYNAMIC_DRAW, "stream": gl.STREAM_DRAW
		};
		
		var gltypes = {
			byte: gl.BYTE, short: gl.SHORT,
			ubyte: gl.UNSIGNED_BYTE, ushort: gl.UNSIGNED_SHORT,
			float: gl.FLOAT
		};
		
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
			math.min(this.invalidrange[0], offset),
			math.max(this.invalidrange[1], offset + data.length),
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
