export const abs    = Math.abs;
export const acos   = Math.acos;
export const asin   = Math.asin;
export const cos    = Math.cos;
export const floor  = Math.floor;
export const max    = Math.max;
export const min    = Math.min;
export const pi     = Math.PI;
export const pow    = Math.pow;
export const random = Math.random;
export const round  = Math.round;
export const sin    = Math.sin;
export const sqrt   = Math.sqrt;

export function mod(x, y)
{
	let z = x % y;
	
	return z + (z < 0) * y;
}

export function frac(x)
{
	return x - floor(x);
}

export function radians(d)
{
	return d * pi / 180;
}

export function degrees(r)
{
	return r * 180 / pi;
}

export function clamp(minval, maxval, val)
{
	return max(minval, min(maxval, val));
}

export function noise1d(x, s)
{
	x *= 15485863; // mult with 1-millionth prime
	let h = x;
	h *= s || 1;
	h ^= h >> 2;   // r-shift with 1. prime
	h ^= h << 5;   // l-shift with 3. prime
	h ^= h >> 11;  // r-shift with 5. prime
	h ^= h << 17;  // l-shift with 7. prime
	h ^= h >> 23;  // r-shift with 9. prime
	h ^= h << 31;  // l-shift with 11. prime
	return (h + 0x80000000) / 0xFFffFFff;
}

export function noise2d(x, y, s)
{
	x *= 15485863; // mult with 1-millionth prime
	y *= 285058399; // mult with 15485863. prime
	let h = x + y;
	h *= s || 1;
	h ^= h >> 2;   // r-shift with 1. prime
	h ^= h << 5;   // l-shift with 3. prime
	h ^= h >> 11;  // r-shift with 5. prime
	h ^= h << 17;  // l-shift with 7. prime
	h ^= h >> 23;  // r-shift with 9. prime
	h ^= h << 31;  // l-shift with 11. prime
	return (h + 0x80000000) / 0xFFffFFff;
}

export function linearMix(x, y, a)
{
	return x * (1 - a) + y * a;
}

export function smoothMix(x, y, a)
{
	return x + a * a * (3 - 2 * a) * (y - x);
}

export function vec2(x = 0, y = 0)
{
	let v = new Float32Array(2);
	
	v[0] = x;
	v[1] = y;
	
	return v;
}

vec2.scale = function(v, s, o = vec2())
{
	o[0] = a[0] * s;
	o[1] = a[1] * s;
	
	return o;
};

vec2.add = function(a, b, o = vec2())
{
	o[0] = a[0] + b[0];
	o[1] = a[1] + b[1];
	
	return o;
};

vec2.sub = function(a, b, o = vec2())
{
	o[0] = a[0] - b[0];
	o[1] = a[1] - b[1];
	
	return o;
};

vec2.mul = function(a, b, o = vec2())
{
	o[0] = a[0] * b[0];
	o[1] = a[1] * b[1];
	
	return o;
};

vec2.div = function(a, b, o = vec2())
{
	o[0] = a[0] / b[0];
	o[1] = a[1] / b[1];
	
	return o;
};

vec2.dot = function(a, b)
{
	return a[0] * b[0] + a[1] * b[1];
};

vec2.sqdist = function(a, b)
{
	let x = b[0] - a[0];
	let y = b[1] - a[1];
	
	return x * x + y * y;
};

vec2.vec3 = function(xy, z, o = vec3())
{
	o[0] = xy[0];
	o[1] = xy[1];
	o[2] = z;
	
	return o;
};

vec3.linear = function(a, b, t, o = vec3())
{
	let invt = 1 - t;
	
	o[0] = b[0] * t + a[0] * invt;
	o[1] = b[1] * t + a[1] * invt;
	o[2] = b[2] * t + a[2] * invt;
	
	return o;
}

export function vec3(x = 0, y = 0, z = 0)
{
	let v = new Float32Array(3);
	
	v[0] = x;
	v[1] = y;
	v[2] = z;
	
	return v;
}

vec3.rotateX = function(v, a, o = vec3())
{
	let cosa = Math.cos(a);
	let sina = Math.sin(a);
	let v1 = v[1];
	let v2 = v[2];
	
	o[0] = v[0];
	o[1] = v1 * cosa - v2 * sina;
	o[2] = v2 * cosa + v1 * sina;
	
	return o;
};

vec3.rotateY = function(v, a, o = vec3())
{
	let cosa = Math.cos(a);
	let sina = Math.sin(a);
	let v0 = v[0];
	let v2 = v[2];
	
	o[0] = v0 * cosa + v2 * sina;
	o[1] = v[1];
	o[2] = v2 * cosa - v0 * sina;
	
	return o;
};

vec3.rotateZ = function(v, a, o = vec3())
{
	let cosa = Math.cos(a);
	let sina = Math.sin(a);
	let v0 = v[0];
	let v1 = v[1];
	
	o[0] = v0 * cosa - v1 * sina;
	o[1] = v1 * cosa + v0 * sina;
	o[2] = v[2];
	
	return o;
};
