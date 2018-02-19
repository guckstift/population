function Obj(frame, pos)
{
	this.frame = frame;
	this.pos = pos || [0, 0];
	this.chunk = undefined;
	
	this.direction = ""; // "", "r", "l", "ru", "rd", "lu", "ld"
	this.offset = 0; // between 0 and 1 of this.pos and the adjacent vertex of this.direction
}

Obj.prototype = {

	constructor: Obj,
	
	attachChunk: function(chunk)
	{
		this.chunk = chunk || undefined;
		
		return this;
	},
	
	setPos: function(pos)
	{
		var chunk = this.chunk;
		
		if(chunk !== undefined) {
			chunk.remove(this);
		}
		
		this.pos = pos;
		
		if(chunk !== undefined) {
			chunk.map.addObj(this);
		}
		
		return this;
	},
	
	setFrame: function(frame)
	{
		this.frame = frame;
		
		if(this.chunk !== undefined) {
			this.chunk.updateData(this);
		}
		
		return this;
	},

};
