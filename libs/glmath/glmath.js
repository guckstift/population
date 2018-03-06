var abs = Math.abs;
var acos = Math.acos;
var cos = Math.cos;
var floor = Math.floor;
var max = Math.max;
var min = Math.min;
var pi = Math.PI;
var pow = Math.pow;
var random = Math.random;
var round = Math.round;
var sin = Math.sin;
var sqrt = Math.sqrt;

function mod(x, y)
{
	var z = x % y;
	
	return z + (z < 0) * y;
}

function frac(x)
{
	return x - floor(x);
}

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

function noise1d(x, s)
{
	x *= 15485863; // mult with 1-millionth prime
	var h = x;
	h *= s || 1;
	h ^= h >> 2;   // r-shift with 1. prime
	h ^= h << 5;   // l-shift with 3. prime
	h ^= h >> 11;  // r-shift with 5. prime
	h ^= h << 17;  // l-shift with 7. prime
	h ^= h >> 23;  // r-shift with 9. prime
	h ^= h << 31;  // l-shift with 11. prime
	return (h + 0x80000000) / 0xFFffFFff;
}

function noise2d(x, y, s)
{
	x *= 15485863; // mult with 1-millionth prime
	y *= 285058399; // mult with 15485863. prime
	var h = x + y;
	h *= s || 1;
	h ^= h >> 2;   // r-shift with 1. prime
	h ^= h << 5;   // l-shift with 3. prime
	h ^= h >> 11;  // r-shift with 5. prime
	h ^= h << 17;  // l-shift with 7. prime
	h ^= h >> 23;  // r-shift with 9. prime
	h ^= h << 31;  // l-shift with 11. prime
	return (h + 0x80000000) / 0xFFffFFff;
}

function linearMix(x, y, a)
{
	return x * (1 - a) + y * a;
}

function smoothMix(x, y, a)
{
	return x + a * a * (3 - 2 * a) * (y - x);
}

function vec2(x, y)
{
	return new Float32Array([x, y]);
}

vec2.sqdist = function(a, b)
{
	var x = b[0] - a[0];
	var y = b[1] - a[1];
	
	return x * x + y * y;
};

vec2.vec3 = function(v, f)
{
	return vec3(v[0], v[1], f);
}

function vec3(x, y, z)
{
	return new Float32Array([x, y, z]);
}

vec3.rotateX = function(v, a)
{
	var cosa = Math.cos(a);
	var sina = Math.sin(a);
	
	return vec3(
		v[0],
		v[1] * cosa - v[2] * sina,
		v[2] * cosa + v[1] * sina,
	);
};

vec3.rotateY = function(v, a)
{
	var cosa = Math.cos(a);
	var sina = Math.sin(a);
	
	return vec3(
		v[0] * cosa + v[2] * sina,
		v[1],
		v[2] * cosa - v[0] * sina,
	);
};

vec3.rotateZ = function(v, a)
{
	var cosa = Math.cos(a);
	var sina = Math.sin(a);
	
	return vec3(
		v[0] * cosa - v[1] * sina,
		v[1] * cosa + v[0] * sina,
		v[2],
	);
};
