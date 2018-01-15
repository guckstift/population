function Map()
{
	this.chunkDims = [
		[-1, 0],
		[-1, 0],
	];
	
	this.chunks = [
		[ new MapChunk(-1, -1), new MapChunk(0, -1), ],
		[ new MapChunk(-1, 0), new MapChunk(0, 0), ],
	];
}

Map.prototype = {

	constructor: Map,
	
	draw: function()
	{
		for(var y=0; y < this.chunks.length; y++) {
			var chunkRow = this.chunks[y];
			
			for(var x=0; x < chunkRow.length; x++) {
				var chunk = chunkRow[x];
				
				chunk.draw();
			}
		}
	},
	
};
