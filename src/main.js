loader
	.script("src/camera.js")
	.script("src/input.js")
	.script("src/mapchunk.js")
	.script("src/map.js")
	.texture("gfx/terrain.png")
	.shader("map", ["shaders/utils.glslv", "shaders/map.glslv"], "shaders/map.glslf")
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
	
	display.onRender = onRender;
}

function onRender()
{
	map.draw();
}
