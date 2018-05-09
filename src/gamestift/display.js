import Buffer from "./buffer.js";
import Shader from "./shader.js";
import ImgTexture from "./imgtexture.js";
import DataTexture from "./datatexture.js";

export default class Display
{
	constructor(glOptions)
	{
		this.canvas     = document.createElement("canvas");
		this.gl         = this.canvas.getContext("webgl", glOptions);
		this.indices    = undefined;
		this.usedshader = undefined;
		this.glia       = this.gl.getExtension("ANGLE_instanced_arrays");
		
		this.drawmodes = {
			points:        this.gl.POINTS,
			linestrip:     this.gl.LINE_STRIP,
			lineloop:      this.gl.LINE_LOOP,
			lines:         this.gl.LINES,
			trianglestrip: this.gl.TRIANGLE_STRIP,
			trianglefan:   this.gl.TRIANGLE_FAN,
			triangles:     this.gl.TRIANGLES
		};
		
		this.resize(800, 600);
	}
	
	resize(...size)
	{
		this.size          = size;
		this.canvas.width  = size[0];
		this.canvas.height = size[1];
		this.gl.viewport(0, 0, ...size);

		return this;
	}
	
	appendTo(elm)
	{
		elm.appendChild(this.canvas);

		return this;
	}
	
	appendToBody()
	{
		this.appendTo(document.body);
		
		return this;
	}
	
	setClearColor(...color)
	{
		this.gl.clearColor(...color);
	}
	
	clear()
	{
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}
	
	setIndices(indices)
	{
		var gl = this.gl;

		this.indices = indices;

		if(this.indices) {
			indices.update();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buf);
		}

		return this;
	}
	
	draw(mode, count, instances = 1)
	{
		var gl = this.gl;
		
		if(this.glia) {
		    if(this.indices) {
		        this.glia.drawElementsInstancedANGLE(
		        	this.drawmodes[mode], count, this.indices.gltype, 0, instances
		        );
		    }
		    else {
		        this.glia.drawArraysInstancedANGLE(this.drawmodes[mode], 0, count, instances);
		    }
	    }
	    else {
		    if(this.indices) {
		        gl.drawElements(this.drawmodes[mode], count, this.indices.gltype, 0);
		    }
		    else {
		        gl.drawArrays(this.drawmodes[mode], 0, count);
		    }
	    }
	}
	
	buffer(...args)
	{
		return new Buffer(this, ...args);
	}
	
	shader(...args)
	{
		return new Shader(this, ...args);
	}
	
	texture(...args)
	{
		if(typeof args[1] === "number") {
			return new DataTexture(this, ...args);
		}
		else {
			return new ImgTexture(this, ...args);
		}
	}
}
