import gui from "./gui.js";
import display from "./gfxlib/display.js";
import map from "./map.js";

class Game
{
	constructor()
	{
		display.bgcolor = [0.125, 0.125, 0.25];
		display.show(map);
		
		for(let y=0; y<4; y++) {
			for(let x=0; x<4; x++) {
				map.touchChunk([x, y]);
			}
		}
	}
}

export default new Game();
