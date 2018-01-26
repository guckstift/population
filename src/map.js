/*

	local coord - a 2d vertex coordinate local to a chunk
	linear local coord - a 1d vertex coordinate local to a chunk
	global coord - an absolute 2d vertex coordinate
	linear global coord - a absolute 1d vertex coordinate

*/

function Map()
{
	this.gen = mapgen;
	
	this.chunkDims = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	};
	
	this.chunks = [];
	this.shader = cache.shaders.map;//coord;
	this.mapCoords = new Buffer("short").resize(this.numVerts * 2);
	this.indices = new Buffer("ushort", true).resize(this.numIndices);
	
	for(var y=0; y < this.numVertRows; y++) {
		for(var x=0; x < this.numVertsPerRow; x++) {
			var i = this.linearLocalCoord(x, y);
			this.mapCoords.set(i * 2 + 0, x);
			this.mapCoords.set(i * 2 + 1, y);
		}
	}
	
	for(var y=0, i=0; y < this.numTriaRows; y++) {
		var evenRow = y % 2 === 0;
		var oddRow = !evenRow;
		
		for(var x=0; x < this.numTriasPerRow; x++) {
			var isDownPointing = evenRow && x % 2 == 0 || oddRow && x % 2 == 1;
			var isUpPointing = !isDownPointing;
			
			this.indices.set(i++, (y + isUpPointing) * this.numVertsPerRow + floor(x/2));
			
			if(x == 0 && y > 0) {
				this.indices.set(i++, this.indices.data[i-2]);
			}
		}
		
		this.indices.set(i++, (y + 1 + oddRow) * this.numVertsPerRow - 1);
		this.indices.set(i++, (y + 1 + evenRow) * this.numVertsPerRow - 1);
		
		if(y < this.numTriaRows - 1) {
			this.indices.set(i++, this.indices.data[i-2]);
		}
	}
	
	this.mapCoords.update();
	this.indices.update();
}

Map.prototype = {

	constructor: Map,
	
	linearLocalCoord: function(x, y)
	{
		x = clamp(0, this.numVertsPerRow - 1, x);
		y = clamp(0, this.numVertRows - 1, y);
		return y * this.numVertsPerRow + x;
	},
	
	chunkCoord: function(x, y)
	{
		return [
			floor(x / (this.numVertsPerRow - 1)),
			floor(y / (this.numVertRows - 1)),
		];
	},
	
	localCoord: function(x, y)
	{
		return [
			x % (this.numVertsPerRow - 1),
			y % (this.numVertRows - 1),
		];
	},
	
	globalCoord: function(cx, cy, lx, ly)
	{
		return [
			cx * (this.numVertsPerRow - 1) + lx,
			cy * (this.numVertRows - 1) + ly,
		];
	},
	
	leftUpFrom: function(x, y)
	{
		return [x - 1 + (y % 2), y - 1];
	},
	
	rightUpFrom: function(x, y)
	{
		return [x + (y % 2), y - 1];
	},
	
	leftDownFrom: function(x, y)
	{
		return [x - 1 + (y % 2), y + 1];
	},
	
	rightDownFrom: function(x, y)
	{
		return [x + (y % 2), y + 1];
	},
	
	mapToWorld: function(mapCoord, height)
	{
		var worldPos;
	
		worldPos = [mapCoord[0], mapCoord[1], height / 3];
		worldPos[0] += 0.5 * (mapCoord[1] % 2);
		worldPos[1] *= this.triaHeight;
	
		return worldPos;
	},
	
	mapToScreen: function(x, y)
	{
		return [
			display.width / 2 + (x + y % 2 * 0.5 - camera.pos[0]) * camera.zoom,
			display.height / 2 + (y / 2 - camera.pos[1]) * camera.zoom,
		];
	},
	
	screenToWorldGround: function(x, y)
	{
		return [
			1 * (camera.pos[0] + (x - display.width  / 2) / camera.zoom),
			2 * (camera.pos[1] + (y - display.height / 2) / camera.zoom) * this.triaHeight,
		];
	},

	getVertex: function(x, y)
	{
		var chunkCoord = this.chunkCoord(x, y);
		var localCoord = this.localCoord(x, y);
		var chunk = this.getChunk(chunkCoord[0], chunkCoord[1]);
		var linearCoord = this.linearLocalCoord(localCoord[0], localCoord[1]);
		
		if(chunk !== undefined) {
			return this.mapToWorld([x, y], chunk.heights.data[linearCoord]);
		}
		else {
			return this.mapToWorld([x, y], 0);
		}
		
		var i = map.linearLocalCoord(x, y);
		return this.mapToWorld([x, y], this.heights.data[i]);
	},
	
	draw: function()
	{
		this.shader.setAttribute("aMapCoord", this.mapCoords);
		this.shader.setIndices(this.indices);
		
		this.shader.setUniform("uChunkSize", this.chunkSize);
		this.shader.setUniform("uScreenSize", [display.width, display.height]);
		this.shader.setUniform("uZoom", camera.zoom);
		this.shader.setUniform("uCameraPos", camera.pos);
		this.shader.setUniform("uSun", this.sun);
		
		this.shader.resetTextures();
		this.shader.setTexture("uTex", cache.gfx.terrain_png);
		
		for(var y=0; y < this.chunks.length; y++) {
			var chunkRow = this.chunks[y];
			
			for(var x=0; x < chunkRow.length; x++) {
				var chunk = chunkRow[x];
				
				if(chunk !== undefined) {
					chunk.draw();
				}
			}
		}
	},
	
	getChunk: function(x, y)
	{
		if(
			x >= this.chunkDims.left && y >= this.chunkDims.top &&
			x < this.chunkDims.right && y < this.chunkDims.bottom
		) {
			return this.chunks[y - this.chunkDims.top][x - this.chunkDims.left];
		}
		
		return undefined;
	},
	
	setChunk: function(x, y, chunk)
	{
		this.chunks[y - this.chunkDims.top][x - this.chunkDims.left] = chunk;
	},
	
	addChunk: function(x, y)
	{
		if(x < this.chunkDims.left) {
			this.expandLeft(x);
		}
		if(y < this.chunkDims.top) {
			this.expandTop(y);
		}
		if(x >= this.chunkDims.right) {
			this.expandRight(x + 1);
		}
		if(y >= this.chunkDims.bottom) {
			this.expandBottom(y + 1);
		}
		
		if(this.getChunk(x, y) === undefined) {
			var chunk = new MapChunk(this, x, y);
			this.setChunk(x, y, chunk);
			chunk.updateNormals();
			
			var f = this.getChunk(x - 1, y);
			//if(f) f.updateNormals();
		}
	},
	
	expandLeft: function(left)
	{
		var add = this.chunkDims.left - left;
		
		for(var y=0; y < this.chunks.length; y++) {
			this.chunks[y] = Array(add).concat(this.chunks[y]);
		}
		
		this.chunkDims.left = left;
	},
	
	expandRight: function(right)
	{
		var add = right - this.chunkDims.right;
		
		for(var y=0; y < this.chunks.length; y++) {
			this.chunks[y] = this.chunks[y].concat(Array(add));
		}
		
		this.chunkDims.right = right;
	},
	
	expandTop: function(top)
	{
		var add = this.chunkDims.top - top;
		var width = this.chunkDims.right - this.chunkDims.left;
		
		this.chunks = Array(add).concat(this.chunks);
		
		for(var y=0; y < add; y++) {
			this.chunks[y] = Array(width);
		}
		
		this.chunkDims.top = top;
	},
	
	expandBottom: function(bottom)
	{
		var add = bottom - this.chunkDims.bottom;
		var width = this.chunkDims.right - this.chunkDims.left;
		var height = this.chunkDims.bottom - this.chunkDims.top;
		
		this.chunks = this.chunks.concat(Array(add));
		
		for(var y=height; y < height + add; y++) {
			this.chunks[y] = Array(width);
		}
		
		this.chunkDims.bottom = bottom;
	},
	
};

(function() {

	/*
		a² + b² = c²
		½² + h² = 1²
		¼ + h² = 1
		h² = 1 - ¼
		h = sqrt(1 - ¼)
		h = sqrt(3/4)
		h = sqrt(3) / sqrt(4)
		h = sqrt(3) / 2
	*/
	this.triaHeight = sqrt(3.0) / 2.0;

	/*
		h_i = sqrt(3) / 2
		h_o = ½
		h_i * cos(a) = h_o
		cos(a) = h_o / h_i
		a = acos(h_o / h_i)
		a = acos(½ / (sqrt(3) / 2)) 
		a = acos(1 / sqrt(3))
	*/
	this.viewAngle = acos(1.0 / sqrt(3.0));
	
	this.sun = [0, 0, -1];
	this.sun = vec3rotateX(this.sun, radians(-45));
	this.sun = vec3rotateZ(this.sun, radians(30));

	this.chunkSize = 32;
	this.numVertsPerRow = this.chunkSize + 1;
	this.numVertRows = this.chunkSize * 2 + 1;
	this.numVerts = this.numVertRows * this.numVertsPerRow;
	this.numTriasPerRow = this.chunkSize * 2;
	this.numTriaRows = this.chunkSize * 2;
	this.numTrias = this.numTriaRows * this.numTriasPerRow;
	this.numIndices = (this.numTriasPerRow + 2 + 2) * this.numTriaRows - 2;

}).call(Map.prototype);
