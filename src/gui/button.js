var Button = defclass({

	constructor: function Button(text, onClick)
	{
		this.elm = newElm("button");
		this.elm.addEventListener("click", onClick);
		this.setText(text);
	},
	
	setText: function(text)
	{
		this.elm.innerHTML = text;
	
		return this;
	},

});
