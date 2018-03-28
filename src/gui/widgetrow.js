var WidgetRow = defclass({

	constructor: function WidgetRow()
	{
		this.elm = newElm("div");
		this.elm.setAttribute("class", "WidgetRow");
	},

	add: function(widget)
	{
		this.elm.appendChild(widget.elm);
	
		return this;
	},

});
