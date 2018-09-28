export default class Animation
{
	constructor(imgs, fps = 15)
	{
		this.imgs  = imgs;
		this.fps   = fps;
		this.dura  = 1000 / fps;
		this.count = imgs.length;
	}
}
