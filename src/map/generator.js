mapgen = {

	perlin: new Perlin(),
		
	height: function(p)
	{
		return this.perlin.sample(p) * 4;//25;
	},
	
	terra: function(p)
	{
		return floor(this.perlin.sample(p) * 2) + 1;
	},

};
