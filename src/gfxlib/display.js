import {createGl} from "./utils.js";
import DrawList from "./drawlist.js";

const pageReady = new Promise(res => window.addEventListener("load", res));

class Display extends DrawList
{
	constructor()
	{
		super();
		
		this.gl = createGl({alpha: false, antialias: false});
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		this.glia  = this.gl.getExtension("ANGLE_instanced_arrays");
		this.glvao = this.gl.getExtension("OES_vertex_array_object");
		this.glfd  = this.gl.getExtension("EXT_frag_depth");
		
		this.canvas = this.gl.canvas;
		
		this.accuTime   = 0;
		this.accuFrames = 0;
		this.fps        = 0;
		
		this.onResize = this.onResize.bind(this);
		this.onFrame = this.onFrame.bind(this);
		this.onResize();
		
		window.addEventListener("resize", this.onResize);
		window.requestAnimationFrame(this.onFrame);
		
		this.bgcolor  = [0, 0, 0, 0];
		this.framecbs = [];
	}
	
	get width()
	{
		return this.canvas.width;
	}
	
	get height()
	{
		return this.canvas.height;
	}
	
	get size()
	{
		return [this.canvas.width, this.canvas.height];
	}
	
	set bgcolor(rgb)
	{
		this.gl.clearColor(...rgb, 1);
	}
	
	set fullpage(fullpage)
	{
		if(fullpage) {
			this.canvas.style.position = "fixed";
			this.canvas.style.left = "0";
			this.canvas.style.top = "0";
			this.canvas.style.width = "100%";
			this.canvas.style.height = "100%";
			pageReady.then(() => window.document.body.appendChild(this.canvas));
		}
		else {
			this.canvas.style.position = null;
			this.canvas.style.left = null;
			this.canvas.style.top = null;
			this.canvas.style.width = null;
			this.canvas.style.height = null;
			
			if(this.canvas.parentNode) {
				this.canvas.parentNode.removeChild(this.canvas);
			}
		}
	}
	
	frame(cb)
	{
		this.framecbs.push(cb);
	}
	
	onResize()
	{
		let rect = this.canvas.getBoundingClientRect();
		
		this.canvas.width = rect.width;//window.innerWidth;
		this.canvas.height = rect.height;//window.innerHeight;
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}
	
	onFrame(now)
	{
		window.requestAnimationFrame(this.onFrame);
		
		this.last = this.last || now;
		this.delta = now - this.last;
		this.last = now;
		this.accuTime += this.delta;
		this.accuFrames ++;
		
		if(this.accuTime >= 1000) {
			this.fps = this.accuFrames;
			this.accuTime -= 1000;
			this.accuFrames = 0;
		}
		
		this.framecbs.forEach(cb => cb());
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.each(drawable => drawable.draw());
	}
}

const defDisplay = new Display();
export default defDisplay;
export const gl = defDisplay.gl;
