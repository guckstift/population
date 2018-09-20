import Buffer from "./gfxlib/buffer.js";
import VertexArray from "./gfxlib/vertexarray.js";
import display from "./gfxlib/display.js";
import camera from "./camera.js";
import map from "./map.js";
import * as ma from "./utils/math.js";
import * as mm from "./math.js";
import Sprite from "./sprite.js";
import image from "./gfxlib/image.js";
import shader from "./gfxlib/shader.js";
import terraVertSrc from "./glsl/terra.vert.js";
import terraFragSrc from "./glsl/terra.frag.js";
import spriteVertSrc from "./glsl/sprite.vert.js";
import spriteFragSrc from "./glsl/sprite.frag.js";

const gl = display.gl;
const glia = display.glia;
const glvao = display.glvao;

const coords = new Buffer(false, "static", "float", 2 * mm.verts);
const indices = new Buffer(true, "static", "ushort", mm.indices);
const verts = new Buffer(false, "static", "ubyte", 8).set(0, [0,0, 1,0, 0,1, 1,1]);

const terraShader = shader("terra", terraVertSrc, terraFragSrc);
const spriteShader = shader("sprite", spriteVertSrc, spriteFragSrc);
const terraShaderVars = terraShader.vars;
const spriteShaderVars = spriteShader.vars;
const terraImg = image("gfx/terra.png", true);

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
verts.update();

export default class Chunk
{
	constructor(pos)
	{
		this.pos = pos;
		
		this.spriteList = Array(mm.chunkVerts);
		this.textures   = Array(8);
		
		this.heights = new Buffer(false, "dynamic", "ubyte", mm.verts);
		this.terra   = new Buffer(false, "dynamic", "ubyte", mm.verts);
		this.coefs   = new Buffer(false, "dynamic", "float", mm.verts);
		this.sprites = new Buffer(false, "dynamic", "float", mm.chunkVerts * mm.blockSize);
		
		this.terraVao = new VertexArray(terraShader);
		this.terraVao.indices(indices);
		this.terraVao.assign(coords,       "coord",  2);
		this.terraVao.assign(this.heights, "height", 1);
		this.terraVao.assign(this.terra,   "terra",  1);
		this.terraVao.assign(this.coefs,   "coef",   1);
		
		this.spriteVao = new VertexArray(spriteShader);
		this.spriteVao.assign(verts,        "vert",    2);
		this.spriteVao.assign(this.sprites, "anchor",  2, mm.blockStride, 4 * 0,  1);
		this.spriteVao.assign(this.sprites, "size",    2, mm.blockStride, 4 * 2,  1);
		this.spriteVao.assign(this.sprites, "flatPos", 2, mm.blockStride, 4 * 4,  1);
		this.spriteVao.assign(this.sprites, "texPos",  2, mm.blockStride, 4 * 6,  1);
		this.spriteVao.assign(this.sprites, "texSize", 2, mm.blockStride, 4 * 8,  1);
		this.spriteVao.assign(this.sprites, "texId",   1, mm.blockStride, 4 * 10, 1);
		this.spriteVao.assign(this.sprites, "opacity", 1, mm.blockStride, 4 * 11, 1);
	}
	
	init()
	{
		for(let y=0; y < mm.vertRows; y++) {
			for(let x=0; x < mm.vertsPerRow; x++) {
				let p = mm.globalCoord(this.pos, [x, y]);
				let h = map.gen.height(p);
				let t = map.gen.terra(p);
				let i = mm.linearLocalCoord([x, y]);
		
				this.heights.set(i, h);
				this.terra.set(i, t);
			
				if(x === mm.vertsPerRow - 1 || y === mm.vertRows - 1) {
					map.setHeight(p, h);
					map.setTerra(p, t);
				}
			}
		}
		
		for(var y=0; y < mm.chunkHeight; y++) {
		//for(var y=0; y < 1; y++) {
			for(var x=0; x < mm.chunkWidth; x++) {
			//for(var x=0; x < 1; x++) {
				if(Math.random() < 0.03125) {
					let gp = mm.globalCoord(this.pos, [x, y]);
					let sprite = new Sprite(image("gfx/tree.png"), gp);
					sprite.anchor = [0.5, 0.875];
				}
			}
		}
	}
	
	updateNormal(lp)
	{
		let i = mm.linearLocalCoord(lp);
		let p = mm.globalCoord(this.pos, lp);
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
		let c = mm.sqrt2h * (2 * CzFz + BzEz - AzDz + 6) / ma.sqrt(3 * sqt1**2 + sqt2**2 + 36);
		
		// gamma adjustment
		this.coefs.set(i, c**2 * 1.5);
	}
	
	updateNormals()
	{
		for(let y=0; y < mm.vertRows; y++) {
			for(let x=0; x < mm.vertsPerRow; x++) {
				this.updateNormal([x, y]);
			}
		}
	}
	
	updateNormalsLeftEdge()
	{
		for(let y=0; y < mm.vertRows; y++) {
			this.updateNormal([0, y]);
		}
	}
	
	updateNormalsTopEdge()
	{
		for(let x=0; x < mm.vertsPerRow; x++) {
			this.updateNormal([x, 0]);
		}
	}
	
	updateNormalsRightEdge()
	{
		for(let y=0; y < mm.vertRows; y++) {
			this.updateNormal([mm.vertsPerRow - 1, y]);
			this.updateNormal([mm.vertsPerRow - 2, y]);
		}
	}
	
	updateNormalsBottomEdge()
	{
		for(let x=0; x < mm.vertsPerRow; x++) {
			this.updateNormal([x, mm.vertRows - 1]);
			this.updateNormal([x, mm.vertRows - 2]);
		}
	}
	
	drawTerra()
	{
		this.heights.update();
		this.terra.update();
		this.coefs.update();		
		this.terraVao.bind();
		
		terraShader.use();
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, terraImg.frame.tex);
		
		gl.uniform1i(terraShaderVars.tex, 0);
		gl.uniform1f(terraShaderVars.triaHeight, mm.triaHeight);
		gl.uniform1f(terraShaderVars.heightScale, mm.heightScale);
		gl.uniform2fv(terraShaderVars.chunkSize, mm.chunkDims);
		gl.uniform2fv(terraShaderVars.texDivision, mm.texDivision);
		gl.uniformMatrix4fv(terraShaderVars.camera, false, camera._mat);
		gl.uniform2fv(terraShaderVars.chunkCoord, this.pos);
		
		gl.drawElements(gl.TRIANGLE_STRIP, mm.indices, gl.UNSIGNED_SHORT, 0);
	}
	
	drawSprites()
	{
		let textures = [];
		let texids   = [];
		
		this.spriteList.forEach(sprite => {
			if(sprite) {
				let tex   = sprite._img.frame.tex;
				let texid = textures.indexOf(tex);
			
				if(texid < 0) {
					texid = textures.length;
					textures.push(tex);
					texids.push(texid);
					gl.activeTexture(gl.TEXTURE0 + texid);
					gl.bindTexture(gl.TEXTURE_2D, tex);
				}
			
				sprite.update(texid);
			}
		});
		
		if(texids.length === 0) {
			return;
		}
		
		this.sprites.update(true);
		this.spriteVao.bind();

		spriteShader.use();

		gl.uniform1iv(spriteShaderVars.textures, texids);
		gl.uniform2fv(spriteShaderVars.camPos, camera.pos);
		gl.uniform2fv(spriteShaderVars.screenSize, display.size);
		gl.uniform1f(spriteShaderVars.scale, camera.zoom);
		gl.uniform1f(spriteShaderVars.zoom, camera.totalZoom);
		glia.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, mm.chunkVerts);
	}
}
