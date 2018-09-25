export default `
	precision highp float;

	uniform sampler2D maptex;
	uniform sampler2D maptexLeft;
	uniform sampler2D maptexDown;
	uniform sampler2D maptexLeftDown;
	uniform float heightScale;
	uniform float totalZoom;
	uniform float viewAngleSin;
	uniform vec2 chunkSize;
	uniform vec2 chunkCoord;
	uniform vec2 camPos;
	uniform vec2 screenSize;

	attribute vec2 coord;

	varying float vUseTerra[16];
	varying float vCoef;
	varying vec2 vCoord;

	void main()
	{
		vec2 texCoord = coord / chunkSize;
		vec4 vertex;
		
		if(texCoord.x >= 1.0 && texCoord.y >= 1.0) {
			vertex = texture2D(maptexLeftDown, texCoord - vec2(1.0));
		}
		else if(texCoord.x >= 1.0) {
			vertex = texture2D(maptexLeft, texCoord - vec2(1.0, 0.0));
		}
		else if(texCoord.y >= 1.0) {
			vertex = texture2D(maptexDown, texCoord - vec2(0.0, 1.0));
		}
		else {
			vertex = texture2D(maptex, texCoord);
		}
		
		float height = vertex.r * 255.0;
		float terra = vertex.g * 255.0;
		float coef = vertex.b;
		float fractY = fract(coord.y);
		vec2 globalCoord = coord + chunkCoord * chunkSize;
		vec2 flatPos = globalCoord / vec2(1, 2) - vec2(0, viewAngleSin * height * heightScale);
	
		if(mod(floor(coord.y), 2.0) == 0.0) {
			flatPos.x += 0.5 * fractY;
		}
		else {
			flatPos.x += 0.5 - 0.5 * fractY;
		}
		
		gl_Position = vec4((flatPos - camPos) * totalZoom * vec2(2, -2) / screenSize, 0.0, 1.0);
	
		for(int i = 0; i < 16; i++) {
			vUseTerra[i] = float(terra == float(i));
		}
	
		vCoef = coef * coef * 1.5;
		vCoord = coord;
	}
`;
