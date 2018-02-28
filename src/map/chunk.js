function Chunk(map, pos)
{
	this.map = map;
	this.pos = pos;
	
	this.heights = gl.buffer("ubyte", numVerts);
	this.terra = gl.buffer("ubyte", numVerts);
	this.normals = gl.buffer(numVerts * 3);
	this.objs = Array(chunkVerts);
	
	map.setChunk(pos, this);
	
	for(var y=0; y < numVertRows; y++) {
		for(var x=0; x < numVertsPerRow; x++) {
			var i = linearLocalCoord([x, y]);
			var p = globalCoord(this.pos, [x, y]);
			
			this.heights.set(i, map.gen.height(p));
			this.terra.set(i, map.gen.terra(p));
		}
	}
	
	
	for(var y=0; y < chunkHeight; y++) {
		for(var x=0; x < chunkWidth; x++) {
			if(random() < 0.09925) {
				new Obj(this.map, globalCoord(this.pos, [x, y]));
			}
		}
	}
}

(function() {

	this.drawTerra = function()
	{
		var shader = this.map.shader;
		
		shader.draw({
			uChunkCoord: this.pos,
			aHeight: this.heights,
			aNormal: this.normals,
			aTerra: this.terra,
		});
	};
	
	this.updateNormals = function()
	{
		var map = this.map;
		
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
