export default `
	#extension GL_EXT_frag_depth : enable
	
	precision highp float;
	
	uniform sampler2D textures[8];
	
	varying vec2 texCoord;
	varying float vTexId;
	
	void main()
	{
		for(int i=0; i<8; i++) {
			if(float(i) == vTexId) {
				gl_FragColor = texture2D(textures[i], texCoord);
				break;
			}
		}
		
		if(gl_FragColor.a == 0.0) {
			discard;
		}
		
		if(gl_FragColor.a < 0.75) {
			gl_FragDepthEXT = 0.0625;//-0.9;
		}
		else {
			gl_FragDepthEXT = gl_FragCoord.z * gl_FragColor.a;
		}
	}
`;
