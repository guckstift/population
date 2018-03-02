function Chunk(map, pos)
{
	this.map = map;
	this.pos = pos;
	
	this.heights = gl.buffer("ubyte", numVerts);
	this.terra = gl.buffer("ubyte", numVerts);
	this.coefs = gl.buffer(numVerts);
	this.objs = Array(chunkVerts);
}

(function() {

	this.init = function()
	{
		for(var y=0; y < numVertRows; y++) {
			for(var x=0; x < numVertsPerRow; x++) {
				var p = globalCoord(this.pos, [x, y]);
				var h = map.gen.height(p);
				var t = map.gen.terra(p);
				var i = linearLocalCoord([x, y]);
		
				this.heights.set(i, h);
				this.terra.set(i, t);
			
				if(x === numVertsPerRow - 1 || y === numVertRows - 1) {
					map.setHeight(p, h);
					map.setTerra(p, t);
				}
			}
		}
	
		for(var y=0; y < chunkHeight; y++) {
			for(var x=0; x < chunkWidth; x++) {
				if(random() < 0.0009925) {
					new Obj(this.map, globalCoord(this.pos, [x, y]));
				}
			}
		}
	};

	this.drawTerra = function()
	{
		var shader = this.map.shader;
		
		shader.draw({
			uChunkCoord: this.pos,
			aHeight: this.heights,
			aCoef: this.coefs,
			aTerra: this.terra,
		});
	};
	
	this.updateNormal = function(lp)
	{
		var i = linearLocalCoord(lp);
		var p = globalCoord(this.pos, lp);
		var v = map.getVertex(p);
		var Az = map.getHeight(leftFrom(p)) * heightScale;
		var Bz = map.getHeight(leftUpFrom(p)) * heightScale;
		var Cz = map.getHeight(rightUpFrom(p)) * heightScale;
		var Dz = map.getHeight(rightFrom(p)) * heightScale;
		var Ez = map.getHeight(rightDownFrom(p)) * heightScale;
		var Fz = map.getHeight(leftDownFrom(p)) * heightScale;
		
		// lambert diffuse lighting
		var CzFz = Cz - Fz;
		var BzEz = Bz - Ez;
		var AzDz = Az - Dz;
		var sqt1 = BzEz + CzFz;
		var sqt2 = 2 * AzDz + BzEz - CzFz;
		var c = sqrt2h * (2 * CzFz + BzEz - AzDz + 6) / sqrt(3 * sqt1 * sqt1 + sqt2 * sqt2 + 36);
		// gamma correction
		this.coefs.set(i, c * c * 1.5);
	};

	
	this.updateNormals = function()
	{
		var map = this.map;
		
		for(var y=0; y < numVertRows; y++) {
			for(var x=0; x < numVertsPerRow; x++) {
				this.updateNormal([x, y]);
			}
		}
	};
	
	this.updateNormalsLeftEdge = function()
	{
		var map = this.map;
		
		for(var y=0; y < numVertRows; y++) {
			this.updateNormal([0, y]);
		}
	};
	
	this.updateNormalsTopEdge = function()
	{
		var map = this.map;
		
		for(var x=0; x < numVertsPerRow; x++) {
			this.updateNormal([x, 0]);
		}
	};
	
	this.updateNormalsRightEdge = function()
	{
		var map = this.map;
		
		for(var y=0; y < numVertRows; y++) {
			this.updateNormal([numVertsPerRow - 1, y]);
			this.updateNormal([numVertsPerRow - 2, y]);
		}
	};
	
	this.updateNormalsBottomEdge = function()
	{
		var map = this.map;
		
		for(var x=0; x < numVertsPerRow; x++) {
			this.updateNormal([x, numVertRows - 1]);
			this.updateNormal([x, numVertRows - 2]);
		}
	};
}).call(Chunk.prototype);
