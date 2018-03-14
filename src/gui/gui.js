function Gui(gl)
{
	this.gl = gl;
	this.mouse = new Mouse(gl.canvas);
	this.mouse.register("mousedown", this.onMouseDown.bind(this));
	this.widgets = [];
	this.batch = gl.spritebatch();
	this.font = Font(gl);
	this.ready = false;
	this.atlas = gl.atlas("gfx/gui.json", this.onAtlasReady.bind(this));
}

Gui.prototype = {

	onAtlasReady: function()
	{
		this.ready = true;
	},

	add: function(widget)
	{
		this.widgets.push(widget);
	},
	
	draw: function()
	{
		this.batch.clear();
		
		for(var i=0; i<this.widgets.length; i++) {
			var widget = this.widgets[i];
			
			widget.render(this);
		}
		
		this.batch.draw();
	},

	onMouseDown: function(e)
	{
		log(e);
	}
}
