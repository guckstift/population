function Emitter()
{
	this.events = {};
}

Emitter.prototype = {

	getListeners: function(event)
	{
		if(typeof event === "string") {
			return this.events[event] || [];
		}
		else {
			var allListeners = [];
			
			for(var listeners in this.events) {
				allListeners.push.apply(allListeners, listeners);
			}
			
			return allListeners;
		}
	},
	
	hasListeners: function(event)
	{
		if(typeof event === "string") {
			var listeners = this.events[event] = this.events[event] || [];
			
			return listeners.length > 0;
		}
		else {
			for(var event in this.events) {
				if(this.events.hasOwnProperty(event) && this.events[event].length > 0) {
					return true;
				}
				
				return false;
			}
		}
	},

	register: function(event, listener)
	{
		var listeners = this.events[event] = this.events[event] || [];
		var index = listeners.indexOf(listener);
	
		if(index === -1) {
			listeners.push(listener);
		}
	
		return this;
	},

	unregister: function(event, listener)
	{
		if(event !== undefined) {
			if(listener !== undefined) {
				var listeners = this.events[event] = this.events[event] || [];
				var index = listeners.indexOf(listener);
	
				if(index !== -1) {
					listeners.splice(index, 1);
				}
	
				return this;
			}
			else {
				this.events[event] = [];
			}
		}
		else {
			this.events = { };
		}
	
		return this;
	},

	trigger: function(event, data)
	{
		var listeners = this.events[event] = this.events[event] || [];
		var data = data || [];
	
		for(var i=0; i<listeners.length; i++) {
			listeners[i](data, this);
		}
	
		return this;
	},
	
};
