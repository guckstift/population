import math from "./math.js";

var bpp = {alpha: 1, rgb: 3, rgba: 4, luminance: 1, luminancealpha: 2};

export default class DataTexture
{
	constructor(display, width, height, format, data)
	{
		var gl = display.gl;
		
		var formats = {
			alpha: gl.ALPHA, rgb: gl.RGB, rgba: gl.RGBA,
			luminance: gl.LUMINANCE, luminancealpha: gl.LUMINANCE_ALPHA,
		};
		
		this.display = display;
		this.tex     = gl.createTexture();
		this.size    = [width, height];
		this.data    = new Uint8Array(data === undefined ? bpp[format] * width * height : data);
		this.format  = formats[format];
		this.bpp     = bpp[format];
		this.bpr     = this.bpp * this.size[0];
		
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		
		gl.texImage2D(
			gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, gl.UNSIGNED_BYTE,
			this.data
		);
		
		this.invalidrows = [height, 0];
	}
	
	set(x, y, pixel)
	{
		this.data.set(pixel, (x + y * this.size[0]) * this.bpp);
		
		this.invalidrows = [
			math.min(this.invalidrows[0], y),
			math.max(this.invalidrows[1], y + 1),
		];
	
		return this;
	}
	
	get(x, y)
	{
		var i = (x + y * this.size[0]) * this.bpp;
		
		return this.data.subarray(i, i + this.bpp);
	}
	
	update()
	{
		var gl = this.display.gl;
		
		if(this.invalidrows[0] < this.invalidrows[1]) {
			gl.bindTexture(gl.TEXTURE_2D, this.tex);
	
			gl.texSubImage2D(
				gl.TEXTURE_2D, 0, 0, this.invalidrows[0],
				this.size[0], this.invalidrows[1] - this.invalidrows[0],
				this.format, gl.UNSIGNED_BYTE,
				this.data.subarray(this.invalidrows[0] * this.bpr, this.invalidrows[1] * this.bpr)
			);
	
			this.invalidrows = [this.size[1], 0];
			console.log("update");
		}
	
		return this;
	}
}
