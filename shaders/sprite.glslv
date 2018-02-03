attribute float aVert;
attribute vec2 aPos;
attribute vec2 aSize;
attribute vec2 aAnchor;
attribute vec2 aTexCoordPos;
attribute vec2 aTexCoordSize;
attribute float aTexId;

uniform vec2 uScreenSize;
uniform vec2 uCameraPos;
uniform float uDefZoom;
uniform float uZoom;

varying vec2 vTexCoord;
varying float vTexId;

void main()
{
	float scale = uZoom / uDefZoom;
	
	vec2 vert = vec2(mod(aVert, 2.0), floor(aVert/2.0));
	
	vec2 pos = aPos / vec2(1.0, 2.0) + vec2(0.5 * mod(aPos.y, 2.0), 0.0);
	
	vec2 screenPos = (vert - aAnchor) * aSize * scale;
	screenPos += pos * uZoom;
	screenPos -= uCameraPos * uZoom;
	screenPos += uScreenSize / vec2(2.0);
	
	vec2 clipPos = screenPos * vec2(+2.0, -2.0) / uScreenSize + vec2(-1.0, +1.0);
	
	vTexCoord = aTexCoordPos + aTexCoordSize * vert;
	vTexId = aTexId;
	
	float z = aPos.y / 32.0;
	
	//gl_Position = vec4(clipPos, screenPos.y / uScreenSize.y, 1.0);
	gl_Position = vec4(clipPos, -z, 1.0);
}
