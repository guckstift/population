import {createDataTex, updateDataTex} from "./utils.js";
import {gl} from "./display.js";

export default class DataTex
{
	constructor(width, height)
	{
		this.width = width;
		this.height = height;
		this.outdated = false;
		this.tex = createDataTex(gl, width, height);
		this.data = new Uint8Array(4 * width * height);
	}
	
	bind()
	{
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
	
		return this;
	}
	
	set(p, offs, data)
	{
		let offset = 4 * (p[1] * this.width + p[0]) + offs;
		
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
	
	get(p, offs)
	{
		let offset = 4 * (p[1] * this.width + p[0]) + offs;
		
		return this.data[offset];
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
