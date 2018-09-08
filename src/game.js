class Game
{
	constructor()
	{
		this.display = new Display();
		this.display.setOnRender(this.onRender.bind(this));
		this.display.setClearColor(0.125, 0.125, 0.25, 1);
		
		initFrameset(this.display, framesets);
		
		this.camera = new Camera();
		this.input  = new Input(this.display.canvas);
		this.map    = new Map(this.display, this.camera);
		
		this.panning = false;
		
		this.input.setOnMouseMove(this.onMouseMove.bind(this));
		this.input.setOnMouseDown(this.onMouseDown.bind(this));
		this.input.setOnMouseUp(this.onMouseUp.bind(this));
		
		// generate map
		for(var y=0; y < vertRows; y++) {
			for(var x=0; x < vertsPerRow; x++) {
				if(noise2d(x, y, 42) > 0.275) {
					var frame = framesets.tree.frames.tree;
					//this.objs[linearCoord([x,y])] = new Obj(this, [x, y], frame);
				}
			}
		}
		
		var frame = framesets.tree.frames.tree;
		new Obj(this.map, [0, 1], frame);
		new Obj(this.map, [0, 0], frame);
	}
	
	onRender()
	{
		this.map.draw();
	}
	
	onMouseMove(input)
	{
		if(this.panning) {
			this.camera.move(input.mouseRel);
		}
	}
	
	onMouseDown(input)
	{
		if(input.rmb) {
			this.panning = true;
			input.lockPointer();
		}
	}
	
	onMouseUp(input)
	{
		if(this.panning) {
			this.panning = false;
			input.unlockPointer();
		}
	}
}
