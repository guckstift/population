var gl = webgl(1024, 1024, render, "appendToBody", "fullPage", "no-antialias", "no-alpha");
var camera = gl.spritecamera([0,0], [0.5, 0.5]);
var input = Input(gl, camera);
var atlas = gl.atlas("gfx/test1.json", atlasLoad);
var map = null;

gl.setClearColor(0,0,0,0);
	
labels = [
	new Label("A").setColor("#f00").setPos([16, 16]),
	new Label("B").setColor("#0f0").setPos([16, 16]),
	new Label("C").setColor("#00f").setPos([16, 16]),
	new Label("D").setColor("#0ff").setPos([16, 16]),
	new Label("E").setColor("#f0f").setPos([16, 16]),
	new Label("F").setColor("#ff0").setPos([16, 16]),
];

function atlasLoad()
{
	map = Map(gl, camera);
	
	map.addChunk([0,0]);
	//map.addChunk([-1,0]);
	//map.addChunk([0,-1]);
	//map.addChunk([-1,-1]);
	
	var dim = 8;
	
	for(var x=-dim; x<=dim; x++) {
		for(var y=-dim; y<=dim; y++) {
			map.addChunk([x, y]);
		}
	}

	//map.chunks.rows[1][1].heights.set(0, [5, 5]);
	//map.chunks.rows[1][1].heights.set(33, [5, 5]);
	
	//batch.add(spritegl.sprite(atlas["bluecircle.png"], [0, 0], [0.5, 0.5]));
	
	//batch.add(spritegl.sprite(atlas["be-a-mau.png"], [0,0], [0.5,0.5]));
	//batch.add(spritegl.sprite(atlas["bluecircle.png"], [0,150], [0.5,0.5]));
	//batch.add(spritegl.sprite(atlas["rainbow-cone.png"], [50,220], [0.5,0.5]));
}

function render()
{
	//batch.draw();
	
	if(map)
		map.draw();
}

/*
var atlas = gl.atlas("gfx/test1.json", atlasLoad);
var camera = new Camera();
var map = new Map();
var input = new Input();
*/

/*
var terraTex = gl.texture("gfx/terrain.png");

var mapShader = gl.shaderFromUrl(
	["shaders/utils.glslv", "shaders/map.glslv"],
	["shaders/map.glslf"],
)

/*
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
		"obj",
		["shaders/utils.glslv", "shaders/obj.glslv"],
		"shaders/obj.glslf",
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
	
	var dim = 1;
	
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
*/
