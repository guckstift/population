mapgen = {

	perlin: new Perlin(),
		
	height: function(x, y)
	{
		return this.perlin.sample(x, y) * 25;
	},
	
	terra: function(x, y)
	{
		return floor(this.perlin.sample(x, y) * 2) + 1
	},

};
