function Label(text, x, y, display)
{
	display = display || window.display;
	
	this.display = display;
	this.pos = [0, 0];
	this.div = newElm("div");
	this.div.style.position = "absolute";
	this.div.style.top = x + "px";
	this.div.style.left = y + "px";
	this.display.container.appendChild(this.div);
	
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
		this.div.style.top = x + "px";
		this.div.style.left = y + "px";
	},
	
};
