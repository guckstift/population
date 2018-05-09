export default class Input
{
	constructor(elm)
	{
		this.elm      = elm;
		this.mouse    = [0, 0];
		this.mouseRel = [0, 0];
		this.lmb      = false;
		this.rmb      = false;
		this.mmb      = false;
		
		this.elm.addEventListener("mousedown", e => this.onMouseDown(e));
		this.elm.addEventListener("mouseup", e => this.onMouseUp(e));
		this.elm.addEventListener("mousemove", e => this.onMouseMove(e));
		this.elm.addEventListener("wheel", e => this.onMouseWheel(e));
		
		document.addEventListener("keydown", e => this.onKeyDown(e));
		document.addEventListener("keyup", e => this.onKeyUp(e));
		
		this.setOnMouseDown(() => {});
		this.setOnMouseUp(() => {});
		this.setOnMouseMove(() => {});
		this.setOnMouseWheel(() => {});
		
		this.setOnKeyDown(() => {});
		this.setOnKeyUp(() => {});
		
		addEventListener("contextmenu", e => {e.preventDefault()});
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
	
	onMouseWheel(e)
	{
		this.mouseWheelCB(e.deltaY);
	}
	
	onKeyDown(e)
	{
		this.onKeyDownCB(e.key);
	}
	
	onKeyUp(e)
	{
		this.onKeyUpCB(e.key);
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
	
	setOnMouseWheel(onMouseWheel)
	{
		this.mouseWheelCB = onMouseWheel;
		
		return this;
	}
	
	setOnKeyDown(onKeyDown)
	{
		this.onKeyDownCB = onKeyDown;
		
		return this;
	}
	
	setOnKeyUp(onKeyUp)
	{
		this.onKeyUpCB = onKeyUp;
		
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
