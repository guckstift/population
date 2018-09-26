import Buffer from "./gfxlib/buffer.js";
import VertexArray from "./gfxlib/vertexarray.js";
import Dyn2dArray from "./utils/dyn2darray.js";
import image from "./gfxlib/image.js";
import display from "./gfxlib/display.js";
import Chunk from "./chunk.js";
import Drawable from "./gfxlib/drawable.js";
import camera from "./camera.js";
import generator from "./generator.js";
import * as ma from "./utils/math.js";
import * as mm from "./math.js";
import shader from "./gfxlib/shader.js";
import terraVertSrc from "./glsl/terra.vert.js";
import terraFragSrc from "./glsl/terra.frag.js";
import spriteVertSrc from "./glsl/sprite.vert.js";
import spriteFragSrc from "./glsl/sprite.frag.js";

let gl = display.gl;

const coords = new Buffer(false, "static", "float", 2 * mm.verts);
const indices = new Buffer(true, "static", "ushort", mm.indices);

// generate map coords for a chunk
for(let y=0; y < mm.vertRows; y++) {
	for(let x=0; x < mm.vertsPerRow; x++) {
		coords.set(mm.linearLocalCoord([x, y]) * 2, [x, y]);
	}
}

// generate indices for a chunk
for(let y=0, i=0; y < mm.triaRows; y++) {
	let evenRow = y % 2 === 0;
	let oddRow  = !evenRow;

	for(let x=0; x < mm.triasPerRow; x++) {
		let isDownPointing = evenRow && x % 2 == 0 || oddRow && x % 2 == 1;
		let isUpPointing   = !isDownPointing;
	
		indices.set(i++, (y + isUpPointing) * mm.vertsPerRow + ma.floor(x / 2));
	
		if(x == 0 && y > 0) {
			indices.set(i++, indices.data[i - 2]);
		}
	}

	indices.set(i++, (y + 1 + oddRow) * mm.vertsPerRow - 1);
	indices.set(i++, (y + 1 + evenRow) * mm.vertsPerRow - 1);

	if(y < mm.triaRows - 1) {
		indices.set(i++, indices.data[i - 2]);
	}
}

coords.update();
indices.update();

class Map extends Drawable
{
	constructor()
	{
		super();
		
		this.chunks = new Dyn2dArray();
		this.gen = generator;
		
		this.terraShader = shader("terra", terraVertSrc, terraFragSrc);
		this.terraShaderVars = this.terraShader.vars;
		
		this.spriteShader = shader("sprite", spriteVertSrc, spriteFragSrc);
		this.spriteShaderVars = this.spriteShader.vars;
		
		this.terraVao = new VertexArray(this.terraShader);
		this.terraVao.indices(indices);
		this.terraVao.assign(coords, "coord",  2);
	}
	
	getHeight(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		return chunk ? chunk.getHeight(lp) : 0;
	}
	
	getTerra(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		return chunk ? chunk.getTerra(lp) : 0;
	}
	
	getCoef(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		return chunk ? chunk.getCoef(lp) : 0;
	}
	
	getObj(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		return chunk ? chunk.getObj(lp) : 0;
	}
	
	getSprite(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		return chunk ? chunk.getSprite(lp) : null;
	}
	
	getChunk(cp)
	{
		return this.chunks.get(cp);
	}
	
	setHeight(p, h)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		if(!chunk) {
			return false;
		}
		
		chunk.setHeight(lp, h);
		chunk.updateCoef(lp);
		
		this.updateCoef(mm.leftFrom(p));
		this.updateCoef(mm.rightFrom(p));
		this.updateCoef(mm.leftUpFrom(p));
		this.updateCoef(mm.rightUpFrom(p));
		this.updateCoef(mm.leftDownFrom(p));
		this.updateCoef(mm.rightDownFrom(p));
		
		return true;
	}
	
	setTerra(p, t)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		if(!chunk) {
			return false;
		}
		
		chunk.setTerra(lp, t);
		
		return true;
	}
	
	updateCoef(p)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		if(!chunk) {
			return false;
		}
		
		chunk.updateCoef(lp);
		
		return true;
	}
	
	setObj(p, o)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		if(!chunk) {
			return false;
		}
		
		chunk.setObj(lp, o);
		
		return true;
	}
	
	setSprite(p, s)
	{
		let cp = mm.chunkCoord(p);
		let lp = mm.localCoord(p);
		let chunk = this.getChunk(cp);
		
		if(!chunk) {
			return false;
		}
		
		chunk.setSprite(lp, s);
		
		return true;
	}
	
	setChunk(cp, c)
	{
		this.chunks.set(cp, c);
	}

	getVertex(p, o = new Float32Array(3))
	{
		return mm.mapToWorld(p[0], p[1], this.getHeight(p), o);
	}
	
	pickMapCoord(p)
	{
		let totalZoom = camera.totalZoom;
		// the map ground coord y at p
		let y = ((p[1] - display.height / 2) / totalZoom + camera.pos[1]) * 2;
		// the nearest map ground coord row above p
		let fy = ma.floor(y);
		// the map ground coord x in the chosen row
		let x = ((p[0] - display.width / 2) / totalZoom + camera.pos[0]) - ma.mod(fy, 2) / 2;
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
			let worldPos = this.getVertex(mapCoord);
			// sample screen point
			let screenPos = camera.worldToScreen(worldPos);
			// the squared distance from that sample to the input point
			let dist = ma.vec2.sqdist(p, screenPos);
		
			if(bestDist !== null && dist > bestDist) {
				break;
			}
		
			bestDist     = dist;
			bestMapCoord = mapCoord;
		}
	
		return bestMapCoord;
	}
	
	touchChunk(cp)
	{
		if(!this.getChunk(cp)) {
			let chunk = new Chunk(cp);
			this.setChunk(cp, chunk);
			chunk.init();
			chunk.updateCoefs();
		}
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
	
	draw()
	{
		this.chunks.each(chunk => chunk.maptex.update());
		
		this.terraVao.bind();
		this.terraShader.use();
		
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
