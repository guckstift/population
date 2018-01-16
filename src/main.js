loader
	.script("src/camera.js")
	.script("src/input.js")
	.script("src/mapchunk.js")
	.script("src/map.js")
	.texture("gfx/terrain.png")
	.shader("map", ["shaders/utils.glslv", "shaders/map.vert.glslv"], "shaders/map.frag.glslf")
	.ready(onGameLoad)

function onGameLoad()
{
	display
		.attachToBody()
		.enableFullPageMode()
		.setBgColor(0, 0, 0, 1)
	
	camera = new Camera();
	input = new Input();
	map = new Map();
	map.addChunk(0, 0);
	map.addChunk(-1, 0);
	map.addChunk(0, -1);
	map.addChunk(-1, -1);
	
	label = new Label("Hello World").setColor("red").setPos(16, 16);
	
	display.onRender = onRender;
}

function onRender()
{
	map.draw();
}
