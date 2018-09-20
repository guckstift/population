import Buffer from "./gfxlib/buffer.js";
import Dyn2dArray from "./utils/dyn2darray.js";
import image from "./gfxlib/image.js";
import display from "./gfxlib/display.js";
import Chunk from "./chunk.js";
import Drawable from "./gfxlib/drawable.js";
//import Batch from "./batch.js";
import camera from "./camera.js";
import generator from "./generator.js";
import * as ma from "./utils/math.js";
import * as mm from "./math.js";

let gl = display.gl;

class Map extends Drawable
{
	constructor()
	{
		super();
		
		this.chunks = new Dyn2dArray();
		this.gen = generator;
	}
	
	updateNormal(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		if(chunk) {
			chunk.updateNormal(lp);
		
			if(lp[0] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1]]);
			
				if(chunk) {
					chunk.updateNormal([mm.vertsPerRow - 1, lp[1]]);
				}
			}
		
			if(lp[1] === 0) {
				chunk = this.getChunk([cp[0], cp[1] - 1]);
			
				if(chunk) {
					chunk.updateNormal([lp[0], mm.vertRows - 1]);
				}
			}
		
			if(lp[0] === 0 && lp[1] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1] - 1]);
			
				if(chunk) {
					chunk.updateNormal([mm.vertsPerRow - 1, mm.vertRows - 1]);
				}
			}
		}
	}
	
	getHeight(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let i = mm.linearLocalCoord(lp);
		let chunk = this.getChunk(cp);
		
		if(!chunk) {
			if(lp[0] === 0) {
				cp[0] --;
				chunk = this.getChunk(cp);
				lp[0] = mm.vertsPerRow - 1;
				i = mm.linearLocalCoord(lp);
			}
			else if(lp[1] === 0) {
				cp[1] --;
				chunk = this.getChunk(cp);
				lp[1] = mm.vertRows - 1;
				i = mm.linearLocalCoord(lp);
			}
		}
		
		return chunk ? chunk.heights.data[i] : 0;
	}
	
	getSprite(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let i = mm.linearLocalChunkCoord(lp);
		let chunk = this.getChunk(cp);
		
		return chunk ? chunk.spriteList[i] : null;
	}

	getVertex(x, y, o = new Float32Array(3))
	{
		return mm.mapToWorld(x, y, this.getHeight([x, y]), o);
	}
	
	getChunk(p)
	{
		return this.chunks.get(p);
	}
	
	pickMapCoord(p)
	{
		// the map ground coord y at p
		let y = ((p[1] - display.height / 2) / camera.totalZoom + camera.pos[1]) * 2;
		// the nearest map ground coord row above p
		let fy = ma.floor(y);
		// the map ground coord x in the chosen row
		let x = ((p[0] - display.width / 2) / camera.totalZoom + camera.pos[0]) - ma.mod(fy, 2) / 2;
		// the nearest map ground coord column in the chosen row, where p lies between
		let fx = ma.round(x);
		// lies p before or after the chosen column
		let before = x < fx;
		// is the chosen row an odd one
		let oddstart = ma.mod(fy, 2);
		// the best fit to find
		let bestDist     = null;
		let bestMapCoord = null;
	
		for(let i=0; i<256; i++) {
			// is the current row an odd one
			let oddrow = ma.mod(fy + i, 2);
			// shift from start column by 0, -1 or +1
			let xshift = 1 * oddstart * !oddrow * !before - 1 * !oddstart * oddrow * before;
			// sample map coord
			let mapCoord = [fx + xshift, fy + i];
			let worldPos = this.getVertex(...mapCoord);
			// sample screen point
			let screenPos = camera.worldToScreen(worldPos);
			// the squared distance from that sample to the input point
			let dist = ma.vec2.sqdist(p, screenPos);
		
			if(bestDist !== null && dist > bestDist) {
				break;
			}
		
			bestDist = dist;
			bestMapCoord = mapCoord;
		}
	
		return bestMapCoord;
	}
	
	touchChunk(p)
	{
		if(!this.getChunk(p)) {
			let chunk = new Chunk(p);
			
			this.chunks.set(p, chunk);
			chunk.init();
			chunk.updateNormals();
			
			chunk = this.getChunk([p[0] - 1, p[1]]);
			if(chunk) chunk.updateNormalsRightEdge();
			
			chunk = this.getChunk([p[0], p[1] - 1]);
			if(chunk) chunk.updateNormalsBottomEdge();
			
			chunk = this.getChunk([p[0] + 1, p[1]]);
			if(chunk) chunk.updateNormalsLeftEdge();
			
			chunk = this.getChunk([p[0], p[1] + 1]);
			if(chunk) chunk.updateNormalsTopEdge();
			
			chunk = this.getChunk([p[0] + 1, p[1] + 1]);
			if(chunk) chunk.updateNormal([0, 0]);
		}
	}
	
	setHeight(p, h)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let i = mm.linearLocalCoord(lp);
		let chunk = this.getChunk(cp);
		
		if(!chunk) {
			return false;
		}
		
		chunk.heights.set(i, h);
		
		if(lp[0] === 0) {
			chunk = this.getChunk(mm.leftFrom(cp));
			i = mm.linearLocalCoord([mm.vertsPerRow - 1, lp[1]]);
		
			if(chunk) {
				chunk.heights.set(i, h);
			}
		}
		
		if(lp[1] === 0) {
			chunk = this.getChunk(mm.upFrom(cp));
			i = mm.linearLocalCoord([lp[0], mm.vertRows - 1]);
		
			if(chunk) {
				chunk.heights.set(i, h);
			}
		}
	
		if(lp[0] === 0 && lp[1] === 0) {
			chunk = this.getChunk(mm.leftUpFromCartes(cp));
			i = mm.linearLocalCoord([mm.vertsPerRow - 1, mm.vertRows - 1]);
		
			if(chunk) {
				chunk.heights.set(i, h);
			}
		}
		
		this.updateNormal(p);
		this.updateNormal(mm.leftFrom(p));
		this.updateNormal(mm.rightFrom(p));
		this.updateNormal(mm.leftUpFrom(p));
		this.updateNormal(mm.rightUpFrom(p));
		this.updateNormal(mm.leftDownFrom(p));
		this.updateNormal(mm.rightDownFrom(p));
		
		let sprite = this.getSprite(p);
		
		if(sprite) {
			sprite._posOutdated = true;
		}
		
		return true;
	}
	
	liftOrSinkHeight(p, sink = false)
	{
		if(this.liftOrSinkHeightTest(p, sink) === false) {
			return false;
		}
		
		let h   = this.getHeight(p);
		let adj = mm.allAdjacent(p);
		let ok  = this.setHeight(p, sink ? --h : ++h);
		
		if(!ok) {
			return false;
		}
		
		for(let i=0; i<adj.length; i++) {
			let pa = adj[i];
			let ah = this.getHeight(pa);
			
			if(sink ? (h < ah - 1) : (h > ah + 1)) {
				let ok = this.liftOrSinkHeight(pa, sink);
			}
		}
		
		return true;
	}
	
	liftOrSinkHeightTest(p, sink = false)
	{
		let ringsize   = 0;
		let targheight = this.getHeight(p) + (sink ? -1 : 1);
		let changed    = true;
		
		while(changed) {
			let adj = mm.hexRing(p, ringsize++);
			changed = false;
			
			for(let i=0; i<adj.length; i++) {
				let phere      = adj[i];
				let hereHeight = this.getHeight(phere);
				
				if(sink ? hereHeight > targheight : hereHeight < targheight) {
					let cp    = mm.chunkCoord(phere);
					let chunk = this.getChunk(cp);
					
					if(chunk === undefined) {
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
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let i = mm.linearLocalCoord(lp);
		let chunk = this.getChunk(cp);
		
		if(chunk) {
			chunk.terra.set(i, t);
		
			if(lp[0] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1]]);
				i = mm.linearLocalCoord([mm.vertsPerRow - 1, lp[1]]);
			
				if(chunk) {
					chunk.terra.set(i, t);
				}
			}
		
			if(lp[1] === 0) {
				chunk = this.getChunk([cp[0], cp[1] - 1]);
				i = mm.linearLocalCoord([lp[0], mm.vertRows - 1]);
			
				if(chunk) {
					chunk.terra.set(i, t);
				}
			}
		
			if(lp[0] === 0 && lp[1] === 0) {
				chunk = this.getChunk([cp[0] - 1, cp[1] - 1]);
				i = mm.linearLocalCoord([mm.vertsPerRow - 1, mm.vertRows - 1]);
			
				if(chunk) {
					chunk.terra.set(i, t);
				}
			}
		}
	}
	
	setSprite(p, s)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let i = mm.linearLocalChunkCoord(lp);
		let chunk = this.getChunk(cp);
		
		if(chunk) {
			chunk.sprites[i] = s;
		}
	}
	
	draw()
	{
		this.chunks.each(chunk => chunk.drawTerra());
		
		gl.enable(gl.DEPTH_TEST);
		gl.clearDepth(-1);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.depthFunc(gl.GREATER);
		
		this.chunks.each(chunk => chunk.drawSprites());
		
		gl.disable(gl.DEPTH_TEST);
	}
}

export default new Map();
