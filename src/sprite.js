class Sprite
{
	constructor(frame, pos)
	{
		this.batch  = undefined;
		this.id     = undefined;
		
		this.setFrame(frame);
		this.setPos(pos || [0, 0, 0]);
	}
	
	setFrame(frame)
	{
		this.frame = frame;
		
		if(this.batch) {
			this.batch.update(this);
		}
		
		return this;
	}
	
	setPos(pos)
	{
		this.pos = pos;
	
		if(this.batch) {
			this.batch.reorder(this);
			this.batch.update(this);
		}
	
		return this;
	}
}
