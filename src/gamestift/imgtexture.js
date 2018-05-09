export default class ImgTexture
{
	constructor(display, img)
	{
		//console.log("texture", img.src);
		
		var gl = display.gl;
		
		this.display = display;
		this.tex     = gl.createTexture();
		this.size    = [img.width, img.height];
		
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	}
	
	update()
	{
	}
}
