attribute vec2 aMapCoord;
attribute float aHeight;
attribute vec3 aNormal;
attribute float aTerra;

uniform float uChunkSize;
uniform vec2 uChunkCoord;
uniform vec2 uScreenSize;
uniform float uStdDefZoom;
uniform float uZoom;
uniform vec2 uCameraPos;
uniform vec3 uSun;

varying vec2 vMapCoord;
varying float vCoeff;
varying float vUseTextures[8];

void main()
{
	vec2 mapGlobal;
	vec3 worldPos;
	vec2 screenPos;
	vec3 clipPos;
	
	mapGlobal = mapLocalToGlobal(aMapCoord, uChunkCoord, uChunkSize);
	worldPos = mapToWorld(mapGlobal, aHeight);
	screenPos = worldToScreen(worldPos, uZoom, uStdDefZoom, uCameraPos, uScreenSize);
	clipPos = screenToClip(screenPos, uScreenSize);
	
	vMapCoord = aMapCoord;
	vCoeff = calcCoeff(uSun, aNormal);
	
	for(int i=0; i<8; i++) {
		vUseTextures[i] = (aTerra == float(i)) ? 1.0 : 0.0;
	}
	
	gl_Position = vec4(clipPos, 1.0);
}
