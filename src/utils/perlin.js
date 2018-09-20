import Dyn2dArray from "./dyn2darray.js";
import * as ma from "./math.js";

export default class Perlin
{
	constructor()
	{
		this.layers = [
			new Layer(0, 1, 1),
			new Layer(1, 2, 2),
			new Layer(2, 4, 4),
			new Layer(3, 8, 8),
			//new Layer(4, 16, 16),
			//new Layer(5, 32, 32),
		];
	}
	
	sample(p)
	{
		let sum = 0;
		let ampsum = 0;
		
		for(let i=0; i < this.layers.length; i++) {
			sum += this.layers[i].sample(p);
			ampsum += this.layers[i].amp;
		}
		
		return sum / ampsum;
	}
}

class Layer
{
	constructor(seed, zoom, amp)
	{
		this.seed = seed;
		this.zoom = zoom;
		this.amp = amp;
		this.samples = new Dyn2dArray();
		this.samples.cellFactory = this.cellFactory.bind(this);
	}
	
	sample([x, y])
	{
		let zx = x / this.zoom;
		let zy = y / this.zoom;
		let flx = ma.floor(zx);
		let fly = ma.floor(zy);
		let p = zx - flx;
		let q = zy - fly;
		let aa = this.samples.get([flx,     fly]);
		let ba = this.samples.get([flx + 1, fly]);
		let ab = this.samples.get([flx,     fly + 1]);
		let bb = this.samples.get([flx + 1, fly + 1]);
		
		let mixFunc = ma.smoothMix;
		
		return this.amp * mixFunc(mixFunc(aa, ba, p), mixFunc(ab, bb, p), q);
	}
	
	cellFactory(p)
	{
		return ma.noise2d(p[0], p[1], this.seed);
	}
}
