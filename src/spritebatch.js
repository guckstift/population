function SpriteBatch(total)
{
	this.total = total || 640000;
	this.dataBlockLen = 11;
	this.shader = cache.shaders.sprite;
	
	this.count = 0;
	this.texTable = {};
	this.textures = [];
	this.texCount = 0;
	this.sprites = Array(this.total);
	this.vertices = Buffer.fromArray("byte", [0, 1, 2, 3]);
	this.spritedata = new Buffer("float").resize(this.total * this.dataBlockLen);
}

SpriteBatch.prototype = {

	constructor: SpriteBatch,
	
	addSprite: function(sprite)
	{
		var id = this.count;
		
		this.sprites[id] = sprite;
		this.sprites[id].attachBatch(this, this.count);
		this.updateSpriteData(this.sprites[id]);
		this.count++;
	},
	
	removeSprite: function(sprite)
	{
		var id = sprite.id;
		
		this.count --;
		
		if(this.count > id) {
			this.sprites[id] = this.sprites[this.count];
			this.sprites[id].attachBatch(this, id);
			this.updateSpriteData(this.sprites[id]);
		}
	},
	
	updateSpriteData: function(sprite)
	{
		var id = sprite.id;
		
		if(this.texTable[sprite.frame.texgid] === undefined) {
			this.texTable[sprite.frame.texgid] = {
				id: this.texCount,
				tex: sprite.frame.texture,
			};
			
			this.textures.push(sprite.frame.texture);
			this.texCount++;
		}
		
		var texId = this.texTable[sprite.frame.texgid].id;
		
		this.spritedata.set(
			id * this.dataBlockLen, [
			sprite.pos[0],
			sprite.pos[1],
			sprite.frame.size[0],
			sprite.frame.size[1],
			sprite.frame.anchor[0],
			sprite.frame.anchor[1],
			sprite.frame.texcoordpos[0],
			sprite.frame.texcoordpos[1],
			sprite.frame.texcoordsize[0],
			sprite.frame.texcoordsize[1],
			texId,
		]);
	},
	
	draw: function()
	{
		if(this.count === 0) {
			return;
		}
		
		var shader = this.shader;
		var stride = this.dataBlockLen * 4;
		var data = this.spritedata;
		
		shader.setAttribute("aVert", this.vertices);
		shader.setAttribute("aPos", data, stride, 0 * 4, 1);
		shader.setAttribute("aSize", data, stride, 2 * 4, 1);
		shader.setAttribute("aAnchor", data, stride, 4 * 4, 1);
		shader.setAttribute("aTexCoordPos", data, stride, 6 * 4, 1);
		shader.setAttribute("aTexCoordSize", data, stride, 8 * 4, 1);
		shader.setAttribute("aTexId", data, stride, 10 * 4, 1);
		
		shader.setUniform("uScreenSize", [display.width, display.height]);
		shader.setUniform("uCameraPos", camera.pos);
		shader.setUniform("uDefZoom", camera.defzoom);
		shader.setUniform("uZoom", camera.zoom);
		
		shader.resetTextures();
		shader.setTextureArray("uTextures", this.textures);
		
		shader.drawTriangleStrip(4, this.count);
	},

};
