function Chunk(map, pos)
{
	this.map = map;
	this.pos = pos;
	
	this.heights = new Buffer("ubyte").resize(numVerts);
	this.terra = new Buffer("ubyte").resize(numVerts);
	this.normals = new Buffer("float").resize(numVerts * 3);
	
	for(var y=0; y < numVertRows; y++) {
		for(var x=0; x < numVertsPerRow; x++) {
			var i = linearLocalCoord([x, y]);
			var p = globalCoord(this.pos, [x, y]);
			
			this.heights.set(i, map.gen.height(p));
			this.terra.set(i, map.gen.terra(p));
		}
	}
	
	this.objchunk = new ObjChunk(this);
}

(function() {

	this.drawTerra = function()
	{
		var shader = this.map.shader;
		
		shader.setAttribute("aHeight", this.heights);
		shader.setAttribute("aNormal", this.normals);
		shader.setAttribute("aTerra", this.terra);
		shader.setUniform("uChunkCoord", this.pos);
		shader.drawTriangleStrip();
	};
	
	this.drawObjs = function()
	{
		this.objchunk.draw();
	};
	
	this.updateNormals = function()
	{
		for(var y=0; y < numVertRows; y++) {
			for(var x=0; x < numVertsPerRow; x++) {
				var i = linearLocalCoord([x, y]);
				var p = globalCoord(this.pos, [x, y]);
				
				var vs = [
					map.getVertex(leftFrom(p)),
					map.getVertex(leftUpFrom(p)),
					map.getVertex(rightUpFrom(p)),
					map.getVertex(rightFrom(p)),
					map.getVertex(rightDownFrom(p)),
					map.getVertex(leftDownFrom(p)),
				];
			
				var cs = [
					vec3cross(vs[0], vs[1]),
					vec3cross(vs[1], vs[2]),
					vec3cross(vs[2], vs[3]),
					vec3cross(vs[3], vs[4]),
					vec3cross(vs[4], vs[5]),
					vec3cross(vs[5], vs[0]),
				];
			
				var ct = [0, 0, 0];
			
				cs.forEach(function(csk) {
					ct = vec3add(ct, csk);
				});
			
				ct = vec3normalized(ct);

				this.normals.set(i * 3, ct);
			}
		}
	};

}).call(Chunk.prototype);
