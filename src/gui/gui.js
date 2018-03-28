var Gui = defclass({

	constructor: function Gui()
	{
		this.elm = newElm("div");
		this.elm.style.position = "absolute";
		this.elm.style.left = "0px";
		this.elm.style.top = "0px";
		this.elm.setAttribute("class", "unselectable");
	
		document.body.appendChild(this.elm);
	},

	add: function(widget)
	{
		this.elm.appendChild(widget.elm);
	
		return this;
	},

});
