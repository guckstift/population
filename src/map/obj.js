function Obj(frame, pos)
{
	this.frame = frame;
	this.pos = pos || [0, 0];
	this.chunk = null;
}

Obj.prototype = {

	constructor: Obj,
	
	attachChunk: function(chunk)
	{
		this.chunk = chunk || null;
		
		return this;
	},
	
	setPos: function(pos)
	{
		this.pos = pos;
		
		if(this.chunk !== null) {
			this.chunk.updateData(this);
		}
		
		return this;
	},
	
	setFrame: function(frame)
	{
		this.frame = frame;
		
		if(this.chunk !== null) {
			this.chunk.updateData(this);
		}
		
		return this;
	},

};
