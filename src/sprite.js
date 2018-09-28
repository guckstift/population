import display from "./gfxlib/display.js";
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

const toFuncs = [
	mm.rightFrom,
	mm.rightDownFrom,
	mm.leftDownFrom,
	mm.leftFrom,
	mm.leftUpFrom,
	mm.rightUpFrom,
];

export default class Sprite
{
	constructor(img, pos)
	{
		this.speed      = 1;
		this.path       = [];
		this._installed = false;
		this._oldPos    = new Float32Array(2);
		this._pos       = new Float32Array(2);
		this._posProxy  = new PointProxy(this._pos, () => this.changePos());
		this._img       = defImage;
		this._ani       = null;
		this._frame     = 0;
		this._lastFrame = 0;
		this._frameDura = 0;
		this._from      = 0;
		this._way       = 0;
		
		this._posOutdated = true;
		
		this._flatPos = null;
		this._texId   = null;
		this._frameId = null;
		
		if(img) {
			this.img = img;
		}
		
		if(pos) {
			this.pos = pos;
		}
	}
	
	changePos()
	{
		if(this._installed) {
			map.setSprite(this._oldPos, null);
		}
		
		map.setSprite(this._pos, this);
		
		this._oldPos.set(this._pos);
		this._posOutdated = true;
		this._installed   = true;
	}
	
	get pos()
	{
		return this._posProxy;
	}
	
	set pos(p)
	{
		this._posProxy.set(p);
	}
	
	get img()
	{
		return this._img;
	}
	
	set img(img)
	{
		this._img = img;
	}
	
	get ani()
	{
		return this._ani;
	}
	
	set ani(ani)
	{
		this._ani   = ani;
		this._frame = ma.random() * ani.count;
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
	
	update(texId, frameId)
	{
		if(this._ani) {
			if(this._frame !== this._lastFrame) {
				this.img = this._ani.imgs[ma.floor(this._frame)];
			}
			
			this._lastFrame = this._frame;
			this._frame     = (this._frame + display.delta / this._ani.dura) % this._ani.count;
		}
		
		if(this._installed) {
			let img  = this._img;
			let bbox = img.bbox;
			
			this._texId[0]   = texId;
			this._frameId[0] = frameId;
			
			if(this._posOutdated) {
				let fromFunc = fromFuncs[this._from];
				let toPos    = this._pos;
				let fromPos  = fromFunc(toPos);
				let toVert   = map.getVertex(toPos);
				let fromVert = map.getVertex(fromPos);
				let worldPos = ma.vec3.linear(toVert, fromVert, this._way);
				let flatPos  = ma.vec3.rotateX(worldPos, mm.viewAngle);
				
				this._flatPos[0]  = flatPos[0];
				this._flatPos[1]  = flatPos[1];
				this._posOutdated = false;
			}
		}
		
		if(this._way === 0 && this.path.length > 0) {
			let to = this.path.shift();
			
			this.pos  = toFuncs[to](this._pos);
			this.from = to;
			this.way  = 1;
		}
		
		if(this.speed > 0 && this._way > 0) {
			let way = this._way - this.speed * display.delta / 1000;
			
			this.way = way < 0 ? 0 : way;
		}
	}
}
