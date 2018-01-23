function Offscreen(width, height, display)
{
	display = display || window.display;
	
	var gl = display.gl;
	
	this.display = display;
	this.gl = display.gl;
	this.width = width;
	this.height = height;
}
