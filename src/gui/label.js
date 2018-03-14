function Label(pos, text)
{
	this.pos = pos;
	this.text = text;
}

Label.prototype = {

	constructor: Label,
	
	render: function(gui)
	{
		gui.font.render(gui.batch, this.pos, this.text);
	},
}
