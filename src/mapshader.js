var mapVert = `
	attribute vec2 aMapCoord;
	attribute float aHeight;
	attribute float aCoef;
	attribute float aTerra;
	
	uniform vec2 uScreenSize;
	uniform float uStdDefZoom;
	uniform vec2 uCameraPos;
	uniform float uHeightScale;
	
	varying float vCoeff;
	varying vec2 vMapCoord;
	varying float vUseTextures[8];
	
	void main()
	{
		vec3 worldPos  = mapToWorld(aMapCoord, aHeight, uHeightScale);
		vec2 screenPos = worldToScreen(worldPos, uStdDefZoom, uCameraPos, uScreenSize);
		vec3 clipPos   = screenToClip(screenPos, uScreenSize);
	
		vCoeff      = aCoef;
		vMapCoord   = aMapCoord;
		gl_Position = vec4(clipPos, 1.0);
	
		for(int i=0; i<8; i++) {
			vUseTextures[i] = (aTerra == float(i)) ? 1.0 : 0.0;
		}
	}
`;

var mapFrag = `
	precision highp float;
	
	uniform sampler2D uTex;
	uniform vec2 uTerraSlotSize;
	uniform vec2 uTerraRelSlotSize;
	uniform float uStdDefZoom;
	
	varying float vCoeff;
	varying vec2 vMapCoord;
	varying float vUseTextures[8];
	
	void main()
	{
		vec2 texCoord = vMapCoord;
	
		if(mod(floor(vMapCoord.y), 2.0) == 0.0) {
			texCoord.x += 0.5 * fract(vMapCoord.y);
		}
		else {
			texCoord.x += 0.5 * (1.0 - fract(vMapCoord.y));
		}
	
		if(mod(floor(vMapCoord.y), 8.0) >= 4.0) {
			texCoord.x += 2.0;
		}
	
		texCoord = mod(texCoord, 4.0);
		texCoord *= uTerraRelSlotSize * uStdDefZoom / uTerraSlotSize;
		texCoord.y /= 2.0;
	
		for (int i=0; i<8; i++) {
			vec2 texSlot = vec2(
				mod(float(i), 2.0),
				floor(float(i) / 2.0)
			);
			gl_FragColor += vUseTextures[i] * texture2D(
				uTex,
				texCoord + texSlot * uTerraRelSlotSize
			);
		}
	
		gl_FragColor.rgb *= vCoeff;
	}
`;
