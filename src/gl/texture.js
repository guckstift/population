var texGidCounter = 0;

function Texture(disp)
{
	disp = disp || display;
	
	var gl = disp.gl;
	
	this.gid = texGidCounter++;
	this.display = disp;
	this.gl = disp.gl;
	this.tex = this.gl.createTexture();
	this.img = null;
	this.size = [0, 0];

	gl.bindTexture(gl.TEXTURE_2D, this.tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
};

Texture.prototype = {

	constructor: Texture,
	
	fromImage: function(image)
	{
		var gl = this.gl;
	
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		
		this.img = image;
		this.size = [image.width, image.height];
		
		return this;
	},

};

loader.texture = function(url, callback, disp)
{
	function imageLoad()
	{
		var img = this.getItem(url);
		var tex = new Texture(disp).fromImage(img);
		this.setItem(url, tex);
		callback();
	}
	
	callback = callback || noop;
	disp = disp || display;

	if(this.getItem(url) !== undefined) {
		callback();
	}

	this.image(url, imageLoad.bind(this));

	return this;
};
