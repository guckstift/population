export default `
	precision highp float;
	
	uniform vec2 camPos;
	uniform vec2 screenSize;
	uniform float scale;
	uniform float zoom;

	attribute vec2 vert;
	attribute vec2 anchor;
	attribute vec2 size;
	attribute vec2 flatPos;
	attribute vec2 texPos;
	attribute vec2 texSize;
	attribute float texId;
	attribute float opacity;
	
	varying vec2 texCoord;
	varying float vTexId;
	varying float vOpacity;

	void main()
	{
		vec2 originPos = (flatPos - camPos) * zoom;
		vec2 screenPos = (vert - anchor) * size * scale + originPos;
		vec2 clipPos = screenPos * vec2(2, -2) / screenSize;
		
		gl_Position = vec4(clipPos, originPos.y / screenSize.y, 1);
		
		texCoord = texPos + vert * texSize;
		vTexId = texId;
		vOpacity = opacity;
	}
`;
