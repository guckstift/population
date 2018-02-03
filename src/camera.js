function Camera()
{
	this.defzoom = 32; // corresponds to the width of a single triangle on the screen
	this.zoom = this.defzoom;
	this.pos = [0, 0];
}

Camera.prototype = {

	constructor: Camera,
	
	move: function(relX, relY)
	{
		this.pos[0] += relX / this.zoom;
		this.pos[1] += relY / this.zoom;
	},

};
