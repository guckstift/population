import Buffer from "./gfxlib/buffer.js";
import VertexArray from "./gfxlib/vertexarray.js";
import display from "./gfxlib/display.js";
import DataTex from "./gfxlib/datatex.js";
import camera from "./camera.js";
import map from "./map.js";
import * as ma from "./utils/math.js";
import * as mm from "./math.js";
import Sprite from "./sprite.js";
import image from "./gfxlib/image.js";
import {defImage} from "./gfxlib/image.js";
import packer from "./gfxlib/packer.js";
import Animation from "./animation.js";

const gl = display.gl;
const glia = display.glia;
const glvao = display.glvao;

const verts = new Buffer(false, "static", "ubyte", 8).set(0, [0,0, 1,0, 0,1, 1,1]).update();
const terraImg = image("gfx/terra.png", [0, 0], true);

let ani = [];

for(let i=1; i<31; i++) {
	ani.push(image("gfx/tree2/" + String(i).padStart(4, "0000") + ".png", [0.5, 0.875]));
}

ani = new Animation(ani);

export default class Chunk
{
	constructor(pos)
	{
		this.pos = pos;
		
		this.spriteList = Array(mm.chunkVerts);
		this.spriteBuf  = new Buffer(false, "stream", "float", mm.chunkVerts * mm.blockSize);
		this.maptex     = new DataTex(mm.chunkWidth, mm.chunkHeight);
		
		this.spriteVao = new VertexArray(map.spriteShader);
		this.spriteVao.assign(verts,          "vert",    2);
		this.spriteVao.assign(this.spriteBuf, "flatPos", 2, mm.blockStride, 4 * 0, 1);
		this.spriteVao.assign(this.spriteBuf, "texId",   1, mm.blockStride, 4 * 2, 1);
		this.spriteVao.assign(this.spriteBuf, "frameId", 1, mm.blockStride, 4 * 3, 1);
	}
	
	getHeight(p)
	{
		return this.maptex.get(p, 0);
	}
	
	getTerra(p)
	{
		return this.maptex.get(p, 1);
	}
	
	getCoef(p)
	{
		return this.maptex.get(p, 2);
	}
	
	getObj(p)
	{
		return this.maptex.get(p, 3);
	}
	
	getSprite(p)
	{
		let index = mm.linearLocalChunkCoord(p);
		
		return this.spriteList[index];
	}
	
	setHeight(p, h)
	{
		this.maptex.set(p, 0, h);
		
		let sprite = this.getSprite(p);
		
		if(sprite) {
			sprite._posOutdated = true;
		}
	}
	
	setTerra(p, t)
	{
		this.maptex.set(p, 1, t);
	}
	
	updateCoef(lp)
	{
		let p  = mm.globalCoord(this.pos, lp);
		let Az = mm.heightScale * map.getHeight(mm.leftFrom(p));
		let Bz = mm.heightScale * map.getHeight(mm.leftUpFrom(p));
		let Cz = mm.heightScale * map.getHeight(mm.rightUpFrom(p));
		let Dz = mm.heightScale * map.getHeight(mm.rightFrom(p));
		let Ez = mm.heightScale * map.getHeight(mm.rightDownFrom(p));
		let Fz = mm.heightScale * map.getHeight(mm.leftDownFrom(p));
		
		// lambert diffuse lighting
		let CzFz = Cz - Fz;
		let BzEz = Bz - Ez;
		let AzDz = Az - Dz;
		let sqt1 = BzEz + CzFz;
		let sqt2 = 2 * AzDz + BzEz - CzFz;
		let c  = mm.sqrt2h * (2 * CzFz + BzEz - AzDz + 6) / ma.sqrt(3 * sqt1**2 + sqt2**2 + 36);
		let cb = Math.floor(c * 255);
		
		this.maptex.set(lp, 2, cb);
	}
	
	setObj(p, o)
	{
		this.maptex.set(p, 3, o);
	}
	
	setSprite(p, sprite)
	{
		let index = mm.linearLocalChunkCoord(p);
		let data  = this.spriteBuf.data;
		
		if(sprite) {
			this.spriteList[index] = sprite;
			
			sprite._flatPos = data.subarray(index * mm.blockSize + 0);
			sprite._texId   = data.subarray(index * mm.blockSize + 2);
			sprite._frameId = data.subarray(index * mm.blockSize + 3);
		}
		else {
			this.spriteList[index] = null;
			
			data[index * mm.blockSize + 0] = 0;
			data[index * mm.blockSize + 1] = 0;
			data[index * mm.blockSize + 2] = 0;
			data[index * mm.blockSize + 3] = 0;
		}
	}
	
	updateCoefs()
	{
		for(let y=0; y < mm.chunkHeight; y++) {
			for(let x=0; x < mm.chunkWidth; x++) {
				this.updateCoef([x, y]);
			}
		}
	}
	
	init()
	{
		for(let y=0; y < mm.vertRows; y++) {
			for(let x=0; x < mm.vertsPerRow; x++) {
				let lp = [x, y];
				let p = mm.globalCoord(this.pos, lp);
				let h = map.gen.height(p);
				let t = map.gen.terra(p);
				
				map.setHeight(p, h);
				this.setTerra(lp, t);
			}
		}
		
		let treeImg1 = image("gfx/tree1.png", [0.5, 0.875]);
		let treeImg2 = image("gfx/tree2.png", [0.5, 0.875]);
		
		for(var y=0; y < mm.chunkHeight; y++) {
			for(var x=0; x < mm.chunkWidth; x++) {
				if(Math.random() < 0.03125) {
				//if(Math.random() < 0.0625) {
				//if(Math.random() < 1) {
					let gp = mm.globalCoord(this.pos, [x, y]);
					let sprite = new Sprite(Math.random() < 0.5 ? treeImg1 : treeImg2, gp);
					sprite.ani = ani;
				}
			}
		}
	}
	
	drawTerra()
	{
		let chunk;
		let vars = map.terraShaderVars;
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.maptex.tex);
		
		gl.activeTexture(gl.TEXTURE1);
		if(chunk = map.getChunk([this.pos[0] + 1, this.pos[1]])) {
			gl.bindTexture(gl.TEXTURE_2D, chunk.maptex.tex);
			gl.uniform1i(vars.chunkHasLeft, 1);
		}
		else {
			gl.bindTexture(gl.TEXTURE_2D, defImage.frame.tex);
			gl.uniform1i(vars.chunkHasLeft, 0);
		}
		
		gl.activeTexture(gl.TEXTURE2);
		if(chunk = map.getChunk([this.pos[0], this.pos[1] + 1])) {
			gl.bindTexture(gl.TEXTURE_2D, chunk.maptex.tex);
			gl.uniform1i(vars.chunkHasDown, 1);
		}
		else {
			gl.bindTexture(gl.TEXTURE_2D, defImage.frame.tex);
			gl.uniform1i(vars.chunkHasDown, 0);
		}
		
		gl.activeTexture(gl.TEXTURE3);
		if(chunk = map.getChunk([this.pos[0] + 1, this.pos[1] + 1])) {
			gl.bindTexture(gl.TEXTURE_2D, chunk.maptex.tex);
			gl.uniform1i(vars.chunkHasLeftDown, 1);
		}
		else {
			gl.bindTexture(gl.TEXTURE_2D, defImage.frame.tex);
			gl.uniform1i(vars.chunkHasLeftDown, 0);
		}
		
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, terraImg.frame.tex);
		
		gl.uniform1i(vars.maptex, 0);
		gl.uniform1i(vars.maptexLeft, 1);
		gl.uniform1i(vars.maptexDown, 2);
		gl.uniform1i(vars.maptexLeftDown, 3);
		gl.uniform1i(vars.tex, 4);
		gl.uniform1f(vars.heightScale, mm.heightScale);
		gl.uniform1f(vars.totalZoom, camera.totalZoom);
		gl.uniform1f(vars.viewAngleSin, mm.viewAngleSin);
		gl.uniform2fv(vars.chunkSize, mm.chunkDims);
		gl.uniform2fv(vars.chunkCoord, this.pos);
		gl.uniform2fv(vars.camPos, camera.pos);
		gl.uniform2fv(vars.screenSize, display.size);
		gl.uniform2fv(vars.texDivision, mm.texDivision);
		
		gl.drawElements(gl.TRIANGLE_STRIP, mm.indices, gl.UNSIGNED_SHORT, 0);
	}
	
	drawSprites()
	{
		let vars   = map.spriteShaderVars;
		let texids = Array.from(Array(packer.textures.length), (v,i) => i + 1);
		
		packer.textures.forEach((tex, i) => {
			gl.activeTexture(gl.TEXTURE1 + i);
			gl.bindTexture(gl.TEXTURE_2D, tex);
		});
		
		this.spriteList.forEach(sprite => {
			if(sprite) {
				let texid = sprite._img.frame.texid;
				let frameid = sprite._img.frame.id;
				sprite.update(texid, frameid);
			}
		});
		
		this.spriteBuf.update(true);
		this.spriteVao.bind();

		map.spriteShader.use();
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, packer.datatex);
		
		gl.uniform1i(vars.frametex, 0);
		gl.uniform1iv(vars.textures, texids);
		gl.uniform2fv(vars.framedataSize, packer.datatexdims);
		gl.uniform2fv(vars.camPos, camera.pos);
		gl.uniform2fv(vars.screenSize, display.size);
		gl.uniform1f(vars.scale, camera.zoom / 2);
		gl.uniform1f(vars.zoom, camera.totalZoom);
		glia.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, mm.chunkVerts);
	}
}
