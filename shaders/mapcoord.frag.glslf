uniform float uChunkSize;

varying vec2 vMapCoord;
varying vec3 vWorldPos;
varying vec3 vClipPos;

void main()
{
	gl_FragColor = vec4(
		(round(vMapCoord.x - 0.5 * mod(round(vMapCoord.y), 2.0))) / uChunkSize,
		round(vMapCoord.y) * 1.0 / (uChunkSize * 2.0),
		0,1);
}

