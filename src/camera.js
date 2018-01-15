function Camera()
{
	this.pos = [0, 0];
	this.zoom = 32;
}

Camera.prototype = {

	constructor: Camera,
	
	move: function(relX, relY)
	{
		this.pos[0] += relX / this.zoom;
		this.pos[1] += relY / this.zoom;
	},

};
