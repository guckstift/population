loader
	.texture("gfx/terrain.png")
	.shader(
		"map",
		["shaders/utils.glslv", "shaders/map.vert.glslv"],
		["shaders/map.frag.glslf"],
	)
	.shader(
		"mapcoord",
		["shaders/utils.glslv", "shaders/mapcoord.vert.glslv"],
		["shaders/utils.glslv", "shaders/mapcoord.frag.glslf"],
	)
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
	
	camera.zoom = 128;
	//camera.zoom = 2.546;
	//camera.pos = [150, 120];
	
	var dim = 8;
	
	for(var x=0; x<=dim; x++) {
		for(var y=0; y<=dim; y++) {
			map.addChunk(x, y);
		}
	}
	
	window.label = new Label("Hello World").setColor("red").setPos(16, 16);
	
	display.onRender = onRender;
}

function onRender()
{
	map.draw();
}
