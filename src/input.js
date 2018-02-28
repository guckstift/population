function Input(gl, camera)
{
	if(!(this instanceof Input)) {
		return new Input(gl, camera);
	}
	
	this.gl = gl;
	this.elm = gl.canvas;
	this.moving = false;
	this.mouse = [0, 0];
	this.mouseRel = [0, 0];
	
	this.elm.addEventListener("mousemove", this.onMouseMove.bind(this));
	this.elm.addEventListener("mousedown", this.onMouseDown.bind(this));
	this.elm.addEventListener("mouseup", this.onMouseUp.bind(this));
	this.elm.addEventListener("wheel", this.onMouseWheel.bind(this));
}

Input.prototype = {

	constructor: Input,
	
	updateMouse: function(e)
	{
		var rect = this.elm.getBoundingClientRect();
		this.mouseRel = [e.movementX, e.movementY];
		this.mouse = [e.clientX - rect.left, e.clientY - rect.top];
	},
	
	onMouseMove: function(e)
	{
		var gl = this.gl;
		
		this.updateMouse(e);
	
		if(this.moving) {
			camera.move(
				this.mouseRel[0] / camera.zoom,
				this.mouseRel[1] / camera.zoom,
			);
		}
		
		var p = pickMapCoord(this.mouse);
		var screenCoord = mapToScreen(p);
	},
	
	onMouseDown: function(e)
	{
		this.updateMouse(e);
		this.moving = true;
		this.gl.canvas.requestPointerLock();
	},
	
	onMouseUp: function(e)
	{
		this.updateMouse(e);
		this.moving = false;
		document.exitPointerLock();
	},
	
	onMouseWheel: function(e)
	{
		this.updateMouse(e);

		if(e.deltaY > 0) {
			this.onMouseWheelDown();
		}
		else {
			this.onMouseWheelUp();
		}
	},
	
	onMouseWheelDown: function()
	{
		camera.zoom /= 1.25;
	},
	
	onMouseWheelUp: function()
	{
		camera.zoom *= 1.25;
	},

};
