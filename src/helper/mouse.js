function Mouse(eventTarget)
{
	this.onMouseEvent = this.onMouseEvent.bind(this);
	this.onWheelEvent = this.onWheelEvent.bind(this);
	
	Emitter.call(this);
	
	this.eventTarget = eventTarget;
	this.eventTarget.addEventListener("mousedown", this.onMouseEvent);
	this.eventTarget.addEventListener("mouseup", this.onMouseEvent);
	this.eventTarget.addEventListener("mousemove", this.onMouseEvent);
	this.eventTarget.addEventListener("dblclick", this.onMouseEvent);
	this.eventTarget.addEventListener("wheel", this.onWheelEvent);
}

Mouse.prototype = Object.create(Emitter.prototype);

(function() {
	
	this.onMouseEvent = function(e)
	{
		var id = e.type;
		
		if(this.hasListeners(id)) {
			var clientRect = this.eventTarget.getBoundingClientRect();
			var eventData = {
				x: e.clientX - clientRect.left,
				y: e.clientY - clientRect.top,
				primaryButton: e.buttons & 1 > 0,
				secondaryButton: e.buttons & 2 > 0,
				auxilaryButton: e.buttons & 4 > 0,
				ctrl: e.ctrlKey,
				alt: e.altKey,
				shift: e.shiftKey,
				meta: e.metaKey
			};
		
			this.trigger(id, eventData);
			
			e.preventDefault();
			
			if(eventData.primaryButton) {
				this.eventTarget.focus();
			}
		}
	};
	
	this.onWheelEvent = function(e)
	{
		if(e.deltaY > 0) {
			this.trigger("wheeldown");
		}
		else if(e.deltaY < 0) {
			this.trigger("wheelup");
		}
	};

}).call(Mouse.prototype);
