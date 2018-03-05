function Obj(map, pos)
{
	this.map = map;
	this.direction = ""; // "", "r", "l", "ru", "rd", "lu", "ld"
	this.offset = 0; // between 0 and 1 of this.pos and the adjacent vertex of this.direction
	this.sprite = gl.sprite(atlas["tree.png"], [0, 0], [0.5, 0.875]);
	
	this.setPos(pos || [0, 0]);
}

Obj.prototype = {

	constructor: Obj,
	
	setPos: function(pos)
	{
		if(this.pos) {
			var cp = chunkCoord(this.pos);
			var lp = localCoord(this.pos);
			var chunk = this.map.chunks.get(cp);
			var i = linearLocalCoord(lp);
			
			chunk.objs[i] = undefined;
		}
		
		var cp = chunkCoord(pos);
		var lp = localCoord(pos);
		var chunk = this.map.chunks.get(cp);
		var i = linearLocalCoord(lp);
			
		chunk.objs[i] = this;
		
		this.pos = pos;
		this.updateSpritePos();
		
		return this;
	},
	
	updateSpritePos: function()
	{
		this.sprite.setPos(this.map.getObjSpritePos(this.pos));
	},
};
