function MapChunk(x, y)
{
	this.x = x;
	this.y = y;
	
	this.mapCoords = new Buffer("short").resize(this.numVerts * 2);
	this.indices = new Buffer("ushort", true).resize(this.numIndices);
	this.heights = new Buffer("ubyte").resize(this.numVerts);
	this.normals = new Buffer("float").resize(this.numVerts * 3);
	this.terra = new Buffer("ubyte").resize(this.numVerts);
	
	for(var y=0; y < this.numVertRows; y++) {
		for(var x=0; x < this.numVertsPerRow; x++) {
			var i = this.linearCoord(x, y);
			var ax = x + this.x * (this.numVertsPerRow - 1);
			var ay = y + this.y * (this.numVertRows - 1);
			
			this.mapCoords.set(i * 2 + 0, x);
			this.mapCoords.set(i * 2 + 1, y);
			//this.heights.set(i, floor(random() * 2));
			this.heights.set(i, floor(sin(ax + ay +ax * ay) * 1 + 1));
			//this.terra.set(i, floor(random() * 3));
			//this.terra.set(i, floor(sin(ax + ay) * 1.5 + 1.5));
			this.terra.set(i, 0);
		}
	}
		
	for(var y=0; y < this.numVertRows; y++) {
		for(var x=0; x < this.numVertsPerRow; x++) {
			var i = this.linearCoord(x, y);
			var vm = this.getVertex(x, y);
			var vs = [
				this.getVertex(x - 1, y),
				this.getVertex.apply(this, this.leftUpFrom(x, y)),
				this.getVertex.apply(this, this.rightUpFrom(x, y)),
				this.getVertex(x + 1, y),
				this.getVertex.apply(this, this.rightDownFrom(x, y)),
				this.getVertex.apply(this, this.leftDownFrom(x, y)),
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

			this.normals.set(i * 3 + 0, ct[0]);
			this.normals.set(i * 3 + 1, ct[1]);
			this.normals.set(i * 3 + 2, ct[2]);
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
}

(function() {

	this.draw = function()
	{
		var shader = loader.shaders.map;
		
		this.mapCoords.update();
		this.indices.update();
		this.heights.update();
		this.normals.update();
		this.terra.update();
		
		shader.setAttribute("aMapCoord", this.mapCoords);
		shader.setAttribute("aHeight", this.heights);
		shader.setAttribute("aNormal", this.normals);
		shader.setAttribute("aTerra", this.terra);
		
		shader.setUniform("uChunkCoord", [this.x, this.y]);
		shader.setUniform("uScreenSize", [display.width, display.height]);
		shader.setUniform("uZoom", camera.zoom);
		shader.setUniform("uCameraPos", camera.pos);
		shader.setUniform("uSun", this.sun);
		
		shader.resetTextures();
		shader.setTexture("uTex", loader.textures.terrain);
		
		shader.setIndices(this.indices);
		shader.drawTriangleStrip();
	};

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

	this.linearCoord = function(x, y)
	{
		x = clamp(0, this.numVertsPerRow - 1, x);
		y = clamp(0, this.numVertRows - 1, y);
		return y * this.numVertsPerRow + x;
	};

	this.getVertex = function(x, y)
	{
		var i = this.linearCoord(x, y);
		return this.mapToWorld([x, y], this.heights.data[i]);
	};
	
	this.leftUpFrom = function(x, y)
	{
		return [x - 1 + (y % 2), y - 1];
	};
	
	this.rightUpFrom = function(x, y)
	{
		return [x + (y % 2), y - 1];
	};
	
	this.leftDownFrom = function(x, y)
	{
		return [x - 1 + (y % 2), y + 1];
	};
	
	this.rightDownFrom = function(x, y)
	{
		return [x + (y % 2), y + 1];
	};
	
	this.mapToWorld = function(mapCoord, height)
	{
		var worldPos;
	
		worldPos = [mapCoord[0], mapCoord[1], height / 3];
		worldPos[0] += 0.5 * (mapCoord[1] % 2);
		worldPos[1] *= this.triaHeight;
	
		return worldPos;
	};


}).call(MapChunk.prototype);
