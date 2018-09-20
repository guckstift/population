import Perlin from "./utils/perlin.js";
import * as ma from "./utils/math.js";

export default {

	perlin: new Perlin(),
		
	height(p)
	{
		return this.perlin.sample(p) * 8;//25;
	},
	
	terra(p)
	{
		return ma.floor(this.perlin.sample(p) * 3);
	},

};
