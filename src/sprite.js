import PointProxy from "./gfxlib/pointproxy.js";
import {defImage} from "./gfxlib/image.js";
import map from "./map.js";
import * as ma from "./utils/math.js";
import * as mm from "./math.js";

const fromFuncs = [
	mm.leftFrom,
	mm.leftUpFrom,
	mm.rightUpFrom,
	mm.rightFrom,
	mm.rightDownFrom,
	mm.leftDownFrom,
];

export default class Sprite
{
	constructor(img, pos)
	{
		this._oldPos       = new Float32Array(2);
		this._pos          = new Float32Array(2);
		this._posProxy     = new PointProxy(this._pos, () => this.changePos());
		this._anchor       = new Float32Array(2);
		this._anchorProxy  = new PointProxy(this._anchor, () => this._anchorOutdated = true);
		this._img          = defImage;
		this._from         = 0;
		this._way          = 0;
		this._opacityCache = 1;
		
		this._posOutdated     = true;
		this._anchorOutdated  = true;
		this._imgOutdated     = true;
		this._opacityOutdated = true;
		
		this._boxAnchor = null;
		this._size      = null;
		this._flatPos   = null;
		this._texPos    = null;
		this._texSize   = null;
		this._texId     = null;
		this._opacity   = null;
		
		if(img) {
			this.img = img;
		}
		
		if(pos) {
			this.pos = pos;
		}
	}
	
	changePos()
	{
		let p     = this._oldPos;
		let cp    = mm.chunkCoord(p);
		let lp    = mm.localCoord(p);
		let chunk = map.getChunk(cp);
		let index = mm.linearLocalChunkCoord(lp);
		
		if(chunk) {
			chunk.spriteList[index] = null;
		}
		
		p     = this._pos;
		cp    = mm.chunkCoord(p);
		lp    = mm.localCoord(p);
		chunk = map.getChunk(cp);
		index = mm.linearLocalChunkCoord(lp);
		
		if(chunk) {
			chunk.spriteList[index] = this;
		}
		
		this.chunk = chunk;
		this.index = index;
		this.install();
		
		this._oldPos.set(this._pos);
		
		this._posOutdated = true;
	}
	
	install()
	{
		if(this.chunk) {
			let data  = this.chunk.sprites.data;
			let index = this.index;
		
			this._boxAnchor = data.subarray(index * mm.blockSize + 0);
			this._size      = data.subarray(index * mm.blockSize + 2);
			this._flatPos   = data.subarray(index * mm.blockSize + 4);
			this._texPos    = data.subarray(index * mm.blockSize + 6);
			this._texSize   = data.subarray(index * mm.blockSize + 8);
			this._texId     = data.subarray(index * mm.blockSize + 10);
			this._opacity   = data.subarray(index * mm.blockSize + 11);
		}
	}
	
	get pos()
	{
		return this._posProxy;
	}
	
	set pos(p)
	{
		this._posProxy.set(p);
	}
	
	get anchor()
	{
		return this._anchorProxy;
	}
	
	set anchor(p)
	{
		this._anchorProxy.set(p);
	}
	
	get img()
	{
		return this._img;
	}
	
	set img(img)
	{
		img.ready.then(() => {
			this._img = img;
			this._imgOutdated = true;
			this._anchorOutdated = true;
		});
	}
	
	get from()
	{
		return this._from;
	}
	
	set from(from)
	{
		this._from = from;
		this._posOutdated = true;
	}
	
	get way()
	{
		return this._way;
	}
	
	set way(way)
	{
		this._way = way
		this._posOutdated = true;
	}
	
	get opacity()
	{
		return this._opacityCache;
	}
	
	set opacity(opacity)
	{
		this._opacityCache = opacity;
		this._opacityOutdated = true;
	}
	
	update(texId)
	{
		if(this.chunk) {
			let img  = this._img;
			let bbox = img.bbox;
			
			this._texId[0] = texId;
			
			if(this._posOutdated) {
				let fromFunc = fromFuncs[this._from];
				let toPos    = this._pos;
				let fromPos  = fromFunc(toPos);
				let toVert   = map.getVertex(...toPos);
				let fromVert = map.getVertex(...fromPos);
				let worldPos = ma.vec3.linear(toVert, fromVert, this._way);
				let flatPos  = ma.vec3.rotateX(worldPos, mm.viewAngle);
				
				this._flatPos[0]  = flatPos[0];
				this._flatPos[1]  = flatPos[1];
				this._posOutdated = false;
			}
			
			if(this._imgOutdated) {
				let frame = img.frame;
				
				this._size[0]     = bbox.w;
				this._size[1]     = bbox.h;
				this._texPos[0]   = frame.texbox[0];
				this._texPos[1]   = frame.texbox[1];
				this._texSize[0]  = frame.texbox[2];
				this._texSize[1]  = frame.texbox[3];
				this._imgOutdated = false;
			}
			
			if(this._anchorOutdated) {
				let a = this._anchor;
				
				this._boxAnchor[0]   = (a[0] * img.width  - bbox.x) / bbox.w;
				this._boxAnchor[1]   = (a[1] * img.height - bbox.y) / bbox.h;
				this._anchorOutdated = false;
			}
			
			if(this._opacityOutdated) {
				this._opacity[0]      = this._opacityCache;
				this._opacityOutdated = false;
			}
		}
	}
}
