export default class DrawList
{
	constructor()
	{
		this._drawlist = [];
		this._drawcount = 0;
	}
	
	each(cb)
	{
		for(let i=0; i<this._drawcount; i++) {
			cb(this._drawlist[i]);
		}
	}
	
	show(drawable)
	{
		if(drawable._drawlist !== this) {
			drawable.hide();
			let index = this._drawcount;
			this._install(drawable, index);
			this._drawcount ++;
			this.reorderAt(index);
		}
	}
	
	hide(drawable)
	{
		if(drawable._drawlist === this) {
			let index = drawable._index;
			let lastId = this._drawcount - 1;
			let last = this._drawlist[last];
			this._uninstall(drawable, index);
			this._uninstall(last, lastId);
			this._install(last, index);
			this._drawcount --;
			this.reorderAt(index);
		}
	}
	
	clear()
	{
		for(let i=0; i<this._drawcount; i++) {
			this._uninstall(this._drawlist[i], i);
		}
		
		this._drawcount = 0;
	}
	
	reorderAt(index)
	{
		let drawable = this._drawlist[index];
		let lastId = this._drawcount - 1;
		
		while(index > 0) {
			let prevId = index - 1;
			let prev = this._drawlist[prevId];
			
			if(prev._zindex <= drawable._zindex) {
				break;
			}
			
			this._install(drawable, prevId);
			this._install(prev, index);
			index --;
		}
		
		while(index < lastId) {
			let nextId = index + 1;
			let next = this._drawlist[nextId];
			
			if(next._zindex >= drawable._zindex) {
				break;
			}
			
			this._install(drawable, nextId);
			this._install(next, index);
			index ++;
		}
	}
	
	_install(drawable, index)
	{
		drawable._drawlist = this;
		drawable._index = index;
		this._drawlist[index] = drawable;
	}
	
	_uninstall(drawable, index)
	{
		drawable._drawlist = null;
		drawable._index = null;
		this._drawlist[index] = null;
	}
}
