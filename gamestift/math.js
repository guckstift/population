Math.seedrandom(0)

acos = Math.acos;
cos = Math.cos;
floor = Math.floor;
max = Math.max;
min = Math.min;
pi = Math.PI
random = Math.random;
sin = Math.sin;
sqrt = Math.sqrt;

function radians(d)
{
	return d * pi / 180;
}

function degrees(r)
{
	return r * 180 / pi;
}

function clamp(minval, maxval, val)
{
	return max(minval, min(maxval, val));
}

function randRange(a, b)
{
	return floor(random() * (b - a + 1) + a);
}

function vec3add(a, b)
{
	return [
		a[0] + b[0],
		a[1] + b[1],
		a[2] + b[2],
	];
}

function vec3cross(a, b)
{
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0],
	];
}

function vec3length(v)
{
	return sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function vec3normalized(v)
{
	var len = vec3length(v);
	
	return [
		v[0] / len,
		v[1] / len,
		v[2] / len,
	];
}

function vec3rotateX(v, a)
{
	var sina = sin(a);
	var cosa = cos(a);
	
	return [
		v[0],
		v[1] * cosa - v[2] * sina,
		v[2] * cosa + v[1] * sina,
	];
}

function vec3rotateY(v, a)
{
	var sina = sin(a);
	var cosa = cos(a);
	
	return [
		v[0] * cosa + v[2] * sina,
		v[1],
		v[2] * cosa - v[0] * sina,
	];
}

function vec3rotateZ(v, a)
{
	var sina = sin(a);
	var cosa = cos(a);
	
	return [
		v[0] * cosa - v[1] * sina,
		v[1] * cosa + v[0] * sina,
		v[2],
	];
}

function mat4ident()
{
	return [
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1],
	]
}
