function ObjChunk(chunk)
{
	this.chunk = chunk;
	this.map = chunk.map;
	this.shader = cache.shaders.obj;
	this.texTable = {};
	this.textures = [];
	this.texCount = 0;
	this.objs = Array(numVerts);
	this.data = Buffer.ofSize("float", numVerts * objBlockLength);
	
	for(var x=0; x < chunkWidth; x++) {
		for(var y=0; y < chunkHeight; y++) {
			if(random() < 0.125) {
				this.add(new Obj(cache.frames.tree_png, [x, y]));
			}
		}
	}
}

ObjChunk.prototype = {

	constructor: ObjChunk,
	
	add: function(obj)
	{
		var i = linearLocalCoord(obj.pos);
		
		this.objs[i] = obj;
		this.objs[i].attachChunk(this);
		this.updateData(obj);
	},
	
	remove: function(obj)
	{
		var i = linearLocalCoord(obj.pos);
		
		this.objs[i].attachChunk();
		this.objs[i] = undefined;
		this.updateData(obj);
	},
	
	updateData: function(obj)
	{
		var i = linearLocalCoord(obj.pos);
		
		if(this.texTable[obj.frame.texgid] === undefined) {
			this.texTable[obj.frame.texgid] = {
				id: this.texCount,
				tex: obj.frame.texture,
			};
			
			this.textures.push(obj.frame.texture);
			this.texCount++;
		}
		
		var texId = this.texTable[obj.frame.texgid].id;
		
		this.data.set(
			i * objBlockLength, [
			obj.pos[0],
			obj.pos[1],
			obj.frame.size[0],
			obj.frame.size[1],
			obj.frame.anchor[0],
			obj.frame.anchor[1],
			obj.frame.texcoordpos[0],
			obj.frame.texcoordpos[1],
			obj.frame.texcoordsize[0],
			obj.frame.texcoordsize[1],
			texId,
		]);
	},
	
	draw: function()
	{
		var shader = this.shader;
		var stride = objBlockLength * 4;
		var data = this.data;
		
		shader.setAttribute("aVert", this.map.objVerts);
		shader.setAttribute("aPos", data, stride, 0 * 4, 1);
		shader.setAttribute("aSize", data, stride, 2 * 4, 1);
		shader.setAttribute("aAnchor", data, stride, 4 * 4, 1);
		shader.setAttribute("aTexCoordPos", data, stride, 6 * 4, 1);
		shader.setAttribute("aTexCoordSize", data, stride, 8 * 4, 1);
		shader.setAttribute("aTexId", data, stride, 10 * 4, 1);
		shader.setAttribute("aHeight", this.chunk.heights, 0, 0, 1);
		
		shader.setUniform("uChunkSize", chunkSize);
		shader.setUniform("uChunkCoord", this.chunk.pos);
		shader.setUniform("uScreenSize", [display.width, display.height]);
		shader.setUniform("uCameraPos", camera.pos);
		shader.setUniform("uDefZoom", camera.defzoom);
		shader.setUniform("uZoom", camera.zoom);
		
		shader.resetTextures();
		shader.setTextureArray("uTextures", this.textures);
		
		shader.drawTriangleStrip(4, numVerts);
	},

};
