var POINTS        = 0;
var LINESTRIP     = 1;
var LINELOOP      = 2;
var LINES         = 3;
var TRIANGLESTRIP = 4;
var TRIANGLEFAN   = 5;
var TRIANGLES     = 6;

class Display
{
	constructor()
	{
		this.renderFrame = this.renderFrame.bind(this);
		this.onRender    = noop;
		this.canvas      = elmById("canvas");
		this.gl          = this.canvas.getContext("webgl", {antialias: false, alpha: false});
		this.indexbuf    = undefined;
		
		var gl = this.gl;
		
		this.drawmodes = [
			this.gl.POINTS,
			this.gl.LINE_STRIP,
			this.gl.LINE_LOOP,
			this.gl.LINES,
			this.gl.TRIANGLE_STRIP,
			this.gl.TRIANGLE_FAN,
			this.gl.TRIANGLES
		];
		
		this.resize(1024, 768);
		//this.resize(800, 600);
		this.setClearColor(0, 0, 0, 1);
		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		requestAnimationFrame(this.renderFrame);
	}
	
	resize(width, height)
	{
		this.canvas.width  = width;
		this.canvas.height = height;
		this.size = [width, height];
		
		this.gl.viewport(0, 0, width, height);

		return this;
	}
	
	setClearColor(r, g, b, a)
	{
		this.gl.clearColor(r, g, b, a);

		return this;
	}
	
	setOnRender(onRender)
	{
		this.onRender = onRender;
		
		return this;
	}
	
	renderFrame()
	{
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.onRender();
		
		requestAnimationFrame(this.renderFrame);
	}
	
	setIndices(indexbuf)
	{
		var gl = this.gl;
		
		this.indexbuf = indexbuf;
		
		if(this.indexbuf) {
			indexbuf.update();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexbuf.buf);
		}

		return this;
	}
	
	draw(mode, count)
	{
		var gl = this.gl;
		
		if(this.indexbuf) {
			gl.drawElements(this.drawmodes[mode], count, this.indexbuf.gltype, 0);
		}
		else {
			gl.drawArrays(mode, 0, count);
		}
	}
}
