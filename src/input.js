function Input(disp)
{
	disp = disp || display;
	
	this.display = disp;
	this.elm = disp.container;
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
		var x =  (this.mouseX - display.width  / 2) / camera.zoom + camera.pos[0] - abs(my % 2) * 0.5;
		var mx = round(x);
		var before = x < mx;
		var oddstart = abs(my % 2) === 1;
		
		/*log("x y", x, y);
		log("mx my", mx, my);
		log("before", before);
		log("oddstart", oddstart);
		*/
		
		var bestd = 1000000;
		var bestx = 1000000;
		var besty = 1000000;
		
		for(var i=0; i<6; i++) {
			var oddrow = abs((my + i) % 2) === 1;
			var oddshift = oddstart ? !oddrow * !before * +1 : oddrow * before * -1;
			var scx = mx + oddshift;
			var scy = my + i;
			var screenPos = mapToScreen([scx, scy, map.getHeight([scx, scy])]);
			var dist = pow(this.mouseX - screenPos[0], 2) + pow(this.mouseY - screenPos[1], 2);
			
			labels[i].setPos(screenPos[0], screenPos[1]);
			
			if(dist < bestd) {
				bestd = dist;
				bestx = scx;
				besty = scy;
			}
		}
		
		var screenPos = mapToScreen([bestx, besty, map.getHeight([bestx, besty])]);
		labels[0].setPos(screenPos[0], screenPos[1]);
		labels[1].setPos(0, 0);
		labels[2].setPos(0, 0);
		labels[3].setPos(0, 0);
		labels[4].setPos(0, 0);
		labels[5].setPos(0, 0);
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
