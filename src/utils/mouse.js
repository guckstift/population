const mouseBtns = ["left", "middle", "right"];

export default class Mouse
{
	constructor(target)
	{
		this.target = target;
		this.clear();
		
		target.addEventListener("mousemove", e => {
			this.updateState(e);
			this.cbs.move.forEach(cb => cb(e));
		});
		
		target.addEventListener("mousedown", e => {
			this.updateState(e);
			this.btns[mouseBtns[e.button]] = true;
			this.cbs.down[mouseBtns[e.button]].forEach(cb => cb(e));
		});
		
		target.addEventListener("mouseup", e => {
			this.updateState(e);
			this.btns[mouseBtns[e.button]] = false;
			this.cbs.up[mouseBtns[e.button]].forEach(cb => cb(e));
		});
		
		target.addEventListener("wheel", e => {
			this.updateState(e);
			
			if(e.deltaY > 0) {
				this.cbs.scroll.down.forEach(cb => cb(e));
			}
			else {
				this.cbs.scroll.up.forEach(cb => cb(e));
			}
		});
	}
	
	updateState(e)
	{
		let targetRect = this.target.getBoundingClientRect();
		this.pos = [e.clientX - targetRect.left, e.clientY - targetRect.top];
		//this.pos = [e.offsetX, e.offsetY];
		this.rel = [e.movementX, e.movementY];
	}
	
	clear()
	{
		this.cbs = {
			move: [],
			down: {left: [], right: [], middle: []},
			up: {left: [], right: [], middle: []},
			scroll: {up: [], down: []},
		};
		
		this.btns = {
			left: false, right: false, middle: false
		};
		
		this.pos = [0, 0];
		this.rel = [0, 0];
	}
	
	lock()
	{
		this.target.requestPointerLock();
	}
	
	unlock()
	{
		document.exitPointerLock();
	}
	
	move(cb)
	{
		this.cbs.move.push(cb);
	}
	
	down(button, cb)
	{
		this.cbs.down[button].push(cb);
	}
	
	up(button, cb)
	{
		this.cbs.up[button].push(cb);
	}
	
	scroll(dir, cb)
	{
		this.cbs.scroll[dir].push(cb);
	}
}
