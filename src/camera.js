class Camera
{
	constructor(pos)
	{
		this.pos = pos || [0, 0];
	}
	
	move(rel)
	{
		this.pos[0] = clamp(0, boxSize, this.pos[0] + rel[0]);
		this.pos[1] = clamp(0, boxSize, this.pos[1] + rel[1]);
	}
}
