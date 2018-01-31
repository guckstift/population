var onGameLoad;
var onRender;

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
	.ready(onGameLoad);

function onGameLoad()
{
	display
		.attachToBody()
		.enableFullPageMode()
		.setBgColor(1,1,1, 1);
	
	camera = new Camera();
	map = new Map();
	input = new Input();
	
	//camera.zoom = 128;
	//camera.zoom = 2.546;
	//camera.pos = [150, 120];
	
	var dim = 2;
	
	for(var x=-dim; x<=dim; x++) {
		for(var y=-dim; y<=dim; y++) {
			map.addChunk([x, y]);
		}
	}
	
	labels = [
		new Label("A").setColor("#f00").setPos(16, 16),
		new Label("B").setColor("#0f0").setPos(16, 16),
		new Label("C").setColor("#00f").setPos(16, 16),
		new Label("D").setColor("#0ff").setPos(16, 16),
		new Label("E").setColor("#f0f").setPos(16, 16),
		new Label("F").setColor("#ff0").setPos(16, 16),
	];
	
	display.onRender = onRender;
}

function onRender()
{
	map.draw();
}
