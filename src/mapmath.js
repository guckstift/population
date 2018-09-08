var triaHeight   = sqrt(3) / 2;
var viewAngle    = acos(1 / sqrt(3));
var viewAngleSin = sqrt(2 / 3);
var viewAngleCos = 1 / sqrt(3);
var heightScale  = 1/3;
var stdDefZoom   = 32;
var sqrt6        = sqrt(6);
var dsqrt3       = 2 * sqrt(3);
var sqrt2h       = sqrt(2) / 2;

var sun = vec3(0, 0, -1);
sun = vec3.rotateX(sun, radians(-45));
sun = vec3.rotateZ(sun, radians(30));

var mapSize     = 128;
var vertsPerRow = mapSize;
var vertRows    = mapSize * 2;
var verts       = vertsPerRow * vertRows;
var triasPerRow = mapSize * 2 - 2
var triaRows    = mapSize * 2 - 1;
var indices     = (triasPerRow + 2 + 2) * triaRows - 2;
var boxSize     = triaRows * stdDefZoom / 2;

var terraSlotSize    = [128, 64];
var terraTexSize     = [256, 256];
var terraRelSlotSize = vec2.div(terraSlotSize, terraTexSize);

function posInBounds(pos)
{
	return (
		pos[0] >= 0 && pos[0] < vertsPerRow &&
		pos[1] >= 0 && pos[1] < vertRows
	);
}

function posInInnerBounds(pos)
{
	return (
		pos[0] > 0 && pos[0] < vertsPerRow - 1 &&
		pos[1] > 0 && pos[1] < vertRows - 1
	);
}

function clampedPos(pos)
{
	return [
		clamp(0, vertsPerRow - 1, pos[0]),
		clamp(0, vertRows - 1, pos[1]),
	]
}

function linearCoord(p)
{
	return p[0] + p[1] * vertsPerRow;
}

function leftFrom(p)
{
	return [p[0] - 1, p[1]];
}

function rightFrom(p)
{
	return [p[0] + 1, p[1]];
}

function upFrom(p)
{
	return [p[0], p[1] - 1];
}

function downFrom(p)
{
	return [p[0], p[1] + 1];
}

function leftUpFrom(p)
{
	return [
		p[0] - 1 + mod(p[1], 2),
		p[1] - 1,
	];
}

function rightUpFrom(p)
{
	return [
		p[0] + mod(p[1], 2),
		p[1] - 1,
	];
}

function leftDownFrom(p)
{
	return [
		p[0] - 1 + mod(p[1], 2),
		p[1] + 1,
	];
}

function rightDownFrom(p)
{
	return [
		p[0] + mod(p[1], 2),
		p[1] + 1,
	];
}

function allAdjacent(p)
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

function hexRing(pivot, size)
{
	if(size === 0)  {
		return [pivot];
	}
	
	var set       = [];
	var left      = pivot;
	var leftup    = pivot;
	var rightup   = pivot;
	var right     = pivot;
	var rightdown = pivot;
	var leftdown  = pivot;

	for(var i=0; i < size; i++) {
		left      = leftFrom(left);
		leftup    = leftUpFrom(leftup);
		rightup   = rightUpFrom(rightup);
		right     = rightFrom(right);
		rightdown = rightDownFrom(rightdown);
		leftdown  = leftDownFrom(leftdown);
	}
	
	for(var i=0; i < size; i++) {
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
