function MapChunk(map, x, y)
{
	this.map = map;
	this.x = x;
	this.y = y;
	
	this.heights = new Buffer("ubyte").resize(map.numVerts);
	this.normals = new Buffer("float").resize(map.numVerts * 3);
	this.terra = new Buffer("ubyte").resize(map.numVerts);
	
	for(var y=0; y < map.numVertRows; y++) {
		for(var x=0; x < map.numVertsPerRow; x++) {
			var i = map.linearLocalCoord(x, y);
			var coord = map.globalCoord(this.x, this.y, x, y)
			this.heights.set(i, floor(noise2d(coord[0], coord[1]) * 2));
			this.terra.set(i, floor(noise2d(coord[0], coord[1]) * 3));
		}
	}
}

(function() {

	this.draw = function()
	{
		var shader = this.map.shader;
		
		this.heights.update();
		this.normals.update();
		this.terra.update();
		
		shader.setAttribute("aHeight", this.heights);
		shader.setAttribute("aNormal", this.normals);
		shader.setAttribute("aTerra", this.terra);
		
		shader.setUniform("uChunkCoord", [this.x, this.y]);
		
		shader.drawTriangleStrip();
	};

	this.getVertex = function(x, y)
	{
		var i = map.linearLocalCoord(x, y);
		return this.mapToWorld([x, y], this.heights.data[i]);
	};
	
	this.mapToWorld = function(mapCoord, height)
	{
		var worldPos;
		var map = this.map;
	
		worldPos = [mapCoord[0], mapCoord[1], height / 3];
		worldPos[0] += 0.5 * (mapCoord[1] % 2);
		worldPos[1] *= map.triaHeight;
	
		return worldPos;
	};
	
	this.updateNormals = function()
	{
		for(var y=0; y < map.numVertRows; y++) {
			for(var x=0; x < map.numVertsPerRow; x++) {
				var i = map.linearLocalCoord(x, y);
				var coord = map.globalCoord(this.x, this.y, x, y)
				
				var vs = [
					map.getVertex(coord[0] - 1, coord[1]),
					map.getVertex.apply(map, map.leftUpFrom(coord[0], coord[1])),
					map.getVertex.apply(map, map.rightUpFrom(coord[0], coord[1])),
					map.getVertex(coord[0] + 1, coord[1]),
					map.getVertex.apply(map, map.rightDownFrom(coord[0], coord[1])),
					map.getVertex.apply(map, map.leftDownFrom(coord[0], coord[1])),
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

}).call(MapChunk.prototype);
