function Frame(texture, framedata)
{
	this.texture = texture;
	this.name = framedata.name;
	this.pos = framedata.pos;
	this.size = framedata.size;
	this.osize = framedata.osize;
	this.pad = framedata.pad;
	this.pivot = [128 - this.pad[0], 112 - this.pad[1]];
}

cache.frames = cache.frames || {};

loader.atlas = function(url, callback, disp)
{
	var jsonLoad;
	var texLoad;
	var json;
	
	callback = callback || noop;
	disp = disp || display;

	if(this.getItem(url) !== undefined) {
		callback();
	}

	this.json(url, jsonLoad.bind(this));

	return this;

	function jsonLoad()
	{
		json = this.getItem(url);
		
		this.texture(json.source, texLoad.bind(this))
	}
	
	function texLoad()
	{
		var tex = this.getItem(json.source);
		
		for(var i=0; i<json.frames.length; i++) {
			var framedata = json.frames[i];
			var frame = new Frame(tex, framedata);
			
			cache.frames[this.filenameToIdent(framedata.name)] = frame;
		}
		
		callback();
	}
}
