var RadioGroup = defclass({

	constructor: function RadioGroup(name)
	{
		this.elm = newElm("div");
		this.elm.setAttribute("class", "WidgetRow");
		this.name = name;
	},
	
	add: function(value, text)
	{
		var radio = newElm("input");
		var label = newElm("label");
		var id = this.name + "-" + value;
		
		radio.setAttribute("type", "radio");
		radio.setAttribute("name", this.name);
		radio.setAttribute("value", value);
		radio.setAttribute("id", id);
		
		label.setAttribute("for", id);
		label.innerHTML = text;
		label.onselectstart = function() { return false; };
		
		this.elm.appendChild(radio);
		this.elm.appendChild(label);
		
		return this;
	},
	
	getValue: function()
	{
		var radios = elmsByName(this.name);
		
		for(var i=0; i<radios.length; i++) {
			if(radios[i].checked) {
				return radios[i].value;
			}
		}
	},

});
