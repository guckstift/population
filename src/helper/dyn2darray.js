/*
	A two-dimensional array that automatically expands in any of four directions on access.
	It can be accessed through get(x,y) with 2D cartesian coordinates and optionally creates new
	cells dynamically with a factory method cellFactory(x,y).
*/
function Dyn2dArray()
{
	if(!(this instanceof Dyn2dArray)) {
		return new Dyn2dArray();
	}
	
	this.left = 0;
	this.top = 0;
	this.right = 0;
	this.bottom = 0;
	this.width = 0;
	this.height = 0;
	this.rows = [];
	this.cellFactory = function() { return undefined; };
}

Dyn2dArray.prototype = {

	constructor: Dyn2dArray,
	
	get: function(p)
	{
		var x = p[0];
		var y = p[1];
		
		this.expandTo(p);
		
		return (
			this.rows[y - this.top][x - this.left] ||
			(this.rows[y - this.top][x - this.left] = this.cellFactory(p))
		);
	},
	
	set: function(p, value)
	{
		var x = p[0];
		var y = p[1];
		
		this.expandTo(p);
		this.rows[y - this.top][x - this.left] = value;
	},
	
	each: function(callback)
	{
		for(var y=0; y < this.rows.length; y++) {
			var rows = this.rows[y];
			
			for(var x=0; x < rows.length; x++) {
				var cell = rows[x];
				
				if(cell !== undefined) {
					callback(cell, x, y);
				}
			}
		}
	},
	
	expandTo: function(p) //x, y)
	{
		var x = p[0];
		var y = p[1];
		
		if(x < this.left) {
			this.expandLeft(x);
		}
		else if(x >= this.right) {
			this.expandRight(x + 1);
		}
		
		if(y < this.top) {
			this.expandTop(y);
		}
		else if(y >= this.bottom) {
			this.expandBottom(y + 1);
		}
	},

	expandLeft: function(left)
	{
		var add = this.left - left;
		
		if(add <= 0) return;
		
		for(var i=0; i < this.rows.length; i++) {
			this.rows[i] = Array(add).concat(this.rows[i]);
		}
		
		this.left = left;
		this.width += add;
	},
	
	expandRight: function(right)
	{
		var add = right - this.right;
		
		if(add <= 0) return;
		
		for(var i=0; i < this.rows.length; i++) {
			this.rows[i] = this.rows[i].concat(Array(add));
		}
		
		this.right = right;
		this.width += add;
	},
	
	expandTop: function(top)
	{
		var add = this.top - top;
		
		if(add <= 0) return;
		
		this.rows = Array(add).concat(this.rows);
		
		for(var i=0; i < add; i++) {
			this.rows[i] = Array(this.width);
		}
		
		this.top = top;
		this.height += add;
	},
	
	expandBottom: function(bottom)
	{
		var add = bottom - this.bottom;
		
		if(add <= 0) return;
		
		this.rows = this.rows.concat(Array(add));
		
		for(var i=0; i < add; i++) {
			this.rows[this.height + i] = Array(this.width);
		}
		
		this.bottom = bottom;
		this.height += add;
	},

};
