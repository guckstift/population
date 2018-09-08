class Texture
{
	constructor(display)
	{
		var gl = display.gl;
		
		this.display = display;
		this.tex     = gl.createTexture();
		this.size    = [0, 0];
		
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	}
	
	fromArray(width, height, array)
	{
		var gl = this.display.gl;
		
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
			new Uint8Array(array)
		);
		
		this.size = [width, height];
		
		return this;
	}
	
	fromImage(img)
	{
		var gl = this.display.gl;
		
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		
		this.size = [img.width, img.height];
		
		return this;
	}
}
