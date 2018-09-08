var frames = {};

function initFrameset(display, framesets)
{
	var frames = {};
	
	for(var framesetname in framesets) {
		var frameset = framesets[framesetname];
		
		frameset.img = elmBySrc(frameset.texurl);
		frameset.tex = new Texture(display).fromImage(frameset.img);
		
		for(var framename in frameset.frames) {
			var frame = frameset.frames[framename];
			
			frame.tex = frameset.tex;
		}
	}
}
