/*
	A two-dimensional array that automatically expands in any of four directions on access.
	It can be accessed through get(x,y) with 2D cartesian coordinates and optionally creates new
	cells dynamically with a factory method cellFactory(x,y).
*/

export default class Dyn2dArray
{
	constructor()
	{
		this.left = 0;
		this.top = 0;
		this.right = 0;
		this.bottom = 0;
		this.width = 0;
		this.height = 0;
		this.rows = [];
		this.cellFactory = () => {};
	}
	
	get(p)
	{
		let x = p[0];
		let y = p[1];
		
		this.expandTo(p);
		
		return (
			this.rows[y - this.top][x - this.left] ||
			(this.rows[y - this.top][x - this.left] = this.cellFactory(p))
		);
	}
	
	set(p, value)
	{
		let x = p[0];
		let y = p[1];
		
		this.expandTo(p);
		this.rows[y - this.top][x - this.left] = value;
	}
	
	each(callback)
	{
		for(let y=0; y < this.rows.length; y++) {
			let rows = this.rows[y];
			
			for(let x=0; x < rows.length; x++) {
				let cell = rows[x];
				
				if(cell) {
					callback(cell, x, y);
				}
			}
		}
	}
	
	expandTo(p)
	{
		let x = p[0];
		let y = p[1];
		
		if(x < this.left) {
			this.expandLeft(x);
		}
		else if(x >= this.right) {
			this.expandRight(x + 1);
		}
		
		if(y < this.top) {
			this.expandTop(y);
		}
		else if(y >= this.bottom) {
			this.expandBottom(y + 1);
		}
	}

	expandLeft(left)
	{
		let add = this.left - left;
		
		if(add <= 0) return;
		
		for(let i=0; i < this.rows.length; i++) {
			this.rows[i] = Array(add).concat(this.rows[i]);
		}
		
		this.left = left;
		this.width += add;
	}
	
	expandRight(right)
	{
		let add = right - this.right;
		
		if(add <= 0) return;
		
		for(let i=0; i < this.rows.length; i++) {
			this.rows[i] = this.rows[i].concat(Array(add));
		}
		
		this.right = right;
		this.width += add;
	}
	
	expandTop(top)
	{
		let add = this.top - top;
		
		if(add <= 0) return;
		
		this.rows = Array(add).concat(this.rows);
		
		for(let i=0; i < add; i++) {
			this.rows[i] = Array(this.width);
		}
		
		this.top = top;
		this.height += add;
	}
	
	expandBottom(bottom)
	{
		let add = bottom - this.bottom;
		
		if(add <= 0) return;
		
		this.rows = this.rows.concat(Array(add));
		
		for(let i=0; i < add; i++) {
			this.rows[this.height + i] = Array(this.width);
		}
		
		this.bottom = bottom;
		this.height += add;
	}
}
