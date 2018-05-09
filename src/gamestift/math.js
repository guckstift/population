var math = {
	abs    : Math.abs,
	acos   : Math.acos,
	asin   : Math.asin,
	cos    : Math.cos,
	floor  : Math.floor,
	max    : Math.max,
	min    : Math.min,
	pi     : Math.PI,
	pow    : Math.pow,
	random : Math.random,
	round  : Math.round,
	sin    : Math.sin,
	sqrt   : Math.sqrt,
	
	mod(x, y)
	{
		var z = x % y;
		return z + (z < 0) * y;
	},

	frac: x => x - floor(x),

	radians: d => d * pi / 180,

	degrees: r => r * 180 / pi,

	clamp: (minval, maxval, val) => math.max(minval, math.min(maxval, val)),
	
	noise1d(x, s)
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
	},

	noise2d(x, y, s)
	{
		x *= 15485863;  // mult with 1-millionth prime
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
	},

	linearMix(x, y, a)
	{
		return x * (1 - a) + y * a;
	},

	smoothMix(x, y, a)
	{
		return x + a * a * (3 - 2 * a) * (y - x);
	},
};

export default math;
