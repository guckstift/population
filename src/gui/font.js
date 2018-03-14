function Font(gl)
{
	if(!(this instanceof Font)) {
		return new Font(gl);
	}
	
	this.gl = gl;
	this.chars = gl.atlas("gfx/chars.json", this.onAtlasReady.bind(this));
	this.ready = false;
}

Font.prototype = {

	constructor: Font,
	
	onAtlasReady: function()
	{
		this.ready = true;
	},
	
	render: function(batch, pos, text)
	{
		if(!this.ready) {
			return [0, 0];
		}
		
		var curx = pos[0];
		var size = [0, 0];
		
		for(var i=0; i<text.length; i++) {
			var ch = text[i];
			var code = ch.charCodeAt(0);
			var frame = this.chars["char-" + code + ".png"];
			var sprite = gl.sprite(frame, [curx - frame.pad[0], pos[1]], [0,0]);
			
			if(ch === " ") {
				curx += 8;
			}
			else {
				curx += frame.size[0] - 1;
				size[1] = max(size[1], frame.size[1] + frame.pad[1]);
			}
			
			batch.add(sprite);
		}
		
		size[0] = curx - pos[0];
		
		return size;
	},

};
