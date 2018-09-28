import {loadImage, getImageBox, createImgTex, createEmptyTex} from "./utils.js";
import {gl} from "./display.js";
import packer from "./packer.js";

let defTex = createEmptyTex(gl, 1, 1);
let cache = {};
let numLoadingImages = 0;

export default function image(url = "", anchor = [0,0], owntex = false)
{
	let id = url + ";" + owntex;
	
	if(cache[id]) {
		return cache[id];
	}
	
	return cache[id] = new Image(url, anchor, owntex);
}

export function imagesLoaded()
{
	return Promise.all(Object.values(cache).map(img => img.ready));
}

class Image
{
	constructor(url, anchor, owntex)
	{
		this.url = url;
		this.anchor = anchor;
		this.boxAnchor = new Float32Array(this.anchor);
		this.owntex = owntex;
		this.bbox = {x:0, y:0, w:0, h:0};
		this.bboxArea = 0;
		this.tmpTexId = -1;
		this.defAnchor = [0, 0];
		
		this.frame = {
			id: 0, pos: {x:0, y:0}, texbox: new Float32Array(4), tex: defTex, texid: 0
		};
		
		if(url) {
			numLoadingImages ++;
			this.ready = loadImage(url).then(img => this.onLoad(img));
		}
		else {
			this.ready = Promise.resolve();
		}
	}
	
	get width()
	{
		return this.img ? this.img.width : 1;
	}
	
	get height()
	{
		return this.img ? this.img.height : 1;
	}
	
	get size()
	{
		return [this.img.width, this.img.height];
	}
	
	onLoad(img)
	{
		this.img = img;
		
		if(this.owntex) {
			this.bbox.w = img.width;
			this.bbox.h = img.height;
			this.frame.tex = createImgTex(gl, img);
			this.frame.texbox[2] = 1;
			this.frame.texbox[3] = 1;
		}
		else {
			this.bbox = getImageBox(img);
			this.boxAnchor[0] = (this.anchor[0] * this.img.width  - this.bbox.x) / this.bbox.w;
			this.boxAnchor[1] = (this.anchor[1] * this.img.height - this.bbox.y) / this.bbox.h;
			this.frame = packer.pack(this);
		}
		
		this.bboxArea = this.bbox.w * this.bbox.h;
		numLoadingImages --;
		console.log(numLoadingImages);
	}
}

export const defImage = image();
