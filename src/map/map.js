function Map()
{
	this.gen = mapgen;
	this.chunks = new Dyn2dArray();
	this.shader = cache.shaders.map;
	this.mapCoords = new Buffer("short").resize(numVerts * 2);
	this.indices = new Buffer("ushort", true).resize(numIndices);
	this.objVerts = Buffer.fromArray("byte", [0, 1, 2, 3]);
	
	// generate map coords for a chunk
	for(var y=0; y < numVertRows; y++) {
		for(var x=0; x < numVertsPerRow; x++) {
			this.mapCoords.set(linearLocalCoord([x, y]) * 2, [x, y]);
		}
	}
	
	// generate indices for a chunk
	for(var y=0, i=0; y < numTriaRows; y++) {
		var evenRow = y % 2 === 0;
		var oddRow = !evenRow;
		
		for(var x=0; x < numTriasPerRow; x++) {
			var isDownPointing = evenRow && x % 2 == 0 || oddRow && x % 2 == 1;
			var isUpPointing = !isDownPointing;
			
			this.indices.set(i++, (y + isUpPointing) * numVertsPerRow + floor(x / 2));
			
			if(x == 0 && y > 0) {
				this.indices.set(i++, this.indices.data[i - 2]);
			}
		}
		
		this.indices.set(i++, (y + 1 + oddRow) * numVertsPerRow - 1);
		this.indices.set(i++, (y + 1 + evenRow) * numVertsPerRow - 1);
		
		if(y < numTriaRows - 1) {
			this.indices.set(i++, this.indices.data[i - 2]);
		}
	}
}

Map.prototype = {

	constructor: Map,
	
	getHeight: function(p)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.getChunk(cp);
		var i = linearLocalCoord(lp);
		
		return chunk === undefined ? 0 : chunk.heights.data[i];
	},
	
	setHeight: function(p, h)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.getChunk(cp);
		var i = linearLocalCoord(lp);
		
		if(chunk !== undefined) {
			chunk.heights.set(i, h);
		}
	},

	getVertex: function(p)
	{
		return mapToWorld(vec2vec3(p, this.getHeight(p)));
	},
	
	draw: function()
	{
		this.shader.setAttribute("aMapCoord", this.mapCoords);
		this.shader.setIndices(this.indices);
		
		this.shader.setUniform("uChunkSize", chunkSize);
		this.shader.setUniform("uScreenSize", [display.width, display.height]);
		this.shader.setUniform("uZoom", camera.zoom);
		this.shader.setUniform("uCameraPos", camera.pos);
		this.shader.setUniform("uSun", sun);
		
		this.shader.resetTextures();
		this.shader.setTexture("uTex", cache.gfx.terrain_png);
		
		this.chunks.each(function(chunk, x, y) {
			chunk.drawTerra();
		});
		
		var gl = display.gl;
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.GEQUAL);
		gl.clearDepth(-1);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		
		this.chunks.each(function(chunk, x, y) {
			chunk.drawObjs();
		});
		
		gl.disable(gl.DEPTH_TEST);
	},
	
	getChunk: function(p)
	{
		return this.chunks.get(p);
	},
	
	setChunk: function(p, chunk)
	{
		this.chunks.set(p, chunk);
	},
	
	addChunk: function(p)
	{
		if(this.getChunk(p) === undefined) {
			var chunk = new Chunk(this, p);
			this.setChunk(p, chunk);
			chunk.updateNormals();
			
			var f = this.getChunk([p[0] - 1, p[1]]);
			if(f) f.updateNormals();
		}
	},
	
	addObj: function(obj)
	{
		var cp = chunkCoord(obj.pos);
		
		this.chunks.get(cp).objchunk.add(obj);
	},
	
};
