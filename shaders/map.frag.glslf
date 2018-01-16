
const vec2 terraBounds = vec2(0.125, 0.0625);

uniform sampler2D uTex;

varying vec2 vTexCoord;
varying vec2 vMapCoord;
varying vec3 vWorldPos;
varying float vCoeff;
varying float vUseTextures[8];
varying vec3 vClipPos;

void main()
{
	vec2 texCoord;
	
	texCoord = vMapCoord;
	texCoord.x += 0.5 * (
		mod(floor(vMapCoord.y), 2.0) == 0.0 ? fract(vMapCoord.y) : 1.0 - fract(vMapCoord.y)
	);
	texCoord.x += mod(floor(vMapCoord.y), 4.0) >= 2.0 ? 1.0 : 0.0;
	texCoord = mod(texCoord, 2.0);
	texCoord *= terraBounds;
	texCoord /= 2.0;
	
	for (int i=0; i<8; i++) {
		gl_FragColor += vUseTextures[i] * texture2D(
			uTex,
			texCoord + vec2(float(i) * terraBounds[0], 0.0)
		);
	}
	
	gl_FragColor.rgb *= vCoeff;
}

