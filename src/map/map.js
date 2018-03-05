function Map(gl, camera)
{
	if(!(this instanceof Map)) {
		return new Map(gl, camera);
	}
	
	this.gl = gl;
	this.camera = camera;
	this.gen = mapgen;
	this.chunks = Dyn2dArray();
	this.mapCoords = gl.buffer("ubyte", numVerts * 2);
	this.indices = gl.buffer("index", numIndices);
	this.terraTex = gl.texture("gfx/terrain.png");
	this.batch = gl.spritebatch("stream", camera);
	
	this.shader = gl.shaderFromUrl(
		["shaders/utils.glslv", "shaders/map.glslv"],
		["shaders/map.glslf"],
	);
	
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
	
	updateNormal: function(p)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.getChunk(cp);
		
		if(chunk !== undefined) {
			chunk.updateNormal(lp);
		
			if(lp[0] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1]]);
			
				if(chunk !== undefined) {
					chunk.updateNormal([numVertsPerRow - 1, lp[1]]);
				}
			}
		
			if(lp[1] === 0) {
				chunk = this.getChunk([cp[0], cp[1] - 1]);
			
				if(chunk !== undefined) {
					chunk.updateNormal([lp[0], numVertRows - 1]);
				}
			}
		
			if(lp[0] === 0 && lp[1] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1] - 1]);
			
				if(chunk !== undefined) {
					chunk.updateNormal([numVertsPerRow - 1, numVertRows - 1]);
				}
			}
		}
	},
	
	getHeight: function(p)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.getChunk(cp);
		var i = linearLocalCoord(lp);
		
		if(chunk === undefined) {
			if(lp[0] === 0) {
				cp[0] --;
				chunk = this.getChunk(cp);
				lp[0] = numVertsPerRow - 1;
				i = linearLocalCoord(lp);
			}
			else if(lp[1] === 0) {
				cp[1] --;
				chunk = this.getChunk(cp);
				lp[1] = numVertRows - 1;
				i = linearLocalCoord(lp);
			}
		}
		
		return chunk !== undefined ? chunk.heights.data[i] : 0;
	},
	
	setHeight: function(p, h)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.getChunk(cp);
		var i = linearLocalCoord(lp);
		
		if(chunk === undefined) {
			return false;
		}
		
		chunk.heights.set(i, h);
		
		if(chunk.objs[i]) {
			chunk.objs[i].updateSpritePos();
		}
		
		if(lp[0] === 0) {
			chunk = this.getChunk(leftFrom(cp));
			i = linearLocalCoord([numVertsPerRow - 1, lp[1]]);
		
			if(chunk !== undefined) {
				chunk.heights.set(i, h);
			}
		}
		
		if(lp[1] === 0) {
			chunk = this.getChunk(upFrom(cp));
			i = linearLocalCoord([lp[0], numVertRows - 1]);
		
			if(chunk !== undefined) {
				chunk.heights.set(i, h);
			}
		}
	
		if(lp[0] === 0 && lp[1] === 0) {
			chunk = this.getChunk(leftUpFromCartes(cp));
			i = linearLocalCoord([numVertsPerRow - 1, numVertRows - 1]);
		
			if(chunk !== undefined) {
				chunk.heights.set(i, h);
			}
		}
		
		this.updateNormal(p);
		this.updateNormal(leftFrom(p));
		this.updateNormal(rightFrom(p));
		this.updateNormal(leftUpFrom(p));
		this.updateNormal(rightUpFrom(p));
		this.updateNormal(leftDownFrom(p));
		this.updateNormal(rightDownFrom(p));
		
		return true;
	},
	
	raiseHeight: function(p, dry)
	{
		dry = dry || false;
		
		var h = this.getHeight(p);
		var adj = allAdjacent(p);
		
		h++;
		
		var ok = this.setHeight(p, h);
		
		if(!ok) {
			return false;
		}
		
		for(var i=0; i<adj.length; i++) {
			var pa = adj[i];
			var ah = this.getHeight(pa);
			
			if(h > ah) {
				var ok = this.raiseHeight(pa);
			}
		}
		
		return true;
	},
	
	getTerra: function(p)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.getChunk(cp);
		var i = linearLocalCoord(lp);
		
		return chunk !== undefined ? chunk.terra.data[i] : 0;
	},
	
	setTerra: function(p, t)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.getChunk(cp);
		var i = linearLocalCoord(lp);
		
		if(chunk !== undefined) {
			chunk.terra.set(i, t);
		
			if(lp[0] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1]]);
				i = linearLocalCoord([numVertsPerRow - 1, lp[1]]);
			
				if(chunk !== undefined) {
					chunk.terra.set(i, t);
				}
			}
		
			if(lp[1] === 0) {
				chunk = this.getChunk([cp[0], cp[1] - 1]);
				i = linearLocalCoord([lp[0], numVertRows - 1]);
			
				if(chunk !== undefined) {
					chunk.terra.set(i, t);
				}
			}
		
			if(lp[0] === 0 && lp[1] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1] - 1]);
				i = linearLocalCoord([numVertsPerRow - 1, numVertRows - 1]);
			
				if(chunk !== undefined) {
					chunk.terra.set(i, t);
				}
			}
		}
	},
	
	getObj: function(p)
	{
		var cp = chunkCoord(p);
		var lp = localCoord(p);
		var chunk = this.chunks.get(cp);
		var i = linearLocalCoord(lp);
		
		if(chunk === undefined) {
			return undefined;
		}
		
		return chunk.objs[i];
	},

	getVertex: function(p)
	{
		return mapToWorld(vec2vec3(p, this.getHeight(p)));
	},
	
	getScreenVertex: function(p)
	{
		return worldToScreen(this.getVertex(p));
	},
	
	getObjSpritePos: function(p)
	{
		return worldToSpriteSpace(this.getVertex(p));
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
			chunk.init();
			chunk.updateNormals();
			
			var f = this.getChunk([p[0] - 1, p[1]]);
			if(f) f.updateNormalsRightEdge();
			
			var f = this.getChunk([p[0], p[1] - 1]);
			if(f) f.updateNormalsBottomEdge();
			
			var f = this.getChunk([p[0] + 1, p[1]]);
			if(f) f.updateNormalsLeftEdge();
			
			var f = this.getChunk([p[0], p[1] + 1]);
			if(f) f.updateNormalsTopEdge();
			
			var f = this.getChunk([p[0] + 1, p[1] + 1]);
			if(f) f.updateNormal([0, 0]);
		}
	},
	
	draw: function()
	{
		this.shader
			.mode("trianglestrip")
			.indices(this.indices)
			.assign("uChunkSize", chunkSize)
			.assign("uScreenSize", gl.size)
			.assign("uStdDefZoom", stdDefZoom)
			.assign("uZoom", this.camera.zoom)
			.assign("uCameraPos", this.camera.pos)
			.assign("uSun", sun)
			.assign("uTex", this.terraTex)
			.assign("aMapCoord", this.mapCoords);
		
		this.chunks.each(function(chunk, x, y) {
			chunk.drawTerra();
		});
		
		this.batch.clear();
		
		var leftTop = pickMapCoord([0, 0]);
		var rightBottom = pickMapCoord(gl.size);
		
		for(var y = leftTop[1]; y < rightBottom[1]; y++) {
			for(var x = leftTop[0]; x < rightBottom[0]; x++) {
				var obj = this.getObj([x, y]);
				
				if(obj) {
					this.batch.add(obj.sprite);
				}
			}
		}
		
		this.batch.draw();
	},
	
};
