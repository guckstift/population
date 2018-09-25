import * as ma from "./utils/math.js";

export const triaHeight   = ma.sqrt(3) / 2;
export const viewAngle    = ma.acos(1 / ma.sqrt(3));
export const viewAngleSin = ma.sqrt(2 / 3);
export const viewAngleCos = 1 / ma.sqrt(3);
export const heightScale  = 1 / 3;
export const stdDefZoom   = 32;
export const sqrt6        = ma.sqrt(6);
export const dsqrt3       = 2 * ma.sqrt(3);
export const sqrt2h       = ma.sqrt(2) / 2;

export const sun = ma.vec3(0, 0, -1);
ma.vec3.rotateX(sun, ma.radians(-45), sun);
ma.vec3.rotateZ(sun, ma.radians(30), sun);

export const chunkSize   = 32;
export const chunkWidth  = chunkSize;
export const chunkHeight = chunkSize * 2;
export const chunkDims   = [chunkWidth, chunkHeight];
export const chunkVerts  = chunkWidth * chunkHeight;
export const vertsPerRow = chunkWidth + 1;
export const vertRows    = chunkHeight + 1;
export const verts       = vertRows * vertsPerRow;
export const triasPerRow = chunkSize * 2;
export const triaRows    = chunkSize * 2;
export const indices     = (triasPerRow + 2 + 2) * triaRows - 2;

export const texDivision = [4, 4];
export const blockSize   = 4;
export const blockStride = blockSize * 4;

//export const coefLower = 0.4399413466453552;
//export const coefUpper = 0.8944271802902222;
//export const coefLower = 0.4375; //  7/16
//export const coefUpper = 0.9375; // 15/16
//export const coefLower = 0;
//export const coefUpper = 1;

export function posInBounds(pos)
{
	return (
		pos[0] >= 0 && pos[0] < vertsPerRow &&
		pos[1] >= 0 && pos[1] < vertRows
	);
}

export function posInInnerBounds(pos)
{
	return (
		pos[0] > 0 && pos[0] < vertsPerRow - 1 &&
		pos[1] > 0 && pos[1] < vertRows - 1
	);
}

export function clampedPos(pos)
{
	return [
		ma.clamp(0, vertsPerRow - 1, pos[0]),
		ma.clamp(0, vertRows - 1, pos[1]),
	]
}

export function linearLocalCoord(p)
{
	return p[0] + p[1] * vertsPerRow;
}

export function linearLocalChunkCoord(p)
{
	return p[0] + p[1] * chunkWidth;
}

export function chunkCoord(p)
{
	return [
		ma.floor(p[0] / chunkWidth),
		ma.floor(p[1] / chunkHeight),
	];
}

export function localCoord(p)
{
	return [
		ma.mod(p[0], chunkWidth),
		ma.mod(p[1], chunkHeight),
	];
}

export function globalCoord(cp, lp)
{
	return [
		cp[0] * chunkWidth + lp[0],
		cp[1] * chunkHeight + lp[1],
	];
}

export function mapToWorld(x, y, h, o = new Float32Array(3))
{
	if(ma.mod(ma.floor(y), 2) === 0) {
		o[0] = x + ma.frac(y) * 0.5;
	}
	else {
		o[0] = x + 0.5 - ma.frac(y) * 0.5;
	}
	
	o[1] = y * triaHeight;
	o[2] = h * heightScale;
	
	return o;
}

export function leftFrom(p)
{
	return [p[0] - 1, p[1]];
}

export function rightFrom(p)
{
	return [p[0] + 1, p[1]];
}

export function upFrom(p)
{
	return [p[0], p[1] - 1];
}

export function downFrom(p)
{
	return [p[0], p[1] + 1];
}

export function leftUpFromCartes(p)
{
	return [
		p[0] - 1,
		p[1] - 1,
	];
}

export function leftUpFrom(p)
{
	return [
		p[0] - 1 + ma.mod(p[1], 2),
		p[1] - 1,
	];
}

export function rightUpFrom(p)
{
	return [
		p[0] + ma.mod(p[1], 2),
		p[1] - 1,
	];
}

export function leftDownFrom(p)
{
	return [
		p[0] - 1 + ma.mod(p[1], 2),
		p[1] + 1,
	];
}

export function rightDownFrom(p)
{
	return [
		p[0] + ma.mod(p[1], 2),
		p[1] + 1,
	];
}

export function allAdjacent(p)
{
	return [
		leftFrom(p),
		rightFrom(p),
		leftUpFrom(p),
		rightUpFrom(p),
		leftDownFrom(p),
		rightDownFrom(p),
	];
}

export function hexRing(pivot, size)
{
	if(size === 0)  {
		return [pivot];
	}
	
	let set       = [];
	let left      = pivot;
	let leftup    = pivot;
	let rightup   = pivot;
	let right     = pivot;
	let rightdown = pivot;
	let leftdown  = pivot;

	for(let i=0; i < size; i++) {
		left      = leftFrom(left);
		leftup    = leftUpFrom(leftup);
		rightup   = rightUpFrom(rightup);
		right     = rightFrom(right);
		rightdown = rightDownFrom(rightdown);
		leftdown  = leftDownFrom(leftdown);
	}
	
	for(let i=0; i < size; i++) {
		set.push(left);
		set.push(leftup);
		set.push(rightup);
		set.push(right);
		set.push(rightdown);
		set.push(leftdown);
		left      = rightUpFrom(left);
		leftup    = rightFrom(leftup);
		rightup   = rightDownFrom(rightup);
		right     = leftDownFrom(right);
		rightdown = leftFrom(rightdown);
		leftdown  = leftUpFrom(leftdown);
	}
	
	return set;
}
