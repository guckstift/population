function Texture(display)
{
	display = display || window.display;
	
	var gl = display.gl;
	
	this.display = display;
	this.gl = display.gl;
	this.tex = this.gl.createTexture();

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
		
		return this;
	},

};

loader.textures = {};

loader.texture = function(url, callback, display)
{
	var name = this.urlToName(url);
	
	callback = callback || noop;
	display = display || window.display;

	if(this.textures[name]) {
		callback();
	}

	this.image(url, imageLoad.bind(this));

	return this;
	
	function imageLoad()
	{
		var img = this.images[name];
		var tex = new Texture(display).fromImage(img);
		this.textures[name] = tex;
		callback();
	}
};
