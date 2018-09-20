import {gl} from "./display.js";

const usages = {
	"static":  gl.STATIC_DRAW,
	"dynamic": gl.DYNAMIC_DRAW,
	"stream":  gl.STREAM_DRAW,
};

const types = {
	"byte":   {arrayType: Int8Array,    glType: gl.BYTE},
	"short":  {arrayType: Int16Array,   glType: gl.SHORT},
	"ubyte":  {arrayType: Uint8Array,   glType: gl.UNSIGNED_BYTE},
	"ushort": {arrayType: Uint16Array,  glType: gl.UNSIGNED_SHORT},
	"float":  {arrayType: Float32Array, glType: gl.FLOAT},
};

export default class Buffer
{
	constructor(index = false, usage = "static", type = index ? "ushort" : "float", len = 0)
	{
		this.index = index;
		this.usage = usage;
		this.type = type;
		this.buf = gl.createBuffer();
		this.arrayType = types[type].arrayType;
		this.bytesPerElm = this.arrayType.BYTES_PER_ELEMENT;
		this.glType = types[type].glType;
		this.glUsage = usages[usage];
		this.target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
		this.invalidRange = [0, 0];
		
		this.resize(len);
	}
	
	bind()
	{
		gl.bindBuffer(this.target, this.buf);
	
		return this;
	}
	
	resize(len)
	{
		let data = new this.arrayType(len);
	
		if(this.data) {
			data.set(this.data.subarray(0, Math.min(this.len, len)));
		}
	
		this.data = data;
		this.len = len;
		
		this.bind();
		gl.bufferData(this.target, this.data, this.glUsage);
		
		this.invalidRange[0] = this.len;
		this.invalidRange[1] = 0;
		
		return this;
	}
	
	set(offset, data)
	{
		if(typeof data.length === "number") {
			this.data.set(data, offset);
			data = data.length;
		}
		else {
			this.data[offset] = data;
			data = 1;
		}
	
		this.invalidRange[0] = Math.min(this.invalidRange[0], offset);
		this.invalidRange[1] = Math.max(this.invalidRange[1], offset + data);
	
		return this;
	}
	
	update(all = false)
	{
		if(all) {
			this.bind();
			gl.bufferSubData(this.target, 0, this.data);
			this.invalidRange[0] = this.len;
			this.invalidRange[1] = 0;
		}
		else {
			let [start, end] = this.invalidRange;
			
			if(start < end) {
				this.bind();
		
				gl.bufferSubData(
					this.target, start * this.bytesPerElm, this.data.subarray(start, end)
				);

				this.invalidRange[0] = this.len;
				this.invalidRange[1] = 0;
			}
		}
	
		return this;
	}
}
