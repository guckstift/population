class Map
{
	constructor(display, camera)
	{
		var gl = display.gl;
		
		this.display   = display;
		this.camera    = camera;
		this.terratex  = new Texture(display).fromImage(elmBySrc("gfx/terra.png"));
		this.shader    = new Shader(display, shaderUtils + mapVert, mapFrag);
		this.mapcoords = new Buffer(display, STATIC, UBYTE, false, verts * 2);
		this.indices   = new Buffer(display, STATIC, USHORT, true, indices * 2);
		this.heights   = new Buffer(display, DYNAMIC, UBYTE, false, verts);
		this.coefs     = new Buffer(display, DYNAMIC, FLOAT, false, verts);
		this.terra     = new Buffer(display, DYNAMIC, UBYTE, false, verts);
		this.objbatch  = new PointBatch(this);
		this.objs      = Array(verts);
		
		this.objbatch.orderFunc = function(sp1, sp2) {
			return sp1.pos[1] - sp2.pos[1];
		};
		
		// generate map coords
		for(var y=0; y < vertRows; y++) {
			for(var x=0; x < vertsPerRow; x++) {
				this.mapcoords.set(linearCoord([x, y]) * 2, [x, y]);
				this.setHeight([x, y], 0)
			}
		}
		
		// generate indices
		for(var y=0, i=0; y < triaRows; y++) {
			var evenRow = y % 2 === 0;
			var oddRow  = !evenRow;
		
			for(var x=0; x < triasPerRow; x++) {
				var isDownPointing = evenRow && x % 2 == 0 || oddRow && x % 2 == 1;
				var isUpPointing   = !isDownPointing;
			
				this.indices.set(i++, [(y + isUpPointing) * vertsPerRow + floor(x / 2)]);
			
				if(x == 0 && y > 0) {
					this.indices.set(i++, [this.indices.data[i - 2]]);
				}
			}
		
			this.indices.set(i++, [(y + 1 + oddRow) * vertsPerRow - 1]);
			this.indices.set(i++, [(y + 1 + evenRow) * vertsPerRow - 1]);
		
			if(y < triaRows - 1) {
				this.indices.set(i++, [this.indices.data[i - 2]]);
			}
		}
		
		// generate map
		for(var y=0; y < vertRows; y++) {
			for(var x=0; x < vertsPerRow; x++) {
				this.setTerra([x, y], floor(noise2d(x, y, 0) * 3));
				
				if(noise2d(x, y, 23) > 0.5) {
					this.liftOrSinkHeight([x, y]); //, floor(noise2d(x, y, 1) * 2));
				}
				
				/*
				if(noise2d(x, y, 42) > 0.275) {
					this.objs[linearCoord([x,y])] = new Obj(this, [x, y], framesets.tree.frames.tree);
				}*/
			}
		}
	}

	getVertex(p)
	{
		return this.mapToWorld(vec2.vec3(p, this.getHeight(p)));
	}

	mapToWorld(p)
	{
		return [
			p[0] + (mod(floor(p[1]), 2) === 0 ? frac(p[1]) * 0.5 : 0.5 - frac(p[1]) * 0.5),
			p[1] * triaHeight,
			p[2] * heightScale,
		];
	}

	worldToScreen(p)
	{
		var pyr = p[1] * viewAngleCos - p[2] * viewAngleSin;
		var campos = this.camera.pos;
	
		return [
			gl.size[0] / 2.0 + (stdDefZoom * p[0] - campos[0]),
			gl.size[1] / 2.0 + (stdDefZoom * pyr - campos[1]),
		];
	}
	
	mapToScreen(p)
	{
		return this.worldToScreen(mapToWorld(p));
	}

	pickMapCoord(p)
	{
		var campos = this.camera.pos;
		var size   = this.display.size;
		// the map ground coord y at p
		var y = ((p[1] - size[1] / 2) + campos[1]) / stdDefZoom * 2;
		// the nearest map ground coord row above p
		var fy = floor(y);
		// the map ground coord x in the chosen row
		var x = ((p[0] - size[0] / 2) + campos[0]) / stdDefZoom - mod(fy, 2) / 2;
		// the nearest map ground coord column in the chosen row p lies between
		var fx = round(x);
		// lies p before or after the chosen column
		var before = x < fx;
		// is the chosen row an odd one
		var oddstart = mod(fy, 2);
		// the best fit to find
		var bestDist     = undefined;
		var bestMapCoord = undefined;
	
		for(var i=0; i<256; i++) {
			// is the current row an odd one
			var oddrow = mod(fy + i, 2);
			// shift from start column by 0, -1 or +1
			var xshift = 1 * oddstart * !oddrow * !before - 1 * !oddstart * oddrow * before;
			// sample map coord
			var mapCoord2d = [fx + xshift, fy + i, 0];
			var mapCoord3d = [mapCoord2d[0], mapCoord2d[1], map ? this.getHeight(mapCoord2d) : 0];
			// sample screen point
			var screenPos = this.mapToScreen(mapCoord3d);
			// the squared distance from that sample to the input point
			var dist = vec2.sqdist(p, screenPos);
		
			if(bestDist !== undefined && dist > bestDist) {
				break;
			}
		
			bestDist = dist;
			bestMapCoord = mapCoord3d;
		}
	
		return bestMapCoord;
	}
	
	getHeight(pos)
	{
		return this.heights.data[linearCoord(clampedPos(pos))];
	}
	
	setHeight(p, h)
	{
		if(!posInBounds(p) || h < 0 || h > 255) {
			return false;
		}
		
		this.heights.set(linearCoord(p), [h]);
		this.updateNormal(p);
		this.updateNormal(leftFrom(p));
		this.updateNormal(rightFrom(p));
		this.updateNormal(leftUpFrom(p));
		this.updateNormal(rightUpFrom(p));
		this.updateNormal(leftDownFrom(p));
		this.updateNormal(rightDownFrom(p));
		
		return true;
	}
	
	liftOrSinkHeight(p, sink)
	{
		sink = sink || false;
		
		if(this.liftOrSinkHeightTest(p, sink) === false) {
			return false;
		}
		
		var h   = this.getHeight(p);
		var adj = allAdjacent(p);
		var ok  = this.setHeight(p, sink ? --h : ++h);
		
		if(!ok) {
			return false;
		}
		
		for(var i=0; i<adj.length; i++) {
			var pa = adj[i];
			var ah = this.getHeight(pa);
			
			if(sink ? (h < ah - 1) : (h > ah + 1)) {
				var ok = this.liftOrSinkHeight(pa, sink);
			}
		}
		
		return true;
	}
	
	liftOrSinkHeightTest(p, sink)
	{
		var ringsize = 0;
		var targheight = this.getHeight(p) + (sink ? -1 : 1);
		var changed = true;
		
		while(changed) {
			var adj = hexRing(p, ringsize++);
			changed = false;
			
			for(var i=0; i<adj.length; i++) {
				var phere = adj[i];
				var hereHeight = this.getHeight(phere);
				
				if(sink ? hereHeight > targheight : hereHeight < targheight) {
					if(!posInInnerBounds(phere)) {
						return false;
					}
					
					changed = true;
				}
			}
			
			if(targheight < 0 || targheight > 255) {
				return false;
			}
			
			sink ? targheight++ : targheight--;
		}
		
		return true;
	}
	
	setTerra(p, t)
	{
		if(!posInBounds(p) || t < 0 || t > 255) {
			return false;
		}
		
		this.terra.set(linearCoord(p), [t]);
	}
	
	/*getObj: function(p)
	{
		var obj = this.objs[linearCoord(p)];
		
		return obj;
	},*/
	
	updateNormal(pos)
	{
		if(!posInBounds(pos)) {
			return;
		}
		
		var i  = linearCoord(pos);
		var v  = this.getVertex(pos);
		var Az = this.getHeight(leftFrom(pos)) * heightScale;
		var Bz = this.getHeight(leftUpFrom(pos)) * heightScale;
		var Cz = this.getHeight(rightUpFrom(pos)) * heightScale;
		var Dz = this.getHeight(rightFrom(pos)) * heightScale;
		var Ez = this.getHeight(rightDownFrom(pos)) * heightScale;
		var Fz = this.getHeight(leftDownFrom(pos)) * heightScale;
		
		// lambert diffuse lighting
		var CzFz = Cz - Fz;
		var BzEz = Bz - Ez;
		var AzDz = Az - Dz;
		var sqt1 = BzEz + CzFz;
		var sqt2 = 2 * AzDz + BzEz - CzFz;
		var c = sqrt2h * (2 * CzFz + BzEz - AzDz + 6) / sqrt(3 * sqt1 * sqt1 + sqt2 * sqt2 + 36);
		
		this.coefs.set(i, [c * c * 1.5]);
	}
	
	draw()
	{
		
		this.shader
			.use()
			.set_uCameraPos(this.camera.pos)
			.set_uHeightScale(heightScale)
			.set_uScreenSize(this.display.size)
			.set_uStdDefZoom(stdDefZoom)
			.set_uTex(this.terratex)
			.set_uTerraSlotSize(terraSlotSize)
			.set_uTerraRelSlotSize(terraRelSlotSize)
			.set_aCoef(this.coefs)
			.set_aHeight(this.heights)
			.set_aTerra(this.terra)
			.set_aMapCoord(this.mapcoords);
		
		this.display
			.setIndices(this.indices)
			.draw(TRIANGLESTRIP, indices);
		
		/*this.objbatch.clear();
		
		for(var y=0; y < vertRows; y++) {
			for(var x=0; x < vertsPerRow; x++) {
				var obj = this.getObj([x,y]);
				
				if(obj) {
					this.objbatch.add(this.getObj([x,y]));
				}
			}
		}*/
		
		this.objbatch.draw();
	}
}
