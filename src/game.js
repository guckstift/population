import gui from "./gui.js";
import display from "./gfxlib/display.js";
import image from "./gfxlib/image.js";
import {imagesLoaded} from "./gfxlib/image.js";
import map from "./map.js";
import camera from "./camera.js";

window.image = image;

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
		
		this.map = map;
		this.camera = camera;
		
		imagesLoaded().then(() => console.log("all loaded"));
	}
}

export default new Game();
