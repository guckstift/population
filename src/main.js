var gl;
var camera;
var input;
var atlas;
var map;
var cross;

addEventListener("load", main);

function main()
{
	gl = webgl(800, 600, render, "appendToBody", "fullPage", "no-antialias", "no-alpha");
	camera = gl.spritecamera([0,0], [0.5, 0.5]);
	input = Input(gl, camera);
	atlas = gl.atlas("gfx/test1.json", atlasLoad);
	map = null;
	cross = gl.spritebatch(camera, true);

	gl.setClearColor(0,0,0,0);
	
	labels = [
		new Label("A").setColor("#f00").setPos([16, 16]),
		new Label("B").setColor("#0f0").setPos([16, 16]),
		new Label("C").setColor("#00f").setPos([16, 16]),
		new Label("D").setColor("#0ff").setPos([16, 16]),
		new Label("E").setColor("#f0f").setPos([16, 16]),
		new Label("F").setColor("#ff0").setPos([16, 16]),
	];
}

function atlasLoad()
{
	map = Map(gl, camera);
	
	var dim = 0;
	
	for(var x=-dim; x<=dim; x++) {
		for(var y=-dim; y<=dim; y++) {
			map.addChunk([x, y]);
		}
	}
	
	map.addChunk([0, 1]);
	map.addChunk([1, 0]);
	map.addChunk([0, -1]);
	map.addChunk([-1, 0]);
	map.addChunk([-1, -1]);
	
	//map.addChunk([0, -2]);
	
	cross.add(gl.sprite(atlas["cross.png"], [0,0], [0.5,0.5]));
}

function render()
{
	if(map) {
		map.draw();
	}
	
	cross.draw();
}
