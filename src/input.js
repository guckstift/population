class Input
{
	constructor(elm)
	{
		this.elm      = elm;
		this.mouse    = [0, 0];
		this.mouseRel = [0, 0];
		this.lmb      = false;
		this.rmb      = false;
		this.mmb      = false;
		
		this.elm.addEventListener("mousedown", this.onMouseDown.bind(this));
		this.elm.addEventListener("mouseup", this.onMouseUp.bind(this));
		this.elm.addEventListener("mousemove", this.onMouseMove.bind(this));
		
		this.setOnMouseDown(noop);
		this.setOnMouseUp(noop);
		this.setOnMouseMove(noop);
		
		addEventListener("contextmenu", function(e) { e.preventDefault(); });
	}
	
	updateMouse(e)
	{
		var rect = this.elm.getBoundingClientRect();
		
		this.mouseRel = [e.movementX, e.movementY];
		this.mouse    = [e.clientX - rect.left, e.clientY - rect.top];
		this.lmb      = (e.buttons & 1) > 0;
		this.rmb      = (e.buttons & 2) > 0;
		this.mmb      = (e.buttons & 4) > 0;
	}
	
	onMouseDown(e)
	{
		e.preventDefault();
		this.updateMouse(e);
		this.mouseDownCB(this);
	}
	
	onMouseUp(e)
	{
		e.preventDefault();
		this.updateMouse(e);
		this.mouseUpCB(this);
	}
	
	onMouseMove(e)
	{
		e.preventDefault();
		this.updateMouse(e);
		this.mouseMoveCB(this);
	}
	
	setOnMouseDown(onMouseDown)
	{
		this.mouseDownCB = onMouseDown;
		
		return this;
	}
	
	setOnMouseUp(onMouseUp)
	{
		this.mouseUpCB = onMouseUp;
		
		return this;
	}
	
	setOnMouseMove(onMouseMove)
	{
		this.mouseMoveCB = onMouseMove;
		
		return this;
	}
	
	lockPointer()
	{
		this.elm.requestPointerLock();
	}
	
	unlockPointer()
	{
		document.exitPointerLock();
	}
}
