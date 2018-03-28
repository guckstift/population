var Label = defclass({

	constructor: function Label(text)
	{
		this.elm = newElm("div");
		this.setText(text);
	},

	setText: function(text)
	{
		this.elm.innerHTML = text;
	
		return this;
	},

});
