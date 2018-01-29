/*

	local coord - a 2d vertex coordinate local to a chunk
	linear local coord - a 1d vertex coordinate local to a chunk
	global coord - an absolute 2d vertex coordinate
	linear global coord - a absolute 1d vertex coordinate

*/

triaHeight = sqrt(3) / 2;
viewAngle = acos(1 / sqrt(3));
viewAngleSin = sqrt(2 / 3);
viewAngleCos = 1 / sqrt(3);
heightScale = 1 / 3;

sun = [0, 0, -1];
sun = vec3rotateX(sun, radians(-45));
sun = vec3rotateZ(sun, radians(30));

chunkSize = 32;
chunkWidth = chunkSize;
chunkHeight = chunkSize * 2;
numVertsPerRow = chunkWidth + 1;
numVertRows = chunkHeight + 1;
numVerts = numVertRows * numVertsPerRow;
numTriasPerRow = chunkSize * 2;
numTriaRows = chunkSize * 2;
numTrias = numTriaRows * numTriasPerRow;
numIndices = (numTriasPerRow + 2 + 2) * numTriaRows - 2;

function leftFrom(p)
{
	return [p[0] - 1, p[1]];
}

function rightFrom(p)
{
	return [p[0] + 1, p[1]];
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

function linearLocalCoord(p)
{
	return p[0] + p[1] * numVertsPerRow;
}

function chunkCoord(p)
{
	return [
		floor(p[0] / chunkWidth),
		floor(p[1] / chunkHeight),
	];
}

function localCoord(p)
{
	return [
		mod(p[0], chunkWidth),
		mod(p[1], chunkHeight),
	];
}

function globalCoord(cp, lp)
{
	return [
		cp[0] * chunkWidth + lp[0],
		cp[1] * chunkHeight + lp[1],
	];
}

function mapToWorld(p)
{
	return [
		p[0] + 0.5 * mod(p[1], 2),
		p[1] * triaHeight,
		p[2] * heightScale,
	];
}

function worldToScreen(p)
{
	return [
		display.width  / 2 +
			camera.zoom * (-camera.pos[0] + p[0]),
		display.height / 2 +
			camera.zoom * (-camera.pos[1] + p[1] * viewAngleCos - p[2] * viewAngleSin),
	];
}

function mapToScreen(p)
{
	return worldToScreen(mapToWorld(p));
}
