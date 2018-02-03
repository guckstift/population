function Sprite(frame)
{
	this.frame = frame;
	this.pos = [0, 0];
	this.id = -1;
	this.batch = null;
}

Sprite.prototype = {

	constructor: Sprite,
	
	attachBatch: function(batch, id)
	{
		this.batch = batch;
		this.id = id;
		
		return this;
	},
	
	setPos: function(pos)
	{
		this.pos = pos;
		
		if(this.batch !== null) {
			this.batch.updateSpriteData(this);
		}
		
		return this;
	},
	
	setFrame: function(frame)
	{
		this.frame = frame;
		
		if(this.batch !== null) {
			this.batch.updateSpriteData(this);
		}
		
		return this;
	},

};
