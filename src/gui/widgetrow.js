function WidgetRow(pos)
{
	this.pos = pos;
	this.widgets = [];
}

WidgetRow.prototype = {

	constructor: WidgetRow,
	
	add: function(widget)
	{
		this.widgets.push(widget);
	},
	
	render: function(gui)
	{
		var offset = 0;
		
		for(var i=0; i<this.widgets.length; i++) {
			var widget = this.widgets[i];
			
			widget.pos[0] = this.pos[0] + offset;
			widget.pos[1] = this.pos[1];
			widget.render(gui);
			offset += widget.size[0];
		}
	},
}
