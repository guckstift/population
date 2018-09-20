export default class Drawable
{
	constructor()
	{
		this._zindex = 0;
		this._drawlist = null;
		this._index = null;
	}
	
	get zindex()
	{
		return this._zindex;
	}
	
	set zindex(i)
	{
		this._zindex = i;
		
		if(this._drawlist) {
			this._drawlist.reorderAt(this._index);
		}
	}
	
	show(drawlist)
	{
		drawlist.show(this);
	}
	
	hide()
	{
		if(this._drawlist) {
			this._drawlist.hide(this);
		}
	}
}
