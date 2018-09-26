export default `
	precision highp float;

	uniform sampler2D tex;
	uniform vec2 texDivision;

	varying float vUseTerra[16];
	varying float vCoef;
	varying vec2 vCoord;
	varying float alpha;

	void main()
	{
		float fractY = fract(vCoord.y);
		vec2 texCoord = vCoord;
	
		if(mod(floor(texCoord.y), 2.0) == 0.0) {
			texCoord.x += 0.5 * fractY;
		}
		else {
			texCoord.x += 0.5 - 0.5 * fractY;
		}
	
		if(mod(floor(texCoord.y), 8.0) >= 4.0) {
			texCoord.x += 2.0;
		}
	
		texCoord = mod(texCoord, texDivision) * 2.0 / 32.00;
	
		for(int i = 0; i < 16; i++) {
			vec2 tileCoord = vec2(mod(float(i), texDivision.x), floor(float(i) / texDivision.x));
			gl_FragColor += vUseTerra[i] * texture2D(tex, texCoord + tileCoord / texDivision);
		}
	
		gl_FragColor.rgb *= vCoef;
		gl_FragColor.a *= alpha;
	}
`;
