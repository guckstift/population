function Display()
{
	this.onWindowResize = this.onWindowResize.bind(this);
	this.onFrame = this.onFrame.bind(this);
	this.onRender = noop;
	this.onResize = noop;
	
	this.container = newElm("div");
	this.canvas = newElm("canvas");
	this.gl = this.canvas.getContext("webgl", { antialias: false });
	this.glia = this.gl.getExtension("ANGLE_instanced_arrays");
	this.gleiu = this.gl.getExtension("OES_element_index_uint");
	
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

	this.resize(800, 600);
	this.setBgColor(0.0, 0.0, 0.0, 1.0);
	
	this.container.appendChild(this.canvas);
	this.container.style.position = "relative";
	
	requestAnimationFrame(this.onFrame);
}

Display.prototype = {

	constructor: Display,
	
	attachTo: function(element)
	{
		element.appendChild(this.container);
		
		return this;
	},

	attachToBody: function()
	{
		this.attachTo(document.body);
		
		return this;
	},
	
	detach: function()
	{
		this.container.remove();
		
		return this;
	},

	resize: function(width, height)
	{
		this.width = width;
		this.height = height;;
		this.canvas.width = width;
		this.canvas.height = height;
		this.container.style.width = width + "px";
		this.container.style.height = height + "px";
	
		this.gl.viewport(0, 0, width, height);
		
		return this;
	},

	enableFullPageMode: function()
	{
		this.container.style.position = "absolute";
		this.container.style.top = "0";
		this.container.style.left = "0";
		this.canvas.style.position = "absolute";
		this.canvas.style.top = "0";
		this.canvas.style.left = "0";
	
		addEventListener("resize", this.onWindowResize);
	
		this.onWindowResize();
		
		return this;
	},

	disableFullPageMode: function()
	{
		this.container.style.position = "relative";
		this.container.style.top = "";
		this.container.style.left = "";
		this.canvas.style.position = "";
		this.canvas.style.top = "";
		this.canvas.style.left = "";
	
		removeEventListener("resize", this.onWindowResize);
		
		return this;
	},

	setBgColor: function(r, g, b, a)
	{
		this.bgColor = [r, g, b, a];
		this.gl.clearColor(r, g, b, a);
		
		return this;
	},

	onWindowResize: function()
	{
		this.resize(innerWidth, innerHeight);
	},

	onFrame: function(now)
	{
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.onRender(now);
		requestAnimationFrame(this.onFrame);
	},

};

display = new Display();
