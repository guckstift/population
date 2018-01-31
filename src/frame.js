function Frame(texture, framedata)
{
	this.texture = texture;
	this.pos = framedata.texpos;
	this.size = framedata.size;
	
	this.pivot = [
		128 - framedata.bbox[0],
		112 - framedata.bbox[1],
	];
}
