class Obj extends Sprite
{
	constructor(map, mapcoord, frame)
	{
		super(frame);
		
		this.map = map;
		this.map.objbatch.add(this);
		this.setMapCoord(mapcoord);
	}
	
	setMapCoord(mapcoord)
	{
		if(this.mapcoord !== undefined) {
			this.map.objs[linearCoord(this.mapcoord)] = undefined;
		}
		
		this.mapcoord = mapcoord;
		this.map.objs[linearCoord(this.mapcoord)] = this;
		
		var worldPos = this.map.getVertex(this.mapcoord)
		
		this.setPos(worldPos);
	}
}
