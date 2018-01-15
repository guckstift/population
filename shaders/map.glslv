attribute vec2 aMapCoord;
attribute float aHeight;
attribute vec3 aNormal;
attribute float aTerra;

uniform vec2 uChunkCoord;
uniform vec2 uScreenSize;
uniform float uZoom;
uniform vec2 uCameraPos;
uniform vec3 uSun;

varying vec2 vTexCoord;
varying vec2 vMapCoord;
varying vec3 vWorldPos;
varying float vCoeff;
varying float vUseTextures[8];
varying vec3 vClipPos;

void main()
{
	vec3 worldPos, screenPos, clipPos;
	
	worldPos = mapToWorld(aMapCoord + uChunkCoord * vec2(32, 64), aHeight);
	screenPos = worldToScreen(worldPos, uZoom, uCameraPos);
	clipPos = screenToClip(screenPos, uScreenSize);
	//clipPos = worldToSun(worldPos, uZoom, uCameraPos, uScreenSize);
	
	vMapCoord = aMapCoord;
	vWorldPos = worldPos;
	vClipPos = clipPos;
	vCoeff = calcCoeff(uSun, aNormal);
	
	for(int i=0; i<8; i++) {
		vUseTextures[i] = (aTerra == float(i)) ? 1.0 : 0.0;
	}
	
	gl_Position = vec4(clipPos, 1.0);
}
