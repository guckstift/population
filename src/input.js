function Input(display)
{
	display = display || window.display;
	
	this.display = display;
	this.elm = display.container;
	this.moving = false;
	
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
		
		this.mouseX = e.clientX - rect.left;
		this.mouseY = e.clientY - rect.top;
		this.mouseRelX = e.movementX;
		this.mouseRelY = e.movementY;
	},
	
	onMouseMove: function(e)
	{
		this.updateMouse(e);
	
		if(this.moving) {
			camera.move(this.mouseRelX, this.mouseRelY);
		}
		
		var y = ((this.mouseY - display.height / 2) / camera.zoom + camera.pos[1]) * 2;
		var my = floor(y);
		var x =  (this.mouseX - display.width  / 2) / camera.zoom + camera.pos[0] - my % 2 * 0.5;
		var mx = round(x);
		var before = x < mx;
		var oddstart = my % 2 === 1;
		
		log(x, y);
		log(mx, my);
		log(before);
		
		for(var i=0; i<6; i++) {
			var oddrow = (my + i) % 2 === 1;
			var oddshift = oddstart ? !oddrow && !before * +1 : oddrow && before * -1;
			var screenPos = map.mapToScreen(mx + oddshift, my + i);
			labels[i].setPos(screenPos[0], screenPos[1]);
		}
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
