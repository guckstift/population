uniform sampler2D uTextures[8];

varying vec2 vTexCoord;
varying float vTexId;
varying float vDepth;

void main()
{
	if(vTexId == 0.0) {
		gl_FragColor = texture2D(uTextures[0], vTexCoord);
	}
	else if(vTexId == 1.0) {
		gl_FragColor = texture2D(uTextures[1], vTexCoord);
	}
	else if(vTexId == 2.0) {
		gl_FragColor = texture2D(uTextures[2], vTexCoord);
	}
	else if(vTexId == 3.0) {
		gl_FragColor = texture2D(uTextures[3], vTexCoord);
	}
	else if(vTexId == 4.0) {
		gl_FragColor = texture2D(uTextures[4], vTexCoord);
	}
	else if(vTexId == 5.0) {
		gl_FragColor = texture2D(uTextures[5], vTexCoord);
	}
	else if(vTexId == 6.0) {
		gl_FragColor = texture2D(uTextures[6], vTexCoord);
	}
	else if(vTexId == 7.0) {
		gl_FragColor = texture2D(uTextures[7], vTexCoord);
	}
	
	if(gl_FragColor.a == 0.0) {
		discard;
	}
	
	if(gl_FragColor.a == 1.0) {
		gl_FragDepthEXT = vDepth;
	}
}
