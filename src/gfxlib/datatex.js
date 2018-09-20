import {createDataTex, updateDataTex} from "./utils.js";
import {gl} from "./display.js";

export default class DataTex
{
	constructor(width, height)
	{
		this.width = width;
		this.height = height;
		this.outdated = false;
		this.tex = createTex(gl, width, height);
		this.data = new Uint8ClampedArray(4 * width * height);
	}
	
	bind()
	{
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
	
		return this;
	}
	
	set(p, offs, data)
	{
		let offset = 4 * (p[1] * this.width + this.height) + offs;
		
		if(typeof data.length === "number") {
			this.data.set(data, offset);
			data = data.length;
		}
		else {
			this.data[offset] = data;
			data = 1;
		}
		
		this.outdated = true;
	
		return this;
	}
	
	update()
	{
		if(this.outdated) {
			updateDataTex(gl, this.tex, this.width, this.height, this.data);
			this.outdated = false;
		}
		
		return this;
	}
}
