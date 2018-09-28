import display from "./gfxlib/display.js";
import image from "./gfxlib/image.js";
import dom from "./utils/dom.js";
import Mouse from "./utils/mouse.js";
import Sprite from "./sprite.js";
import camera from "./camera.js";
import map from "./map.js";
import Animation from "./animation.js";

let ani = [];

for(let i=1; i<31; i++) {
	ani.push(image("gfx/tree2/" + String(i).padStart(4, "0000") + ".png", [0.5, 0.875]));
}

ani = new Animation(ani);

class Gui
{
	constructor()
	{
		this.tool = "tree";
		this.cursorPos = [0, 0];
		
		window.addEventListener("contextmenu", function(e) { e.preventDefault(); });
		
		this.gui = dom("div",
			{position: "fixed", left: 0, top: 0, width: "100%", height: "100%", display: "flex"},
			
			this.sidebar = dom("div",
				{flex: "none", zIndex: 100, width: "256px", backgroundColor: "#ccc",
					padding: "16px", backgroundImage: "url('gfx/panelbg.png')"},
				
				this.logo = dom("img", {src: "gfx/logo.png"}),
				this.fpsLabel = dom("div", {color: "#fff"}),
				this.cursorLabel = dom("div", {color: "#fff"}, "Cursor:"),
				this.btnRaise = dom("button", {type: "button", onclick: () => this.tool = "lift"},
					"Lift"
				),
				this.btnSink = dom("button", {type: "button", onclick: () => this.tool = "sink"},
					"Sink"
				),
				this.btnTree = dom("button", {type: "button", onclick: () => this.tool = "tree"},
					"Tree"
				),
				this.btnErase = dom("button", {type: "button", onclick: () => this.tool = "erase"},
					"Erase"
				),
				this.btnBeach = dom("button", {type: "button", onclick: () => this.tool = "beach"},
					"Beach"
				),
			),
			
			this.gamepanel = dom("div",
				{flex: "auto", position: "relative"},
				
				display.canvas,
				this.cursor = dom("img",
					{src: "gfx/cross.png", position: "absolute", top:0, left:0,
						transform: "translate(-50%,-50%)"}
				),
			),
		);
		
		this.logo.style.width = "100%";
		this.mouse = new Mouse(this.gamepanel);
		
		display.canvas.style.width = "100%";
		display.canvas.style.height = "100%";
		
		dom.ready.then(() => {
			dom(dom.body, this.gui);
			display.onResize()
		});

		this.mouse.scroll("up", e => {
			if(camera.zoom < 400) camera.zoom *= 1.25;
		});

		this.mouse.scroll("down", e => {
			if(camera.zoom > 0.0025) camera.zoom /= 1.25;
		});

		this.mouse.down("left", e => {
		
			if(this.tool === "lift") {
				map.liftOrSinkHeight(this.cursorPos, false);
			}
			else if(this.tool === "sink") {
				map.liftOrSinkHeight(this.cursorPos, true);
			}
			else if(this.tool === "tree") {
				let sprite = new Sprite(image("gfx/tree2.png", [0.5, 0.875]), this.cursorPos);
				sprite.ani = ani;
			}
			else if(this.tool === "erase") {
				map.setSprite(this.cursorPos, null);
			}
			else if(this.tool === "beach") {
				map.setTerra(this.cursorPos, 2);
			}
		
			e.preventDefault();
			e.stopPropagation();
		});

		this.mouse.down("right", e => {
			this.mouse.lock();
			e.preventDefault();
			e.stopPropagation();
		});
		
		this.mouse.up("right", e => {
			this.mouse.unlock()
		});

		this.mouse.move(e => {
			if(this.mouse.btns.right) {
				camera.pos[0] += this.mouse.rel[0] / camera.totalZoom;
				camera.pos[1] += this.mouse.rel[1] / camera.totalZoom;
			}
			let coord = map.pickMapCoord(this.mouse.pos);
			let worldPos = map.getVertex(coord);
			let screenPos = camera.worldToScreen(worldPos);
			this.cursorPos = coord;
			this.cursorLabel.innerText =
				"Cursor: [" + this.cursorPos[0] + ", " + this.cursorPos[1] + "]";
			dom(this.cursor, {left: screenPos[0] + "px", top: screenPos[1] + "px"});
		});
		
		display.frame(() => this.fpsLabel.innerText = "FPS: " + display.fps);
	}
}

export default new Gui();
