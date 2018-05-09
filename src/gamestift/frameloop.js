export default class FrameLoop
{
	constructor()
	{
		this.frameFunc = () => {};
		this.running   = false;
	}
	
	start()
	{
		if(!this.running) {
			this.running = true;
			requestAnimationFrame(() => this.onFrame());
		}

		return this;
	}
	
	stop()
	{
		this.running = false;

		return this;
	}
	
	onFrame()
	{
		this.frameFunc();
		
		if(this.running) {
			requestAnimationFrame(() => this.onFrame());
		}
	}
	
	frame(frameFunc)
	{
		this.frameFunc = frameFunc;
	}
}
