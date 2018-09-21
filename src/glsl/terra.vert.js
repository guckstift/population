export default `
	precision highp float;

	uniform sampler2D maptex;
	uniform sampler2D maptexLeft;
	uniform sampler2D maptexDown;
	uniform sampler2D maptexLeftDown;
	uniform float triaHeight;
	uniform float heightScale;
	uniform float coefLower;
	uniform float coefUpper;
	uniform vec2 chunkSize;
	uniform vec2 chunkCoord;
	uniform mat4 camera;

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
		float coef = vertex.b * (coefUpper - coefLower) + coefLower;
		
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
	
		vCoef = coef * coef * 1.5;
		vCoord = coord;
	}
`;
