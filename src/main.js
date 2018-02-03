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
	.shader(
		"sprite",
		"shaders/sprite.glslv",
		"shaders/sprite.glslf",
	)
	.atlas("gfx/test.json")
	.atlas("gfx/test2.json")
	.atlas("gfx/test3.json")
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
	
	var dim = 2;
	
	for(var x=0; x<=dim; x++) {
		for(var y=0; y<=dim; y++) {
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
	
	spritebatch = new SpriteBatch();
	//sprite0 = new Sprite(cache.frames.tree_png).setPos([0, 2]);
	sprite1 = new Sprite(cache.frames.tree_png).setPos([0, 1]);
	sprite2 = new Sprite(cache.frames.tree_png).setPos([0, 0]);
	//spritebatch.addSprite(sprite0);
	spritebatch.addSprite(sprite1);
	spritebatch.addSprite(sprite2);
	
	spritebatch2 = new SpriteBatch();
	//sprite20 = new Sprite(cache.frames.tree_shadow_png).setPos([0, 2]);
	sprite21 = new Sprite(cache.frames.tree_shadow_png).setPos([0, 1]);
	sprite22 = new Sprite(cache.frames.tree_shadow_png).setPos([0, 0]);
	//spritebatch2.addSprite(sprite20);
	spritebatch2.addSprite(sprite21);
	spritebatch2.addSprite(sprite22);
	
	display.onRender = onRender;
}

function onRender()
{
	map.draw();
	
	display.gl.clear(display.gl.DEPTH_BUFFER_BIT);
	
	spritebatch2.draw();
	
	display.gl.clearDepth(1);
	display.gl.clear(display.gl.DEPTH_BUFFER_BIT);
	spritebatch.draw();
}
