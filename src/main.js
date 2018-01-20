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
		.setBgColor(1,1,1, 1)
	
	camera = new Camera();
	input = new Input();
	map = new Map();
	
	var dim = 8;
	
	for(var x=0; x<=dim; x++) {
		for(var y=0; y<=dim; y++) {
			map.addChunk(x, y);
		}
	}
	
	label = new Label("Hello World").setColor("red").setPos(16, 16);
	
	display.onRender = onRender;
}

function onRender()
{
	map.draw();
}
