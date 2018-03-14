function Button(pos, text)
{
	this.pos = pos;
	this.size = [0, 0];
	this.text = text;
	this.down = false;
}

Button.prototype = {

	constructor: Button,
	
	render: function(gui)
	{
		if(!gui.ready) {
			return this;
		}
		
		var size = this.size;
		var pos = this.pos;
		var scaleX = (size[0] - 32) / 32;
		var scaleY = (size[1] - 32) / 32;
		var downStr = this.down ? "_down" : "";
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_tl"], pos, [0, 0])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_tr"], [pos[0] + size[0], pos[1]], [1, 0])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_bl"], [pos[0], pos[1] + size[1]], [0, 1])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_br"], vec2.add(pos, size), [1, 1])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_l"], [pos[0], pos[1] + 16], [0, 0])
			.setScale([1, scaleY])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_t"], [pos[0] + 16, pos[1]], [0, 0])
			.setScale([scaleX, 1])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_r"], [pos[0] + size[0], pos[1] + 16], [1, 0])
			.setScale([1, scaleY])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_b"], [pos[0] + 16, pos[1] + size[1]], [0, 1])
			.setScale([scaleX, 1])
		);
		
		gui.batch.add(
			gl.sprite(gui.atlas["btn" + downStr + "_m"], [pos[0] + 16, pos[1] + 16], [0, 0])
			.setScale([scaleX, scaleY])
		);
		
		var textSize = gui.font.render(gui.batch, [pos[0] + 16, pos[1] + 16], this.text);
		
		this.size = vec2.add(textSize, [32, 32 + 4]);
	},
}
