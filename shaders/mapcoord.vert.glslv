attribute vec2 aMapCoord;
attribute float aHeight;

uniform float uChunkSize;
uniform vec2 uChunkCoord;
uniform vec2 uScreenSize;
uniform float uZoom;
uniform vec2 uCameraPos;

varying vec2 vGlobalMapCoord;
varying vec2 vMapCoord;
varying vec3 vWorldPos;
varying vec3 vClipPos;

void main()
{
	vec3 worldPos, screenPos, clipPos;
	
	worldPos = mapToWorld(aMapCoord, uChunkCoord, uChunkSize, aHeight);
	screenPos = worldToScreen(worldPos, uZoom, uCameraPos);
	clipPos = screenToClip(screenPos, uScreenSize);
	
	vGlobalMapCoord =
		aMapCoord +
		vec2(0.5 * mod(aMapCoord.y, 2.0), 0) +
		uChunkCoord * uChunkSize * vec2(1.0, 2.0)
	;
	
	vMapCoord = aMapCoord;
	vMapCoord.x += 0.5 * mod(aMapCoord.y, 2.0);
	vWorldPos = worldPos;
	vClipPos = clipPos;
	
	gl_Position = vec4(clipPos, 1.0);
}
