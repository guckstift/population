function Label(text, p)
{
	this.div = newElm("div");
	this.div.style.position = "absolute";
	document.body.appendChild(this.div);
	
	this.setPos(p || [0, 0]);
	this.setText(text || "New Label");
}

Label.prototype = {

	constructor: Label,
	
	setText: function(text)
	{
		this.text = text;
		this.div.innerHTML = text;
		return this;
	},
	
	setFont: function(font)
	{
		this.div.style.fontFamily = font;
		return this;
	},
	
	setColor: function(color)
	{
		this.div.style.color = color;
		return this;
	},
	
	setPos: function(p)
	{
		this.pos = p;
		this.div.style.left = p[0] + "px";
		this.div.style.top = p[1] + "px";
		return this;
	},
	
};
