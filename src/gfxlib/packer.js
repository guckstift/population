import {createImgTex, updateImgTex, createEmptyTex} from "./utils.js";
import display from "./display.js";

let gl = display.gl;

class Packer
{
	constructor()
	{
		this.maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		this.atlases = [new Atlas(this)];
	}
	
	showDebug(atlasId)
	{
		this.atlases[atlasId].showDebug();
	}
	
	pack(img)
	{
		if(img.bbox.w <= this.maxSize && img.bbox.h <= this.maxSize) {
			for(let i=0; i<this.atlases.length; i++) {
				let atlas = this.atlases[i];
				let frame = atlas.pack(img);
			
				if(frame) {
					return frame;
				}
			}
		
			let atlas = new Atlas(this);
			let frame = atlas.pack(img);
		
			this.atlases.push(atlas);
		
			if(frame) {
				return frame;
			}
		}
		
		throw "Error: Could not pack image";
	}
}

class Atlas
{
	constructor(packer)
	{
		this.packer = packer;
		this.maxSize = packer.maxSize;
		this.images = [];
		this.canvas = document.createElement("canvas");
		this.canvas.width = 1;
		this.canvas.height = 1;
		this.ctx = this.canvas.getContext("2d");
		this.tex = createImgTex(gl, this.canvas);
		this.debugDiv = document.createElement("div");
		this.debugDiv.style.overflow = "auto";
		this.debugDiv.style.position = "fixed";
		this.debugDiv.style.left = "0";
		this.debugDiv.style.top = "0";
		this.debugDiv.style.right = "0";
		this.debugDiv.style.bottom = "0";
		this.debugDiv.appendChild(this.canvas);
	}
	
	showDebug()
	{
		document.body.appendChild(this.debugDiv);
	}
	
	hideDebug()
	{
		document.body.removeChild(this.debugDiv);
	}

	findPos(srcw, srch, destw, desth, left, extents)
	{
		while(left + srcw <= destw) {
			let top = Math.max(...extents.slice(left, left + srcw));
			
			if(top + srch <= desth) {
				return {x: left, y: top};
			}
		
			left += 1;
		}
	
		left = 0;
	
		while(left + srcw <= destw) {
			let top = Math.max(...extents.slice(left, left + srcw));
			
			if(top + srch <= desth) {
				return {x: left, y: top};
			}
		
			left += 1;
		}
		
		return false;
	}
	
	packWith(destw, desth, images)
	{
		let left = 0;
		let extents = Array(destw).fill(0);
		let frames = [];
		
		for(let i=0; i<images.length; i++) {
			let img = images[i];
			let bbox = img.bbox;
			let srcw = bbox.w;
			let srch = bbox.h;
			let pos = this.findPos(srcw, srch, destw, desth, left, extents);
			
			if(!pos) {
				return false;
			}
			
			frames.push({img, pos});
			extents.fill(pos.y + srch, pos.x, pos.x + srcw);
			left = pos.x + srcw;
		}
		
		return frames;
	}
	
	pack(img)
	{
		let destw = this.canvas.width;
		let desth = this.canvas.height;
		let images = this.images.slice();
		let frames = false;
		
		while(img.bbox.w > destw) {
			destw *= 2;
		}
		
		while(img.bbox.h > desth) {
			desth *= 2;
		}
		
		images.push(img);
		images.sort((a, b) => b.bboxArea - a.bboxArea);
		
		while(true) {
			if(frames = this.packWith(destw, desth, images)) {
				break;
			}
			else if(destw < desth) {
				destw *= 2;
			}
			else if(desth < this.maxSize) {
				desth *= 2;
			}
			else {
				break;
			}
		}
		
		if(!frames) {
			return false;
		}
		
		this.images = [];
		this.canvas.width = destw;
		this.canvas.height = desth;
		
		for(let i=0; i<frames.length; i++) {
			let frame = frames[i];
			let img = frame.img;
			let bbox = img.bbox;
			let pos = frame.pos;
			
			img.frame.pos.x = pos.x;
			img.frame.pos.y = pos.y;
			img.frame.texbox[0] = pos.x / destw;
			img.frame.texbox[1] = pos.y / desth;
			img.frame.texbox[2] = bbox.w / destw;
			img.frame.texbox[3] = bbox.h / desth;
			img.frame.tex = this.tex;
			img.frame.atlas = this;
			this.images.push(img);
			
			this.ctx.drawImage(
				img.img, bbox.x, bbox.y, bbox.w, bbox.h, pos.x, pos.y, bbox.w, bbox.h
			);
		}
		
		updateImgTex(gl, this.tex, this.canvas);
		
		return img.frame;
	}
}

export default new Packer();
