function Map()
{
	this.chunkDims = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	};
	
	this.chunks = [];
}

Map.prototype = {

	constructor: Map,
	
	randAt: function(cx, cy, x, y)
	{
		fx = x % (this.numVertsPerRow - 1);
		fy = y % (this.numVertRows - 1);
		cx += x === this.numVertsPerRow - 1;
		cy += y === this.numVertRows - 1;
		
		var ax = cx * (this.numVertsPerRow - 1) + fx;
		var ay = cy * (this.numVertRows - 1) + fy;
		
		Math.seedrandom(ay * 1000 + ax);
		
		return Math.random();
	},
	
	draw: function()
	{
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
		return this.chunks[y - this.chunkDims.top][x - this.chunkDims.left];
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
			this.setChunk(x, y, new MapChunk(this, x, y));
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

	this.size = 32;
	this.numVertsPerRow = this.size + 1;
	this.numVertRows = this.size * 2 + 1;
	this.numVerts = this.numVertRows * this.numVertsPerRow;
	this.numTriasPerRow = this.size * 2;
	this.numTriaRows = this.size * 2;
	this.numTrias = this.numTriaRows * this.numTriasPerRow;
	this.numIndices = (this.numTriasPerRow + 2 + 2) * this.numTriaRows - 2;

}).call(Map.prototype);
