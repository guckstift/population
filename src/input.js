function Input()
{
	this.moving = false;
	
	document.addEventListener("mousemove", this.onMouseMove.bind(this));
	document.addEventListener("mousedown", this.onMouseDown.bind(this));
	document.addEventListener("mouseup", this.onMouseUp.bind(this));
	document.addEventListener("wheel", this.onMouseWheel.bind(this));
}

Input.prototype = {

	constructor: Input,
	
	updateMouse: function(e)
	{
		this.mouseX = e.clientX;
		this.mouseY = e.clientY;
		this.mouseRelX = e.movementX;
		this.mouseRelY = e.movementY;
	},
	
	onMouseMove: function(e)
	{
		this.updateMouse(e);
	
		if(this.moving) {
			camera.move(this.mouseRelX, this.mouseRelY);
		}
		
		console.log(
			(this.mouseX - display.width/2) / camera.zoom + camera.pos[0],
			floor( (this.mouseY - display.height/2) / camera.zoom + camera.pos[1]),
		);
		
		//label.setPos(this.mouseX, this.mouseY);
	},
	
	onMouseDown: function(e)
	{
		this.updateMouse(e);
		this.moving = true;
		display.canvas.requestPointerLock();
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
