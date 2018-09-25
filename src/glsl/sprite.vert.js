export default `
	precision highp float;
	
	uniform sampler2D frametex;
	uniform vec2 framedataSize;
	uniform vec2 camPos;
	uniform vec2 screenSize;
	uniform float scale;
	uniform float zoom;

	attribute vec2 vert;
	attribute vec2 flatPos;
	attribute float texId;
	attribute float frameId;
	
	varying vec2 texCoord;
	varying float vTexId;

	void main()
	{
		if(texId == 0.0) {
			gl_Position = vec4(0, 0, 0, 1);
			texCoord = vec2(0);
			vTexId = 0.0;
		}
		else {
			vec2 frameTexCoord = vec2(frameId, (texId - 1.0) * 4.0);
		
			vec4 framedata1 = texture2D(frametex, (frameTexCoord + vec2(0, 0)) / framedataSize);
			vec4 framedata2 = texture2D(frametex, (frameTexCoord + vec2(0, 1)) / framedataSize);
			vec4 framedata3 = texture2D(frametex, (frameTexCoord + vec2(0, 2)) / framedataSize);
			vec4 framedata4 = texture2D(frametex, (frameTexCoord + vec2(0, 3)) / framedataSize);
		
			vec2 texPos  = (framedata1.rb + framedata1.ga * 256.0) * 255.0 / 65535.0;
			vec2 texSize = (framedata2.rb + framedata2.ga * 256.0) * 255.0 / 65535.0;
			vec2 size    = (framedata3.rb + framedata3.ga * 256.0) * 255.0;
			vec2 anchor  = (framedata4.rb + framedata4.ga * 256.0) * 255.0 / 65535.0;
		
			vec2 originPos = (flatPos - camPos) * zoom;
			vec2 screenPos = (vert - anchor) * size * scale + originPos;
			vec2 clipPos   = screenPos * vec2(2, -2) / screenSize;
		
			gl_Position = vec4(clipPos, originPos.y / screenSize.y, 1);
		
			texCoord = texPos + vert * texSize;
			vTexId   = texId - 1.0;
		}
	}
`;
