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
	gui = new Gui(gl);
	row = new WidgetRow([16, 16]);
	btnRaise = new Button([16, 16], "Raise");
	btnSink = new Button([16, 16], "Sink");
	row.add(btnRaise);
	row.add(btnSink);
	gui.add(row);

	gl.setClearColor(0,0,0,0);
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
	gui.draw();
}
