function Label(text, x, y, display)
{
	display = display || window.display;
	
	this.display = display;
	this.div = newElm("div");
	this.div.style.position = "absolute";
	this.display.container.appendChild(this.div);
	
	this.setPos(0, 0);
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
	
	setPos: function(x, y)
	{
		this.pos = [x, y];
		this.div.style.left = x + "px";
		this.div.style.top = y + "px";
		return this;
	},
	
};
