export default `
	precision highp float;

	uniform float triaHeight;
	uniform float heightScale;
	uniform vec2 chunkSize;
	uniform vec2 chunkCoord;
	uniform mat4 camera;

	attribute vec2 coord;
	attribute float height;
	attribute float terra;
	attribute float coef;

	varying float vUseTerra[16];
	varying float vCoef;
	varying vec2 vCoord;

	void main()
	{
		float fractY = fract(coord.y);
		vec2 globalCoord = coord + chunkCoord * chunkSize;
		vec4 worldPos = vec4(globalCoord.x, globalCoord.y * triaHeight, height * heightScale, 1.0);
	
		if(mod(floor(coord.y), 2.0) == 0.0) {
			worldPos.x += 0.5 * fractY;
		}
		else {
			worldPos.x += 0.5 - 0.5 * fractY;
		}
	
		gl_Position = worldPos * camera;
	
		for(int i = 0; i < 16; i++) {
			vUseTerra[i] = float(terra == float(i));
		}
	
		vCoef = coef;
		vCoord = coord;
	}
`;
