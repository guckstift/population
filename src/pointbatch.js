var pointSpriteBlockLength = 11;

class PointBatch
{
	constructor(map)
	{
		var startCapacity = 16;
		
		this.map       = map;
		this.display   = map.display;
		this.camera    = map.camera;
		this.capacity  = startCapacity;
		this.count     = 0;
		this.textures  = [];
		this.texsizes  = [];
		this.orderFunc = undefined;
		this.sprites   = Array(startCapacity);
		this.shader    = new Shader(this.display, shaderUtils + pointVert, pointFrag);

		this.spritebuf = new Buffer(
			this.display, STREAM, FLOAT, false, startCapacity * pointSpriteBlockLength
		);
	}
	
	textureId(texture)
	{
		var id = this.textures.indexOf(texture);
		
		if(id === -1) {
			this.textures.push(texture);
			this.texsizes.push(texture.size[0]);
			this.texsizes.push(texture.size[1]);
			return this.textures.length - 1;
		}
		
		return id;
	}
	
	clear()
	{
		for(var i=0; i<this.count; i++) {
			this.sprites[i].batch = undefined;
		}
		
		this.count = 0;
		
		return this;
	}
	
	add(sprite)
	{
		if(sprite.batch === this) {
			return this;
		}
		
		var id = this.count;
		
		this.count ++;
		
		if(this.count > this.capacity) {
			this.capacity *= 2;
			this.spritebuf.resize(this.capacity * pointSpriteBlockLength);
		}
		
		this.sprites[id] = sprite;
		this.sprites[id].batch = this;
		this.sprites[id].id = id;
		this.reorder(sprite);
		this.update(sprite);
		
		return this;
	}
	
	update(sprite)
	{
		this.spritebuf.set(sprite.id * pointSpriteBlockLength, [
			sprite.pos[0],
			sprite.pos[1],
			sprite.pos[2],
			sprite.frame.pos[0],
			sprite.frame.pos[1],
			sprite.frame.pad[0],
			sprite.frame.pad[1],
			sprite.frame.size[0],
			sprite.frame.size[1],
			sprite.frame.osize[0],
			this.textureId(sprite.frame.tex),
		]);
		
		return this;
	}
	
	reorder(sprite)
	{
		if(this.orderFunc) {
			while(
				sprite.id < this.count - 1 &&
				this.orderFunc(sprite, this.sprites[sprite.id + 1]) > 0
			) {
				var tmp = this.sprites[sprite.id + 1];
				
				this.sprites[sprite.id + 1] = sprite;
				this.sprites[sprite.id]     = tmp;
				
				sprite.id ++;
				tmp.id --;
				
				this.update(sprite);
				this.update(tmp);
			}
			
			while(
				sprite.id > 0 &&
				this.orderFunc(sprite, this.sprites[sprite.id - 1]) < 0
			) {
				var tmp = this.sprites[sprite.id - 1];
				
				this.sprites[sprite.id - 1] = sprite;
				this.sprites[sprite.id]     = tmp;
				
				sprite.id --;
				tmp.id ++;
				
				this.update(sprite);
				this.update(tmp);
			}
		}
		
		return this;
	}
	
	draw()
	{
		if(this.count === 0) {
			return this;
		}
		
		this.shader
			.use()
			
			.set_uCameraPos(this.camera.pos)
			.set_uScreenSize(this.display.size)
			.set_uStdDefZoom(stdDefZoom)
			.set_uTexSizes(this.texsizes)
			.set_uTextures(this.textures)
			
			.set_aWorldPos(this.spritebuf,  pointSpriteBlockLength * 4, 0 * 4)
			.set_aFramePos(this.spritebuf,  pointSpriteBlockLength * 4, 3 * 4)
			.set_aFramePad(this.spritebuf,  pointSpriteBlockLength * 4, 5 * 4)
			.set_aFrameSize(this.spritebuf, pointSpriteBlockLength * 4, 7 * 4)
			.set_aSize(this.spritebuf,      pointSpriteBlockLength * 4, 9 * 4)
			.set_aTexId(this.spritebuf,     pointSpriteBlockLength * 4,10 * 4)
		;
		
		this.display.setIndices().draw(POINTS, this.count);
		
		return this;
	}
}
