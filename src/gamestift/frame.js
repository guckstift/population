export default class Frame
{
	constructor(texture, framedata)
	{
		this.texture = texture;
		this.name    = framedata.name;
		this.size    = framedata.size;
		this.osize   = framedata.osize;
		this.pos     = framedata.pos;
		this.pad     = framedata.pad;
		
		this.texcoordpos = [
			framedata.pos[0] / texture.size[0],
			framedata.pos[1] / texture.size[1],
		];
		
		this.texcoordsize = [
			framedata.size[0] / texture.size[0],
			framedata.size[1] / texture.size[1],
		];
	}
}
