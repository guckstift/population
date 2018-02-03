mapgen = {

	perlin: new Perlin(),
		
	height: function(x, y)
	{
		return 0;//this.perlin.sample(x, y) * 3;//25;
	},
	
	terra: function(x, y)
	{
		return floor(this.perlin.sample(x, y) * 2) + 1;
	},

};
