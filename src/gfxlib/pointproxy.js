export default class PointProxy
{
	constructor(array = new Float32Array(2), cb = () => {})
	{
		this.array = array;
		this.cb = cb;
	}
	
	get [0]() { return this.array[0]; }
	get [1]() { return this.array[1]; }
	get [2]() { return this.array[2]; }
	get [3]() { return this.array[3]; }
	get x() { return this.array[0]; }
	get y() { return this.array[1]; }
	get r() { return this.array[0]; }
	get g() { return this.array[1]; }
	get b() { return this.array[2]; }
	get a() { return this.array[3]; }
	
	set [0](x)
	{
		this.array[0] = x;
		this.cb();
	}
	
	set [1](y)
	{
		this.array[1] = y;
		this.cb();
	}
	
	set [2](x)
	{
		this.array[2] = x;
		this.cb();
	}
	
	set [3](y)
	{
		this.array[3] = y;
		this.cb();
	}
	
	set x(x)
	{
		this.array[0] = x;
		this.cb();
	}
	
	set y(y)
	{
		this.array[1] = y;
		this.cb();
	}
	
	set r(x)
	{
		this.array[0] = x;
		this.cb();
	}
	
	set g(y)
	{
		this.array[1] = y;
		this.cb();
	}
	
	set b(x)
	{
		this.array[2] = x;
		this.cb();
	}
	
	set a(y)
	{
		this.array[3] = y;
		this.cb();
	}
	
	set(a)
	{
		this.array.set(a);
		this.cb();
	}
}
